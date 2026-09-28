import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type Phaser from 'phaser';
import { PhaserHost } from '../PhaserHost';
import type { FoundationHandle, SceneContext } from '../contracts';
import { createDiagnostics } from '../dev/FoundationProbe';
import { fixture } from './config';
import { WorldController, type Injection, type WorldEvent } from './WorldController';
import './world-harness.css';
interface Api {
  snapshot:()=>unknown; reenter:(fault?:string,renderer?:'auto'|'canvas')=>void;
  pause:(value:boolean)=>void; lock:(owner:string,value:boolean)=>void;
  cancel:()=>void; unmount:()=>void; restart:()=>void;
  synthetic:(i:Injection)=>void; staleDelivery:()=>()=>void;
}
declare global {interface Window {__TASK04_WORLD_DEV__?:Api}}
export default function WorldHarness() {
  const [diagnostics]=useState(createDiagnostics);
  const [mounted,setMounted]=useState(true),[generation,setGeneration]=useState(0);
  const [selection,setSelection]=useState({fault:'approved',renderer:'auto' as 'auto'|'canvas'});
  const handle=useRef<FoundationHandle|null>(null),previous=useRef<FoundationHandle|null>(null);
  const controller=useRef<WorldController|null>(null),history=useRef<WorldController[]>([]);
  const reasons=useRef({manual:false,hidden:document.hidden});
  const events=useRef<WorldEvent[]>([]),sequence=useRef(0),runs=useRef(0),dropped=useRef(0);
  const emit=(type:string,data:Record<string,unknown>,world:WorldController):void=>{
    events.current.push({seq:++sequence.current,type,data,session:world.session,run:world.run});
    if(events.current.length>100000) {events.current.shift();dropped.current++;}
  };
  const attachScene=(scene:Phaser.Scene,context:SceneContext):void=>{
    if(!context.isCurrent())return;
    controller.current?.dispose();
    const world=new WorldController(scene,context,++runs.current,fixture(selection.fault),emit);
    controller.current=world;history.current.push(world);
    world.setPause('manual',reasons.current.manual);world.setPause('hidden',reasons.current.hidden);
  };
  const setPause=(reason:'manual'|'hidden',value:boolean):void=>{
    reasons.current[reason]=value;controller.current?.setPause(reason,value);
    // Hidden ownership belongs to the existing foundation adapter. Only manual
    // commands use its manual owner, so a hidden change cannot release manual.
    if(reason==='manual') {if(value)handle.current?.pause();else handle.current?.resume();}
  };
  const unmount=():void=>{controller.current?.dispose();void handle.current?.dispose();setMounted(false);};
  const reenter=(fault='approved',renderer:'auto'|'canvas'='auto'):void=>{
    controller.current?.dispose();void handle.current?.dispose();
    setSelection({fault,renderer});setGeneration(v=>v+1);setMounted(true);
  };
  useEffect(()=>{
    const visibility=()=>setPause('hidden',document.hidden);
    const hide=()=>setPause('hidden',true);
    document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',hide);window.addEventListener('pageshow',visibility);
    const api:Api={
      snapshot:()=>({world:controller.current?.inspect()??null,history:history.current.map(w=>w.inspect()),foundation:diagnostics,
        runtime:(handle.current??previous.current)?.inspect()??null,events:events.current,droppedEvents:dropped.current}),
      reenter,pause:value=>setPause('manual',value),lock:(owner,value)=>controller.current?.lock(owner,value),
      cancel:unmount,unmount,restart:()=>{if(handle.current?.inspect().paused)return;controller.current?.dispose();handle.current?.restartScene();},
      synthetic:i=>controller.current?.synthetic(i),staleDelivery:()=>controller.current?.lateDelivery()??(()=>{}),
    };
    window.__TASK04_WORLD_DEV__=api;
    return ()=>{
      document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',visibility);
      controller.current?.dispose();if(window.__TASK04_WORLD_DEV__===api)delete window.__TASK04_WORLD_DEV__;
    };
  },[]);
  return <>
    {mounted && <PhaserHost key={generation} options={{dev:{diagnostics,renderer:selection.renderer,attachScene}}}
      onHandle={next=>{handle.current=next;if(next)previous.current=next;}}
      onStatus={status=>{if(status.state==='ready' && reasons.current.manual)handle.current?.pause();}} />}
    <aside className="t04-panel" data-testid="world-harness">
      <strong>Task 04 · DEV world / Player / MOVE</strong>
      <span>F12: ACCEPTED_WITH_OWNER_WAIVER · QA PENDING</span>
      <button onClick={()=>setPause('manual',true)}>Pause world</button>
      <button onClick={()=>setPause('manual',false)}>Resume world</button>
      <button onClick={unmount}>Cancel world</button>
      <button onClick={()=>reenter()}>Retry / Re-enter world</button>
      <Link to="/">Exit world route</Link>
    </aside>
  </>;
}
