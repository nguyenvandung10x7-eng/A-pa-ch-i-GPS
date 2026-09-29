import Phaser from 'phaser';
import type { SceneContext } from '../../contracts';
import type { ChaseRequest } from '../../flow/PresentationFlow';
import { WorldController } from '../WorldController';
import { APPROVED, type Point } from '../config';
import frames from './assets/frames.json';
import { Encounter, type EntryConfig, type RecordEvent } from './Encounter';
import type { BlackoutAudio } from './BlackoutAudio';
export const PLAYER_TEXTURE='pl:v2:hs01:player-stand';
/** Uses Task04's input/clock/world and adds one encounter driver, not a second loop. */
export class EncounterScene {
  readonly model:Encounter;
  readonly world:WorldController;
  private objects:Phaser.GameObjects.GameObject[]=[];
  private sprite:Phaser.GameObjects.Sprite|null=null;
  private npc:Phaser.GameObjects.Container|null=null;
  private blackout:Phaser.GameObjects.Rectangle|null=null;
  private alive=true; private animationToken=0; private animated=false; private frameHistory:number[]=[];private rendered:number[]=[];
  private onChange:()=>void;
  private worldEvents:{type:string;data:Record<string,unknown>}[]=[];
  constructor(private scene:Phaser.Scene,private context:SceneContext,readonly run:number,private audio:BlackoutAudio,
    changed:()=>void,rng:()=>number=Math.random,entry?:EntryConfig,expectedMangaRun=1) {
    this.onChange=changed;
    this.model=new Encounter(context.sessionId,run,e=>this.event(e),rng,entry,expectedMangaRun);
    this.world=new WorldController(scene,context,run,structuredClone(APPROVED),(type,data)=>{
      this.worldEvents.push({type,data});
      if(type==='world_error')this.model.fail(String(data.message));
    });
    this.world.setDriver((delta,vector)=>this.tick(delta,vector));
    this.world.setInputEnabled(false);
    const dot=scene.add.circle(0,0,12,0xe87a97).setStrokeStyle(2,0xffd3de);
    const name=scene.add.text(0,-34,'HeeSun · DEV',{fontSize:'17px',color:'#ffd3de'}).setOrigin(.5,1);
    this.npc=scene.add.container(this.model.npc.x,this.model.npc.y,[dot,name]);
    this.blackout=scene.add.rectangle(0,0,1280,720,0x000000).setOrigin(0,0).setDepth(100).setAlpha(0);
    this.objects=[this.npc,this.blackout];
    if(context.diagnostics)context.diagnostics.objects+=this.objects.length;
    scene.events.once('shutdown',this.dispose);scene.events.once('destroy',this.dispose);
    scene.game.events.on('postrender',this.renderedFrame);
  }
  private event(e:RecordEvent):void {
    if(!this.alive)return;
    if(e.type==='phase') {
      this.world?.clearInput();
      if(e.phase==='BLACK_AUDIO'){
        if(this.audio.error)this.model.fail(this.audio.error);else this.audio.play();
      }
      if(e.phase==='BLACK_PREPARE')this.audio.dispose();
    }
    this.onChange?.();
  }
  accept(request:ChaseRequest):void {this.model.accept(request);this.sync();}
  call(trusted:boolean):void {if(this.alive)this.model.requestCall(trusted);}
  private tick(delta:number,vector:Point):void {
    if(!this.alive||!this.context.isCurrent())return;
    this.model.advance(delta,vector);
    this.sync();
    if(this.model.phase==='BLACK_PREPARE'&&!this.model.paused) {
      try{this.prepareSprite();this.model.wakeReady();this.sync();}catch(e){this.model.fail(String(e));}
    }
    if(this.model.phase==='STAND_UP'&&!this.animated&&!this.model.paused)this.startAnimation();
    this.onChange();
  }
  private prepareSprite():void {
    if(this.sprite)return;
    if(!this.scene.textures.exists(PLAYER_TEXTURE))throw Error('Missing stand-up texture');
    const texture=this.scene.textures.get(PLAYER_TEXTURE);
    for(const frame of frames.frames)if(!texture.has(frame.name))texture.add(frame.name,0,frame.x,frame.y,frame.width,frame.height);
    this.sprite=this.scene.add.sprite(this.model.player.x,this.model.player.y,PLAYER_TEXTURE,frames.frames[0].name)
      .setOrigin(.5,1).setScale(frames.scale).setDepth(3).setName('task05-player-with-scarf-pumpkin');
    this.objects.push(this.sprite);if(this.context.diagnostics)this.context.diagnostics.objects++;
    this.model.log('wake_visual_ready',{texture:PLAYER_TEXTURE,frame:0,origin:{x:.5,y:1},scale:frames.scale});
  }
  private startAnimation():void {
    const sprite=this.sprite;if(!sprite){this.model.fail('Stand-up sprite missing');return;}
    this.animated=true;const token=++this.animationToken;
    const key='task05-stand';
    if(!sprite.anims.exists(key))sprite.anims.create({key,frames:frames.frames.map(f=>({key:PLAYER_TEXTURE,frame:f.name})),frameRate:frames.fps,repeat:0,skipMissedFrames:false});
    sprite.on('animationstart',this.recordFrame);sprite.on('animationupdate',this.recordFrame);
    sprite.once('animationcomplete',()=>{
      if(!this.alive||token!==this.animationToken||!this.context.isCurrent())return;
      sprite.off('animationstart',this.recordFrame);sprite.off('animationupdate',this.recordFrame);
      this.model.standComplete(this.context.sessionId,this.run);
      this.model.enableControl();this.sync();this.onChange();
    });
    sprite.play(key);
  }
  private recordFrame=():void=>{
    const index=this.sprite?.anims.currentFrame?.index;
    if(index&&this.frameHistory.at(-1)!==index){this.frameHistory.push(index);this.model.log('animation_frame',{index});}
  };
  private renderedFrame=():void=>{
    if(!this.alive||this.model.phase!=='STAND_UP')return;
    const index=this.sprite?.anims.currentFrame?.index;
    if(index&&this.rendered.at(-1)!==index)this.rendered.push(index);
  };
  private sync():void {
    if(!this.alive)return;
    this.world.setInputEnabled(this.model.movable);this.world.placeFromDriver(this.model.player);
    this.world.setMarkerVisible(!this.sprite);
    this.npc?.setPosition(this.model.npc.x,this.model.npc.y).setVisible(!this.model.captureId);
    this.sprite?.setPosition(this.model.player.x,this.model.player.y);
    this.blackout?.setAlpha(this.model.alpha);
    if(this.model.phase==='ERROR'||this.model.paused)this.sprite?.anims.pause();
  }
  pause(owner:string,value:boolean):void {
    if(!this.alive)return;this.model.setPause(owner,value);this.world.setPause(owner,value);
    this.audio.pause(this.model.paused);
    if(this.model.paused)this.sprite?.anims.pause();else this.sprite?.anims.resume();
    this.sync();
  }
  retry():void {
    if(!this.alive)return;this.audio.retry();this.model.retry();
    if(this.model.phase==='BLACK_AUDIO')this.audio.play();
    if(!this.model.paused)this.sprite?.anims.resume();
    this.sync();
  }
  /** QA boundary delivery only; the browser success path never calls this. */
  synthetic(delta:number,vector:Point):void {if(this.alive){this.model.advance(delta,vector,'synthetic');this.sync();}}
  lateDelivery():()=>void {const s=this.context.sessionId,r=this.run;return()=>{this.model.audioEnded(s,r);this.model.standComplete(s,r);};}
  dispose=():void=>{
    if(!this.alive)return;this.alive=false;this.animationToken++;
    this.model.dispose();this.audio.dispose();this.world.dispose();
    this.scene.events.off('shutdown',this.dispose);this.scene.events.off('destroy',this.dispose);
    this.scene.game.events.off('postrender',this.renderedFrame);
    this.sprite?.removeAllListeners();this.sprite?.anims?.stop();
    if(this.context.diagnostics)this.context.diagnostics.objects-=this.objects.length;
    for(const o of this.objects)o.destroy();this.objects=[];this.sprite=null;this.npc=null;this.blackout=null;
    this.onChange();
  };
  inspect(){return {model:this.model.inspect(),world:this.world.inspect(),audio:this.audio.inspect(),worldEvents:[...this.worldEvents],
    frameHistory:[...this.frameHistory],renderedFrames:[...this.rendered],renderer:this.scene.game.renderer?.type===Phaser.WEBGL?'webgl':'canvas',
    sprite:this.sprite?{x:this.sprite.x,y:this.sprite.y,frame:this.sprite.frame.name,originX:this.sprite.originX,originY:this.sprite.originY,scale:this.sprite.scaleX,visible:this.sprite.visible}:null,
    owned:{objects:this.objects.length,bindings:this.alive?3:0,animationCallbacks:this.alive&&this.animated&&this.model.phase==='STAND_UP'?3:0}};}
}
