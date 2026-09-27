import type Phaser from 'phaser';
import type { SceneContext } from '../contracts';
import { geometry, legal, validate, type Point, type WorldConfig } from './config';
import { sweep } from './collision';
export interface WorldEvent {seq:number;run:number;session:number;type:string;data:Record<string,unknown>}
export interface Injection {position:Point;pointer:Point;delta:number;session:number;run:number}
export class WorldController {
  readonly session:number;
  private alive=true;
  private ready=false;
  private error='';
  private actor:Phaser.GameObjects.Container|null=null;
  private objects:Phaser.GameObjects.GameObject[]=[];
  private dom:(()=>void)[]=[];
  private bindings:(()=>void)[]=[];
  private pauses=new Set<string>();
  private locks=new Set<string>();
  private pointer:number|null=null;
  private vector:Point={x:0,y:0};
  private position:Point;
  private activeMs=0;
  private updates=0;
  private staleRejected=0;
  constructor(private scene:Phaser.Scene,private context:SceneContext,readonly run:number,private config:WorldConfig,
    private emit:(type:string,data:Record<string,unknown>,controller:WorldController)=>void) {
    this.session=context.sessionId;this.position={...config.spawn};
    // Cleanup is bound even when validation fails.
    this.bind(scene.events,'shutdown',()=>this.dispose());
    this.bind(scene.events,'destroy',()=>this.dispose());
    try {validate(config);} catch(e) {this.fail(String(e));return;}
    const b=config.bounds,o=config.obstacle,s=config.stick;
    const world=scene.add.graphics().lineStyle(2,0x75cbd5).strokeRect(b.left,b.top,b.right-b.left,b.bottom-b.top)
      .fillStyle(0x8d5940).fillRect(o.left,o.top,o.right-o.left,o.bottom-o.top);
    const stick=scene.add.graphics().lineStyle(2,0x75cbd5).strokeCircle(s.x,s.y,s.radius).lineStyle(1,0x888888).strokeCircle(s.x,s.y,s.hit).strokeCircle(s.x,s.y,s.dead);
    const knob=scene.add.circle(s.x,s.y,12,0xf1bb62);
    const footprint=scene.add.graphics().lineStyle(1,0xf1bb62).strokeRect(-12,-8,24,16).fillStyle(0xffffff).fillCircle(0,0,4);
    this.actor=scene.add.container(this.position.x,this.position.y,[footprint]).setName('task04-player-footpoint');
    this.objects=[world,stick,knob,this.actor];
    if(context.diagnostics) context.diagnostics.objects+=this.objects.length;
    scene.cameras.main.setScroll(0,0).setZoom(1).setRotation(0);
    this.bind(scene.events,'update',(_time:number,delta:number)=>this.step(delta,'native'));
    this.bind(scene.events,'pause',()=>this.clear('scene_pause'));
    this.bind(scene.scale,'resize',()=>this.mapping());
    const canvas=scene.game.canvas;
    this.listen(canvas,'pointerdown',(e)=>this.down(e as PointerEvent));
    this.listen(window,'pointermove',(e)=>this.move(e as PointerEvent));
    this.listen(window,'pointerup',(e)=>this.release(e as PointerEvent));
    this.listen(window,'pointercancel',(e)=>this.release(e as PointerEvent));
    this.listen(canvas,'lostpointercapture',(e)=>this.release(e as PointerEvent));
    this.listen(window,'blur',()=>this.clear('blur'));
    this.listen(window,'resize',()=>this.mapping());
    this.listen(document,'visibilitychange',()=>{if(document.hidden)this.clear('hidden');});
    this.listen(window,'pagehide',()=>this.clear('pagehide'));
    this.ready=true;this.event('world_ready',{configId:config.configId,position:{...this.position}});
  }
  private bind<T extends unknown[]>(emitter:Phaser.Events.EventEmitter,name:string,fn:(...args:T)=>void):void {
    emitter.on(name,fn);this.bindings.push(()=>emitter.off(name,fn));
    if(this.context.diagnostics)this.context.diagnostics.sceneListeners++;
  }
  private listen(target:EventTarget,name:string,fn:EventListener):void {target.addEventListener(name,fn);this.dom.push(()=>target.removeEventListener(name,fn));}
  private event(type:string,data:Record<string,unknown>={}):void {this.emit(type,data,this);}
  private current():boolean {return this.alive && this.context.isCurrent();}
  private active():boolean {return this.current() && this.ready && !this.error && this.pauses.size===0 && this.locks.size===0 && !this.scene.game.isPaused;}
  private map(e:PointerEvent):Point|null {
    const r=this.scene.game.canvas.getBoundingClientRect();
    if(!r.width || !r.height || e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom)return null;
    return {x:(e.clientX-r.left)*1280/r.width,y:(e.clientY-r.top)*720/r.height};
  }
  private analog(q:Point):Point {
    const s=this.config.stick,x=q.x-s.x,y=q.y-s.y,r=Math.hypot(x,y);
    if(r<=s.dead || r>s.hit)return {x:0,y:0};
    const m=Math.min(1,(r-s.dead)/(s.radius-s.dead));return {x:x/r*m,y:y/r*m};
  }
  private down(e:PointerEvent):void {
    if(!this.active() || this.pointer!==null || e.button!==0)return;
    const q=this.map(e);if(!q || Math.hypot(q.x-this.config.stick.x,q.y-this.config.stick.y)>this.config.stick.hit)return;
    e.preventDefault();this.pointer=e.pointerId;this.vector=this.analog(q);
    this.scene.game.canvas.setPointerCapture(e.pointerId);
    this.event('input_started',{raw:q,trusted:e.isTrusted,pointer:e.pointerId,vector:{...this.vector}});
  }
  private move(e:PointerEvent):void {
    if(e.pointerId!==this.pointer)return;
    const q=this.map(e);if(!this.active() || !q || Math.hypot(q.x-this.config.stick.x,q.y-this.config.stick.y)>this.config.stick.hit) {this.clear('outside_or_inactive');return;}
    this.vector=this.analog(q);this.event('input_changed',{raw:q,trusted:e.isTrusted,vector:{...this.vector}});
  }
  private release(e:PointerEvent):void {if(e.pointerId===this.pointer)this.clear(e.type);}
  private clear(reason:string):void {
    const id=this.pointer;this.pointer=null;this.vector={x:0,y:0};
    if(id!==null) {
      const canvas=this.scene.game.canvas;if(canvas?.hasPointerCapture(id))canvas.releasePointerCapture(id);
      this.event('input_cleared',{reason});
    }
  }
  private mapping():void {if(!this.current())return;this.clear('mapping');this.event('mapping_changed',{position:{...this.position}});}
  setPause(reason:string,value:boolean):void {
    if(!this.alive)return;
    if(value)this.pauses.add(reason);else this.pauses.delete(reason);
    if(value)this.clear('pause');this.event('pause_changed',{reasons:[...this.pauses]});
  }
  lock(owner:string,value:boolean):void {
    if(!this.alive)return;
    if(value)this.locks.add(owner);else this.locks.delete(owner);
    if(value)this.clear('lock');this.event('lock_changed',{owners:[...this.locks]});
  }
  private fail(message:string):void {this.error=message;this.clear('error');this.event('world_error',{message});}
  private step(delta:number,source:'native'|'synthetic',vector=this.vector):void {
    if(!this.active())return;
    if(!Number.isFinite(delta)||delta<0||delta>1000) {this.fail('Invalid DEV active delta');return;}
    const g=geometry(this.config);
    if(!legal(this.position,g)) {this.fail('Invalid runtime position');return;}
    this.updates++;this.activeMs+=delta;
    if(vector.x===0 && vector.y===0)return;
    const start={...this.position},desired={x:vector.x*this.config.maxSpeed*delta/1000,y:vector.y*this.config.maxSpeed*delta/1000};
    const result=sweep(start,desired,g.bounds,g.obstacle);
    this.position=result.position;this.actor?.setPosition(this.position.x,this.position.y);
    this.event('movement',{source,delta,start,desired,end:{...this.position},fraction:result.fraction,vector:{...vector}});
  }
  synthetic(i:Injection):void {
    if(!this.current() || i.run!==this.run || i.session!==this.session) {this.staleRejected++;return;}
    if(!this.active())return;
    if(!legal(i.position,geometry(this.config))) {this.fail('Invalid synthetic starting position');return;}
    this.position={...i.position};this.actor?.setPosition(i.position.x,i.position.y);
    this.step(i.delta,'synthetic',this.analog(i.pointer));
  }
  lateDelivery():()=>void {
    const input:Injection={position:{...this.position},pointer:{x:this.config.stick.x+this.config.stick.radius,y:this.config.stick.y},delta:100,session:this.session,run:this.run};
    return ()=>this.synthetic(input);
  }
  dispose():void {
    if(!this.alive)return;
    this.alive=false;this.event('world_invalidated');this.clear('dispose');
    for(const remove of this.dom)remove();this.dom=[];
    for(const remove of this.bindings) {remove();if(this.context.diagnostics)this.context.diagnostics.sceneListeners--;}
    this.bindings=[];
    if(this.context.diagnostics)this.context.diagnostics.objects-=this.objects.length;
    for(const o of this.objects)o.destroy();this.objects=[];this.actor=null;
    this.event('world_disposed');
  }
  inspect() {
    const camera=this.scene.cameras?.main;
    return {configId:this.config.configId,session:this.session,run:this.run,ready:this.ready,
      lifecycle:!this.alive?'DISPOSED':this.error?'ERROR':this.pauses.size||this.locks.size?'PAUSED':this.ready?'ACTIVE':'BOOTING',
      error:this.error,position:{...this.position},actorPosition:this.actor?{x:this.actor.x,y:this.actor.y,name:this.actor.name}:null,
      pointer:this.pointer,vector:{...this.vector},pauseReasons:[...this.pauses],moveLockReasons:[...this.locks],activeMs:this.activeMs,updates:this.updates,staleRejected:this.staleRejected,
      owned:{objects:this.objects.length,domListeners:this.dom.length,sceneBindings:this.bindings.length},sceneObjects:this.scene.children?.length??0,
      footprint:this.config.footprint,gap:this.config.gap,camera:camera?{scrollX:camera.scrollX,scrollY:camera.scrollY,zoom:camera.zoom,rotation:(camera as typeof camera & { rotation:number }).rotation}:null};
  }
}
