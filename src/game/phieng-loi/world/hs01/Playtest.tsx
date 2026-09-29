import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type Phaser from 'phaser';
import { PhaserHost } from '../../PhaserHost';
import type { FoundationHandle, SceneContext } from '../../contracts';
import { createDiagnostics } from '../../dev/FoundationProbe';
import { HeeSunReveal } from '../../reveal/HeeSunReveal';
import { REVEAL_ASSETS } from '../../reveal/config';
import { PresentationFlow, type Completion } from '../../flow/PresentationFlow';
import { MangaViewer } from '../../manga/MangaViewer';
import first from '../../manga/assets/heesun-01.png';
import second from '../../manga/assets/heesun-02.png';
import third from '../../manga/assets/heesun-03.png';
import stand from './assets/player-stand.png';
import wav from './assets/blackout.wav';
import { BlackoutAudio } from './BlackoutAudio';
import { EncounterScene, PLAYER_TEXTURE } from './EncounterScene';
import type { EntryConfig } from './Encounter';
import type { Point } from '../config';
import './playtest.css';
interface Binding {context:SceneContext;scene:Phaser.Scene;flow:PresentationFlow;reveal:HeeSunReveal;audio:BlackoutAudio;encounter:EncounterScene|null;clean:boolean}
interface QaOptions {renderer?:'auto'|'canvas';rng?:number;entry?:EntryConfig}
interface Api {snapshot:()=>unknown;reenter:(options?:QaOptions)=>void;synthetic:(delta:number,vector:Point)=>void;lateDelivery:()=>()=>void;handoff:(session:number,run:number)=>void}
declare global {interface Window {__TASK05_DEV__?:Api}}
const pages=[first,second,third];
const manifest=[...REVEAL_ASSETS,{key:PLAYER_TEXTURE,path:stand.replace(/^\//,'')}];
export default function Playtest() {
  const [diagnostics]=useState(createDiagnostics);
  const [generation,setGeneration]=useState(0),[mounted,setMounted]=useState(true),[ready,setReady]=useState(false);
  const [,refresh]=useState(0);const [engineError,setEngineError]=useState('');
  const current=useRef<Binding|null>(null),handle=useRef<FoundationHandle|null>(null),last=useRef<FoundationHandle|null>(null);
  const history=useRef<EncounterScene[]>([]),options=useRef<QaOptions>({}),reasons=useRef({manual:false,hidden:document.hidden});
  const alive=useRef(true),lastRefresh=useRef(0);
  const changed=(force=false):void=>{if(alive.current&&(force||performance.now()-lastRefresh.current>90)){lastRefresh.current=performance.now();refresh(n=>n+1);}};
  const sync=():void=>{
    const b=current.current;if(!b||!handle.current)return;
    const f=b.flow.inspect();
    if(f.paused||!['REVEAL','HANDOFF'].includes(f.phase))handle.current.pause();else handle.current.resume();
    changed(true);
  };
  const deliver=(b:Binding,event:Completion):void=>{b.flow.receive(event);sync();};
  const attachScene=(scene:Phaser.Scene,context:SceneContext):void=>{
    const b={} as Binding;b.context=context;b.scene=scene;b.encounter=null;b.clean=false;
    b.audio=new BlackoutAudio(wav,(type,data)=>{b.encounter?.model.log(type,data);changed(true);},
      ()=>b.encounter?.model.audioEnded(context.sessionId,b.encounter.run),
      message=>{b.encounter?.model.fail(message);changed(true);});
    b.flow=new PresentationFlow(context.sessionId,()=>{sync();},request=>{
      const state=b.reveal.inspect();b.clean=state.rootCount===0&&state.auraCount===0&&state.sceneObjects===0&&state.sceneTweens===0&&!document.querySelector('.hs-manga-viewer');
      if(!b.clean){b.flow.fail('Upstream cleanup incomplete');return;}
      if(b.encounter){b.encounter.accept(request);return;}
      const rng=options.current.rng;
      b.encounter=new EncounterScene(scene,context,1,b.audio,()=>changed(),rng===undefined?Math.random:()=>rng,options.current.entry,request.mangaRunId);
      history.current.push(b.encounter);
      b.encounter.pause('manual',reasons.current.manual);b.encounter.pause('hidden',reasons.current.hidden);
      b.encounter.accept(request);sync();
    });
    b.reveal=new HeeSunReveal(scene,{fps:15,x:820,y:630,onComplete:event=>{
      const state=b.reveal.inspect();deliver(b,{...event,flowSessionId:context.sessionId,clean:state.rootCount===0&&state.auraCount===0&&state.sceneObjects===0&&state.sceneTweens===0});
    }});
    current.current=b;b.flow.setPaused('manual',reasons.current.manual);b.flow.setPaused('hidden',reasons.current.hidden);
    const stop=():void=>{scene.events.off('shutdown',stop);scene.events.off('destroy',stop);b.flow.dispose();b.reveal.dispose();b.encounter?.dispose();b.audio.dispose();};
    scene.events.once('shutdown',stop);scene.events.once('destroy',stop);changed(true);
  };
  const pause=(owner:'manual'|'hidden',value:boolean):void=>{
    reasons.current[owner]=value;const b=current.current;
    b?.flow.setPaused(owner,value);b?.encounter?.pause(owner,value);
    if(b&&!b.encounter)b.audio.pause(reasons.current.manual||reasons.current.hidden);
    sync();
  };
  const cancel=():void=>{const b=current.current;b?.flow.cancel();b?.reveal.cancel();b?.encounter?.dispose();b?.audio.dispose();sync();};
  const reenter=(next:QaOptions={}):void=>{
    cancel();void handle.current?.dispose();options.current=next;current.current=null;setReady(false);setEngineError('');setGeneration(n=>n+1);setMounted(true);
  };
  useEffect(()=>{
    alive.current=true;
    const hidden=():void=>pause('hidden',document.hidden),hide=():void=>pause('hidden',true);
    document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',hidden);
    const api:Api={snapshot:()=>({flow:current.current?.flow.inspect()??null,reveal:current.current?.reveal.inspect()??null,
      encounter:current.current?.encounter?.inspect()??null,audio:current.current?.audio.inspect()??null,
      clean:current.current?.clean??false,runtime:(handle.current??last.current)?.inspect()??null,foundation:diagnostics,history:history.current.map(h=>h.inspect())}),
      reenter,synthetic:(delta,vector)=>current.current?.encounter?.synthetic(delta,vector),
      lateDelivery:()=>current.current?.encounter?.lateDelivery()??(()=>{}),
      handoff:(session,run)=>current.current?.encounter?.accept({type:'chase_requested',flowSessionId:session,mangaRunId:run})};
    window.__TASK05_DEV__=api;
    return()=>{alive.current=false;document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',hidden);
      const b=current.current;b?.flow.dispose();b?.reveal.dispose();b?.encounter?.dispose();b?.audio.dispose();
      if(window.__TASK05_DEV__===api)delete window.__TASK05_DEV__;
    };
  },[]);
  const start=():void=>{const b=current.current;if(!ready||!b||b.flow.inspect().phase!=='IDLE'||b.flow.inspect().paused)return;
    b.audio.unlock();handle.current?.resume();try{if(b.reveal.play())b.flow.start(b.reveal.inspect().runId);}catch(e){b.flow.fail(String(e));}sync();};
  const b=current.current,f=b?.flow.inspect(),m=b?.encounter?.model;
  const paused=reasons.current.manual||reasons.current.hidden;
  const blackout=m&&['BLACK_AUDIO','BLACK_PREPARE','FADE_OUT','FADE_IN'].includes(m.phase);
  return <>
    {mounted&&<PhaserHost key={generation} options={{manifest,dev:{diagnostics,renderer:options.current.renderer??'auto',attachScene}}}
      onHandle={h=>{handle.current=h;if(h)last.current=h;}}
      onStatus={s=>{if(s.state==='ready'){setReady(true);sync();}if(s.state==='error'){setEngineError(s.message??'Engine failed');setReady(false);}}}/>}
    <aside className="t05-tools">
      <strong>Task 05 · DEV</strong><span data-testid="t05-phase">{m?.phase??f?.phase??'BOOTING'}</span>
      <button onClick={start} disabled={!ready||f?.phase!=='IDLE'||paused}>Start</button>
      <button onClick={()=>pause('manual',true)}>Pause</button><button onClick={()=>pause('manual',false)}>Resume</button>
      <button onClick={cancel}>Cancel</button><button onClick={()=>{cancel();setMounted(false);void handle.current?.dispose();setReady(false);}}>Unmount</button>
      <button onClick={()=>reenter()}>Re-enter</button>
      <button onClick={()=>{b?.encounter?b.encounter.retry():b?.audio.retry();changed(true);}}>Retry audio / phase</button>
      {f?.phase==='MANGA'&&<button onClick={()=>b?.flow.retryManga()}>Retry manga</button>}
      <Link to="/">Exit route</Link>
      {(engineError||m?.error||b?.audio.error)&&<p role="alert">{engineError||m?.error||b?.audio.error}</p>}
    </aside>
    {m&&!blackout&&<div className="t05-hud"><span data-testid="t05-balance">{m.balance} xu · DEV fixture</span>
      <span>{m.phase==='DRUNK'?'Đang say · MOVE đảo hướng':m.phase==='COMPLETE'?'Đã hồi phục':m.phase==='CHASE'?'HeeSun đang đuổi':'Đang tỉnh dậy'}</span></div>}
    {m?.phase==='CHASE'&&<button className="t05-call" disabled={paused} onClick={e=>{b?.encounter?.call(e.nativeEvent.isTrusted);changed(true);}}>PHÀ ƠI</button>}
    {f?.phase==='MANGA'&&b&&<div className="t05-manga"><MangaViewer key={`${f.sessionId}:${f.mangaRun}`} pages={pages} runId={f.mangaRun} paused={f.paused}
      onComplete={event=>deliver(b,{...event,flowSessionId:b.context.sessionId,clean:!document.querySelector('.hs-manga-viewer')})}/></div>}
  </>;
}
