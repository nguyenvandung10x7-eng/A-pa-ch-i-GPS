import { APPROVED, type Point } from '../config';
import type { ChaseRequest } from '../../flow/PresentationFlow';
import { CONFIG, validDelta, validPoint } from './config';
import { contactTime, npcPath, obstructed, playerPath, positionAt } from './motion';
export type Phase = 'IDLE'|'CHASE'|'CAPTURE_HOLD'|'FADE_OUT'|'BLACK_AUDIO'|'BLACK_PREPARE'|'FADE_IN'|'STAND_UP'|'DRUNK'|'COMPLETE'|'ERROR'|'CANCELLED'|'DISPOSED';
export interface EntryConfig { player:Point; npc:Point; balance:number }
export interface RecordEvent {seq:number;type:string;session:number;run:number;phase:Phase;at:number;data:Record<string,unknown>}
/** Pure encounter transaction/active clock. No DOM, audio timer or synthetic success path. */
export class Encounter {
  phase:Phase='IDLE'; player:Point; npc:Point; balance:number;
  phaseMs=0; activeMs=0; cooldownUntil=0; captureId=0; completions=0; cause=''; error='';
  wakeCommitted=false; drank=false; animationReady=false; controlReady=false;
  private pauses=new Set<string>(); private call:number|null=null; private pending:ChaseRequest|null=null;
  private failedPhase:Phase='IDLE'; private deferDrunk=false; private events:RecordEvent[]=[];
  constructor(readonly session:number, readonly run:number, private notify:(event:RecordEvent)=>void,
    private rng:()=>number=Math.random, readonly entry:EntryConfig={player:CONFIG.playerSpawn,npc:CONFIG.npcSpawn,balance:CONFIG.initialBalance},readonly expectedMangaRun=1) {
    this.player={...entry.player};this.npc={...entry.npc};this.balance=entry.balance;
    if(!validPoint(this.player)||!validPoint(this.npc)||!Number.isSafeInteger(this.balance)||this.balance<0)this.fail('Invalid encounter entry');
  }
  log(type:string,data:Record<string,unknown>={}):void {
    const e={seq:this.events.length+1,type,session:this.session,run:this.run,phase:this.phase,at:this.activeMs,data};
    this.events.push(e); this.notify(e);
  }
  private transition(phase:Phase):void {this.phase=phase;this.phaseMs=0;this.log('phase',{phase});}
  get paused():boolean {return this.pauses.size>0;}
  get movable():boolean {return !this.paused && ['CHASE','DRUNK','COMPLETE'].includes(this.phase);}
  get alpha():number {return this.phase==='FADE_OUT'?this.phaseMs/CONFIG.fadeMs:this.phase==='FADE_IN'?1-this.phaseMs/CONFIG.fadeMs:['BLACK_AUDIO','BLACK_PREPARE'].includes(this.phase)?1:0;}
  accept(request:ChaseRequest):void {
    if(request.type!=='chase_requested'||request.flowSessionId!==this.session||request.mangaRunId!==this.expectedMangaRun||this.phase!=='IDLE'||this.pending){this.log('handoff_rejected');return;}
    this.pending={...request}; this.log('handoff_accepted',{request});this.drain();
  }
  private drain():void {if(!this.paused&&this.pending&&this.phase==='IDLE'){this.pending=null;this.transition('CHASE');}}
  setPause(owner:string,value:boolean):void {
    if(['CANCELLED','DISPOSED'].includes(this.phase))return;
    if(value)this.pauses.add(owner);else this.pauses.delete(owner);
    this.call=null;this.log('pause',{owners:[...this.pauses]});this.drain();this.tryDrunk();
  }
  requestCall(trusted:boolean):void {
    if(this.phase!=='CHASE'||this.paused||this.call!==null||this.activeMs<this.cooldownUntil){this.log('call_rejected',{trusted,reason:'phase_pause_pending_lock'});return;}
    const value=this.rng();if(!Number.isFinite(value)||value<0||value>=1){this.fail('Invalid RNG');return;}
    this.cooldownUntil=this.activeMs+CONFIG.cooldownMs;this.call=value;
    this.log('call_accepted',{trusted,outcome:value<CONFIG.trueNothing?'TRUE_NOTHING':'normal',rng:value,cooldownUntil:this.cooldownUntil});
  }
  private capture(cause:string):void {
    if(this.phase!=='CHASE'||this.captureId||this.paused)return;
    this.captureId=1;this.cause=cause;this.call=null;
    this.log('capture',{captureId:this.captureId,cause});this.transition('CAPTURE_HOLD');
  }
  advance(delta:number,raw:Point,source='native'):void {
    if(this.paused||['IDLE','ERROR','CANCELLED','DISPOSED'].includes(this.phase))return;
    if(!validDelta(delta)){this.fail('Invalid DEV active delta');return;}
    if(!validPoint(this.player)||!validPoint(this.npc)){this.fail('Invalid runtime position');return;}
    if(!Number.isFinite(raw.x)||!Number.isFinite(raw.y)||Math.hypot(raw.x,raw.y)>1+1e-12){this.fail('Invalid input vector');return;}
    // The current native delta precedes the animation/control gate. It belongs
    // to the shared active/cooldown clock, but not to the new drunk duration.
    if(this.deferDrunk){this.deferDrunk=false;this.activeMs+=delta;this.log('drunk_clock_ready');this.log('drunk_started');return;}
    let left=delta;
    if(this.phase==='CHASE') {
      const pp=playerPath(this.player,raw,delta), np=npcPath(this.npc,this.player,delta), touch=contactTime(pp,np);
      const call=this.call;this.call=null;
      const distance=Math.hypot(this.player.x-this.npc.x,this.player.y-this.npc.y);
      const blocked=obstructed(this.player,this.npc,APPROVED.obstacle);
      const effective=call!==null&&call>=CONFIG.trueNothing&&distance<=CONFIG.near&&!blocked;
      // Input is sampled at this simulation boundary. Contact at t=0 wins a tie.
      const cause=touch===0?'body_contact':effective?'phao_heesun':touch!==null?'body_contact':null;
      const until=cause==='phao_heesun'?0:touch??delta;
      this.player=positionAt(pp,until);this.npc=positionAt(np,until);
      this.log('trajectory',{source,delta,raw,playerPath:pp,npcPath:np,touch,call,distance,blocked,until});
      this.activeMs+=until;left-=until;
      if(cause)this.capture(cause);else return;
    }
    // Consume each slice once. Clip and animation completion are external gates.
    while(left>0) {
      const phase=this.phase;
      if(['CAPTURE_HOLD','FADE_OUT','FADE_IN'].includes(phase)) {
        const duration=phase==='CAPTURE_HOLD'?CONFIG.holdMs:CONFIG.fadeMs;
        const used=Math.min(left,duration-this.phaseMs);this.phaseMs+=used;this.activeMs+=used;left-=used;
        if(this.phaseMs>=duration)this.transition(phase==='CAPTURE_HOLD'?'FADE_OUT':phase==='FADE_OUT'?'BLACK_AUDIO':'STAND_UP');
        continue;
      }
      if(phase==='DRUNK'||phase==='COMPLETE') {
        const used=phase==='DRUNK'?Math.min(left,CONFIG.drunkMs-this.phaseMs):left;
        const vector=phase==='DRUNK'?{x:-raw.x,y:-raw.y}:raw;
        const path=playerPath(this.player,vector,used);this.player=positionAt(path,used);
        this.log('player_move',{source,raw,vector,delta:used,path});this.phaseMs+=used;this.activeMs+=used;left-=used;
        if(phase==='DRUNK'&&this.phaseMs>=CONFIG.drunkMs){
          this.log('recovery');this.completions++;this.transition('COMPLETE');this.log('hs01_playtest_complete');
          // Input ownership was cleared by the phase transition. Count the
          // remainder as active normal time without reusing the old gesture.
          this.activeMs+=left;this.phaseMs+=left;
          if(left)this.log('recovery_remainder',{delta:left,inputCleared:true});return;
        }
        continue;
      }
      this.activeMs+=left;left=0;
    }
  }
  audioEnded(session:number,run:number):void {
    if(session!==this.session||run!==this.run||this.phase!=='BLACK_AUDIO'||this.paused){this.log('audio_callback_rejected');return;}
    this.log('audio_ended');this.transition('BLACK_PREPARE');
  }
  wakeReady():void {
    if(this.phase!=='BLACK_PREPARE'||this.paused)return;
    if(!this.wakeCommitted){const before=this.balance;this.balance=0;this.wakeCommitted=true;this.player={...CONFIG.recovery};this.log('wake_commit',{before,after:0,scarf:true,pumpkin:'in_hand',captureId:this.captureId});}
    this.transition('FADE_IN');
  }
  standComplete(session:number,run:number):void {
    if(session!==this.session||run!==this.run||this.phase!=='STAND_UP'||this.animationReady){this.log('animation_callback_rejected');return;}
    this.animationReady=true;this.drank=true;this.log('stand_up_complete');this.tryDrunk();
  }
  enableControl():void {if(this.phase==='STAND_UP'){this.controlReady=true;this.log('control_ready');this.tryDrunk();}}
  private tryDrunk():void {
    if(this.phase==='STAND_UP'&&this.animationReady&&this.controlReady&&!this.paused){this.transition('DRUNK');this.deferDrunk=true;}
  }
  fail(message:string):void {if(['CANCELLED','DISPOSED'].includes(this.phase))return;if(this.phase!=='ERROR')this.failedPhase=this.phase;this.error=message;this.call=null;this.phase='ERROR';this.log('error',{message,failedPhase:this.failedPhase});}
  retry():void {if(this.phase!=='ERROR'||this.paused)return;const p=this.failedPhase;this.error='';this.phase=p;this.log('retry',{phase:p});}
  cancel():void {if(this.phase==='DISPOSED')return;this.pending=null;this.call=null;this.transition('CANCELLED');}
  dispose():void {if(this.phase==='DISPOSED')return;this.pending=null;this.call=null;this.transition('DISPOSED');}
  inspect() {return {session:this.session,run:this.run,phase:this.phase,player:{...this.player},npc:{...this.npc},balance:this.balance,phaseMs:this.phaseMs,activeMs:this.activeMs,cooldownRemaining:Math.max(0,this.cooldownUntil-this.activeMs),captureId:this.captureId,cause:this.cause,completions:this.completions,drank:this.drank,wakeCommitted:this.wakeCommitted,paused:this.paused,pauseOwners:[...this.pauses],error:this.error,alpha:this.alpha,animationReady:this.animationReady,controlReady:this.controlReady,events:this.events.map(e=>({...e}))};}
}
