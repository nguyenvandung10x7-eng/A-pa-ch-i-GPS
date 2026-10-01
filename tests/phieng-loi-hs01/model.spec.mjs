import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const root=resolve('node_modules/.cache/task05-compiled');
for(const file of ['config','collision','hs01/config','hs01/motion','hs01/Encounter']) {
 const input=readFileSync('src/game/phieng-loi/world/'+file+'.ts','utf8');
 const js=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '(\.[^']+)'/g,"from '$1.mjs'");
 const out=root+'/'+file+'.mjs';mkdirSync(dirname(out),{recursive:true});writeFileSync(out,js);
}
const {Encounter}=await import(pathToFileURL(root+'/hs01/Encounter.mjs'));
const {contactTime,playerPath,npcPath,pathTo,obstructed}=await import(pathToFileURL(root+'/hs01/motion.mjs'));
const zero={x:0,y:0};
function make({player={x:240,y:150},npc={x:600,y:150},balance=10,rng=.8}={}) {
 const m=new Encounter(9,1,()=>{},()=>rng,{player,npc,balance});m.accept({type:'chase_requested',flowSessionId:9,mangaRunId:1});return m;
}
function caught(balance=10) {const m=make({npc:{x:264,y:150},balance});m.advance(0,zero,'synthetic');return m;}
function drunk(balance=10) {const m=caught(balance);m.advance(1000,zero,'synthetic');m.audioEnded(9,1);m.wakeReady();m.advance(500,zero,'synthetic');m.standComplete(9,1);m.enableControl();m.advance(0,zero,'synthetic');return m;}
const near=(a,b)=>expect(Math.abs(a-b)).toBeLessThanOrEqual(1e-6);
test('M01 handoff stale duplicate pending cancel [AC02,19]',()=>{
 const stale=new Encounter(9,1,()=>{});stale.accept({type:'chase_requested',flowSessionId:9,mangaRunId:2});expect(stale.phase).toBe('IDLE');
 const m=new Encounter(9,1,()=>{});m.setPause('manual',true);m.accept({type:'chase_requested',flowSessionId:9,mangaRunId:1});m.accept({type:'chase_requested',flowSessionId:9,mangaRunId:1});expect(m.phase).toBe('IDLE');m.setPause('manual',false);expect(m.phase).toBe('CHASE');m.accept({type:'chase_requested',flowSessionId:10,mangaRunId:1});expect(m.inspect().events.filter(e=>e.type==='phase'&&e.phase==='CHASE')).toHaveLength(1);
 const n=new Encounter(10,1,()=>{});n.setPause('hidden',true);n.accept({type:'chase_requested',flowSessionId:10,mangaRunId:1});n.cancel();n.setPause('hidden',false);expect(n.phase).toBe('CANCELLED');
});
function atPhase(phase) {
 const m=phase==='CHASE'?make():caught();
 if(['FADE_OUT','BLACK_AUDIO','BLACK_PREPARE','FADE_IN','STAND_UP','DRUNK','COMPLETE'].includes(phase))m.advance(500,zero,'synthetic');
 if(['BLACK_AUDIO','BLACK_PREPARE','FADE_IN','STAND_UP','DRUNK','COMPLETE'].includes(phase))m.advance(500,zero,'synthetic');
 if(['BLACK_PREPARE','FADE_IN','STAND_UP','DRUNK','COMPLETE'].includes(phase))m.audioEnded(9,1);
 if(['FADE_IN','STAND_UP','DRUNK','COMPLETE'].includes(phase))m.wakeReady();
 if(['STAND_UP','DRUNK','COMPLETE'].includes(phase))m.advance(500,zero,'synthetic');
 if(['DRUNK','COMPLETE'].includes(phase)){m.standComplete(9,1);m.enableControl();m.advance(0,zero,'synthetic');}
 if(phase==='COMPLETE')for(let i=0;i<5;i++)m.advance(1000,zero,'synthetic');
 expect(m.phase).toBe(phase);return m;
}
const phases=['CHASE','CAPTURE_HOLD','FADE_OUT','BLACK_AUDIO','BLACK_PREPARE','FADE_IN','STAND_UP','DRUNK','COMPLETE'];
test('M19 each phase independent pause owners freeze all active state [AC16,18]',()=>{
 for(const p of phases)for(const order of [['manual','hidden'],['hidden','manual']]) {
  const m=atPhase(p);m.setPause(order[0],true);m.setPause(order[1],true);
  const before={player:{...m.player},npc:{...m.npc},active:m.activeMs,phaseMs:m.phaseMs,alpha:m.alpha,balance:m.balance};
  m.advance(1000,{x:1,y:0},'synthetic');m.setPause(order[0],false);m.advance(1000,{x:1,y:0},'synthetic');
  expect({player:m.player,npc:m.npc,active:m.activeMs,phaseMs:m.phaseMs,alpha:m.alpha,balance:m.balance}).toEqual(before);expect(m.paused).toBe(true);m.setPause(order[1],false);expect(m.paused).toBe(false);
 }
});
test('M20 cancel and dispose every phase discard late work [AC19,20]',()=>{
 for(const p of phases)for(const operation of ['cancel','dispose']) {
  const m=atPhase(p);m.setPause('manual',true);const balance=m.balance,completions=m.completions,capture=m.captureId;
  m[operation]();m.audioEnded(9,1);m.standComplete(9,1);m.enableControl();m.wakeReady();m.requestCall(true);m.advance(1000,{x:1,y:0},'synthetic');m.setPause('manual',false);
  expect(m.phase).toBe(operation==='cancel'?'CANCELLED':'DISPOSED');expect(m.balance).toBe(balance);expect(m.completions).toBe(completions);expect(m.captureId).toBe(capture);
 }
});
test('M21 independent path samples static clipping before dynamic contact [AC06,07]',()=>{
 // Oracle uses authored geometry constants, not obstructed/legal/sweep from runtime.
 const legal=p=>p.x>=94-1e-6&&p.x<=1186+1e-6&&p.y>=90-1e-6&&p.y<=510+1e-6&&!(p.x>586+1e-6&&p.x<774-1e-6&&p.y>210+1e-6&&p.y<390-1e-6);
 for(const [start,target] of [[{x:1000,y:300},{x:240,y:300}],[{x:650,y:180},{x:650,y:450}],[{x:580,y:300},{x:780,y:300}]]){
  const path=npcPath(start,target,1000);for(const s of path)for(let i=0;i<=100;i++)expect(legal({x:s.start.x+(s.end.x-s.start.x)*i/100,y:s.start.y+(s.end.y-s.start.y)*i/100})).toBe(true);
 }
 // Player moves right from550, stops at586 in150ms. NPC on same side catches from300 at545.833ms.
 const pp=playerPath({x:550,y:150},{x:1,y:0},1000);
 const wall=playerPath({x:550,y:300},{x:1,y:0},1000);
 near(wall[0].to,150);near(wall.at(-1).end.x,586);
 const np=[{start:{x:300,y:300},end:{x:780,y:300},from:0,to:1000}];
 near(contactTime(wall,np),(586-24-300)/480*1000);expect(pp.at(-1).end.x).toBe(790);
});
test('M22 all static faces and corners contact next update stays legal [AC06,14,18]',()=>{
 const cases=[
  [{x:95,y:150},{x:-1,y:0},{x:94,y:150}], [{x:1185,y:150},{x:1,y:0},{x:1186,y:150}],
  [{x:240,y:91},{x:0,y:-1},{x:240,y:90}], [{x:240,y:509},{x:0,y:1},{x:240,y:510}],
  [{x:585,y:300},{x:1,y:0},{x:586,y:300}], [{x:775,y:300},{x:-1,y:0},{x:774,y:300}],
  [{x:650,y:209},{x:0,y:1},{x:650,y:210}], [{x:650,y:391},{x:0,y:-1},{x:650,y:390}],
  [{x:95,y:91},{x:-Math.SQRT1_2,y:-Math.SQRT1_2},{x:94,y:90}]
 ];
 for(const [start,v,expected] of cases){const m=drunk();m.phase='COMPLETE';m.player={...start};m.advance(1000,v,'synthetic');near(m.player.x,expected.x);near(m.player.y,expected.y);m.advance(1000,v,'synthetic');expect(m.phase).toBe('COMPLETE');near(m.player.x,expected.x);near(m.player.y,expected.y);m.advance(1,{x:-v.x,y:-v.y},'synthetic');expect(m.phase).toBe('COMPLETE');}
});
test('M02 invalid entry finite balance geometry [AC03]',()=>{
 for(const entry of [{player:{x:0,y:100},npc:{x:1000,y:300},balance:10},{player:{x:240,y:300},npc:{x:680,y:300},balance:10},{player:{x:240,y:300},npc:{x:1000,y:300},balance:-1}])expect(new Encounter(1,1,()=>{},Math.random,entry).phase).toBe('ERROR');
});
test('M03 240/480 speed independent input [AC04,05]',()=>{
 for(const magnitude of [0,.25,.5,1]) {const m=make();m.advance(100,{x:magnitude,y:0},'synthetic');near(m.player.x,240+24*magnitude);near(m.npc.x,552);}
});
test('M04 path above below blocked obstacle [AC06]',()=>{
 for(const [a,b] of [[{x:1000,y:300},{x:240,y:300}],[{x:1000,y:450},{x:240,y:450}],[{x:650,y:180},{x:650,y:450}]]){
  const path=pathTo(a,b);expect(path.at(-1)).toEqual(b);let p=a;for(const q of path){expect(obstructed(p,q)).toBe(false);p=q;}
 }
 const m=make({player:{x:240,y:300},npc:{x:1000,y:300}});for(let i=0;i<200&&m.phase==='CHASE';i++)m.advance(16,zero,'synthetic');expect(m.captureId).toBe(1);
});
test('M05 static clipping full vector no slide then tangent away [AC06,14]',()=>{
 const p={x:550,y:260},v={x:.8,y:.6},path=playerPath(p,v,1000);const q=path.at(-1).end;
 near(q.x,586);near(q.y,287);expect(path.at(-1).from).toBeLessThan(1000);
 near(playerPath(q,v,1000).at(-1).end.y,q.y);
 near(playerPath(q,{x:0,y:1},100).at(-1).end.y,q.y+24);
 near(playerPath(q,{x:-1,y:0},100).at(-1).end.x,562);
});
test('M06 continuous crossing independent numeric oracle [AC07,18]',()=>{
 const m=make({player:{x:240,y:150},npc:{x:600,y:150}});m.advance(1000,{x:1,y:0},'synthetic');
 // Closing 720 WU/s, initial distance360, contact at24 =>466.666...ms.
 const ms=(360-24)/720*1000;near(m.player.x,240+240*ms/1000);near(m.npc.x,600-480*ms/1000);expect(m.cause).toBe('body_contact');
 const trajectory=m.inspect().events.find(e=>e.type==='trajectory');near(trajectory.data.touch,ms);
});
test('M07 edge corner near-miss and static separation [AC07]',()=>{
 const seg=p=>[{start:p,end:p,from:0,to:100}];
 expect(contactTime(seg({x:100,y:100}),seg({x:124,y:116}))).toBe(0);
 expect(contactTime(seg({x:100,y:100}),seg({x:124.00001,y:116}))).toBeNull();
 const m=make({player:{x:580,y:300},npc:{x:780,y:300}});m.advance(0,zero,'synthetic');expect(m.captureId).toBe(0);
});
test('M08 both capture sources same time contact wins once [AC08]',()=>{
 const m=make({npc:{x:264,y:150}});m.requestCall(true);m.advance(0,zero,'synthetic');m.requestCall(true);m.advance(1000,zero,'synthetic');expect(m.captureId).toBe(1);expect(m.cause).toBe('body_contact');expect(m.inspect().events.filter(e=>e.type==='capture')).toHaveLength(1);
});
test('M09 call earliest before future contact [AC08,15]',()=>{
 const m=make({npc:{x:300,y:150}});m.requestCall(true);m.advance(1000,{x:1,y:0},'synthetic');expect(m.cause).toBe('phao_heesun');expect(m.player).toEqual({x:240,y:150});
});
test('M10 near96 inclusive distance line-of-sight body separate [AC15]',()=>{
 for(const distance of [95.999999,96,96.000001]){const m=make({npc:{x:240+distance,y:150}});m.requestCall(true);m.advance(0,zero,'synthetic');expect(m.captureId).toBe(distance<=96?1:0);}
 expect(obstructed({x:570,y:300},{x:790,y:300},{left:600,right:760,top:220,bottom:380})).toBe(true);
 expect(obstructed({x:570,y:220},{x:790,y:220},{left:600,right:760,top:220,bottom:380})).toBe(false);
});
test('M11 RNG boundary and TRUE NOTHING still permits body contact [AC15,22]',()=>{
 for(const r of [0,.199999,.2,.999999]){const m=make({npc:{x:300,y:150},rng:r});m.requestCall(true);m.advance(0,zero,'synthetic');expect(m.captureId).toBe(r<.2?0:1);if(r<.2){expect(m.balance).toBe(10);m.advance(200,zero,'synthetic');expect(m.cause).toBe('body_contact');}}
});
test('M12 active cooldown60s pause spam phase persistence [AC15,16,18]',()=>{
 const m=make({npc:{x:1000,y:300},rng:0});m.requestCall(true);m.advance(0,zero,'synthetic');const deadline=m.cooldownUntil;m.requestCall(true);expect(m.cooldownUntil).toBe(deadline);m.setPause('manual',true);m.advance(1000,zero,'synthetic');expect(m.activeMs).toBe(0);m.setPause('hidden',true);m.setPause('manual',false);expect(m.paused).toBe(true);m.setPause('hidden',false);
 // Clock oracle fixture isolates lock boundary from mandatory capture in a small arena.
 m.activeMs=59999;m.requestCall(true);expect(m.cooldownUntil).toBe(60000);m.activeMs=60000;m.requestCall(true);expect(m.cooldownUntil).toBe(120000);
});
test('M13 wallet and wake commit idempotent both balances [AC09,22]',()=>{
 for(const balance of [10,0]) {const m=caught(balance);m.advance(1000,zero,'synthetic');expect(m.balance).toBe(balance);m.audioEnded(9,1);m.wakeReady();m.wakeReady();expect(m.balance).toBe(0);expect(m.inspect().events.filter(e=>e.type==='wake_commit')).toHaveLength(1);expect(m.drank).toBe(false);}
});
test('M14 hold fade slices external audio gate no timer substitute [AC10,11,18]',()=>{
 const m=caught();m.advance(499,zero,'synthetic');expect(m.phase).toBe('CAPTURE_HOLD');m.advance(1,zero,'synthetic');expect(m.phase).toBe('FADE_OUT');m.advance(500,zero,'synthetic');expect(m.phase).toBe('BLACK_AUDIO');for(let i=0;i<10;i++)m.advance(1000,zero,'synthetic');expect(m.phase).toBe('BLACK_AUDIO');m.audioEnded(8,1);expect(m.phase).toBe('BLACK_AUDIO');m.audioEnded(9,1);expect(m.phase).toBe('BLACK_PREPARE');
});
test('M15 standup/control gate 4999/5000 idle pause duplicate [AC12,13]',()=>{
 const m=caught();m.advance(1000,zero,'synthetic');m.audioEnded(9,1);m.wakeReady();m.advance(500,zero,'synthetic');m.standComplete(9,1);m.advance(1000,zero,'synthetic');expect(m.phase).toBe('STAND_UP');m.enableControl();m.advance(0,zero,'synthetic');for(let i=0;i<4;i++)m.advance(1000,zero,'synthetic');m.advance(999,zero,'synthetic');expect(m.phase).toBe('DRUNK');m.standComplete(9,1);m.setPause('hidden',true);m.advance(1000,zero,'synthetic');expect(m.phaseMs).toBe(4999);m.setPause('hidden',false);m.advance(1,zero,'synthetic');expect(m.phase).toBe('COMPLETE');expect(m.completions).toBe(1);
 // Regression: phase boundaries must not discard active/cooldown time.
 const n=atPhase('STAND_UP');n.standComplete(9,1);n.enableControl();const before=n.activeMs;
 n.advance(16,zero,'synthetic');expect(n.activeMs).toBe(before+16);expect(n.phaseMs).toBe(0);
 const started=n.inspect().events.find(e=>e.type==='drunk_started').at;
 for(let i=0;i<4;i++)n.advance(1000,zero,'synthetic');n.advance(999,zero,'synthetic');const active=n.activeMs,pos={...n.player};n.advance(1000,zero,'synthetic');
 expect(n.phase).toBe('COMPLETE');expect(n.activeMs).toBe(active+1000);expect(n.phaseMs).toBe(999);expect(n.player).toEqual(pos);
 expect(n.inspect().events.find(e=>e.type==='recovery').at-started).toBe(5000);
});
test('M16 inversion magnitude restored and no recapture [AC14]',()=>{
 const m=drunk();m.advance(100,{x:.5,y:0},'synthetic');near(m.player.x,228);for(let i=0;i<4;i++)m.advance(1000,zero,'synthetic');m.advance(900,zero,'synthetic');expect(m.phase).toBe('COMPLETE');const x=m.player.x;m.advance(100,{x:.5,y:0},'synthetic');near(m.player.x,x+12);expect(m.captureId).toBe(1);expect(m.completions).toBe(1);
});
test('M17 invalid delta0/1000 nonfinite no geometry rescue [AC03,18]',()=>{
 for(const delta of [-1,1000.1,NaN,Infinity]){const m=make();m.advance(delta,zero,'synthetic');expect(m.phase).toBe('ERROR');expect(m.player).toEqual({x:240,y:150});}
 const m=make();m.advance(0,zero,'synthetic');expect(m.player.x).toBe(240);m.player.x=94-2e-6;m.advance(1,zero,'synthetic');expect(m.error).toBe('Invalid runtime position');
});
test('M18 cancel dispose stale callbacks cannot change new session [AC19,20]',()=>{
 const old=drunk();old.dispose();old.audioEnded(9,1);old.standComplete(9,1);old.requestCall(true);old.advance(1000,zero,'synthetic');expect(old.phase).toBe('DISPOSED');expect(old.completions).toBe(0);
 const next=make();expect(next.balance).toBe(10);expect(next.cooldownUntil).toBe(0);expect(next.captureId).toBe(0);
});
