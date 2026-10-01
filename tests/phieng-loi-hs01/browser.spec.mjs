import {test,expect,chromium} from '@playwright/test';
import {readFileSync,createReadStream,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const URL='http://localhost:5173/phieng-loi?dev=hs01-play';
const snap=page=>page.evaluate(()=>window.__TASK05_DEV__?.snapshot());
const button=(page,name)=>page.getByRole('button',{name,exact:true});
const state=async page=>(await snap(page))?.encounter?.model;
const phase=(page,name,timeout=15000)=>expect.poll(async()=>(await state(page))?.phase,{timeout,intervals:[10,20,50]}).toBe(name);
async function open(page,options){
 await page.goto(URL);await expect(button(page,'Start')).toBeEnabled();
 if(options){await page.evaluate(o=>window.__TASK05_DEV__.reenter(o),options);await expect(button(page,'Start')).toBeEnabled();}
}
async function upstream(page){
 await button(page,'Start').click();
 await button(page,'Khung tiếp').click();await button(page,'Khung tiếp').click();await button(page,'Đóng sau khi xem xong').click();
 await expect.poll(async()=>Boolean((await snap(page))?.encounter),{intervals:[10,20]}).toBe(true);
}
async function pointer(page,q,kind='down') {
 const box=await page.locator('canvas').boundingBox();const x=box.x+q.x*box.width/1280,y=box.y+q.y*box.height/720;
 await page.mouse.move(x,y);if(kind==='down')await page.mouse.down();
}
async function hidden(page,value){await page.evaluate(v=>{Object.defineProperty(document,'hidden',{configurable:true,value:v});document.dispatchEvent(new Event('visibilitychange'));},value);}
async function evidence(page,info,name='state'){
 const s=await snap(page);await info.attach(name,{body:JSON.stringify(s,null,2),contentType:'application/json'});return s;
}
const logs=new WeakMap();
test.beforeEach(async({page})=>{
 const errors=[];logs.set(page,errors);page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/503|Failed to load resource/.test(m.text()))errors.push(m.text());});
 await page.route('https://pl00.invalid/**',r=>r.fulfill({status:503,body:'{}'}));
});
test.afterEach(async({page},info)=>{await info.attach('browser-errors',{body:JSON.stringify(logs.get(page)),contentType:'application/json'});expect(logs.get(page)).toEqual([]);});

test('B01 native contact E2E pointer audio wake animation drunk recovery [AC01,04-14,22]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'CHASE');
 await pointer(page,{x:180,y:632});await page.waitForTimeout(150);await page.mouse.up();
 await page.screenshot({path:info.outputPath('chase.png')});
 await phase(page,'BLACK_AUDIO');await page.screenshot({path:info.outputPath('blackout.png')});
 await phase(page,'STAND_UP');await page.screenshot({path:info.outputPath('standing-up.png')});
 await phase(page,'DRUNK');const standing=await snap(page);
 expect(standing.encounter.model.balance).toBe(0);expect(standing.encounter.sprite.frame).toBe('stand-24');
 expect(standing.encounter.frameHistory).toEqual(Array.from({length:25},(_,i)=>i+1));
 expect(new Set(standing.encounter.renderedFrames).size).toBe(25);
 const p=(await state(page)).player;await pointer(page,{x:192,y:632});await page.waitForTimeout(140);await page.mouse.up();expect((await state(page)).player.x).toBeLessThan(p.x);
 await phase(page,'COMPLETE');const s=await evidence(page,info);
 expect(s.clean).toBe(true);expect(s.encounter.model.cause).toBe('body_contact');expect(s.encounter.model.captureId).toBe(1);expect(s.encounter.model.completions).toBe(1);
 expect(s.encounter.model.events.filter(e=>e.type==='audio_native_ended')).toHaveLength(1);
 const x=s.encounter.model.player.x;await pointer(page,{x:192,y:632});await page.waitForTimeout(120);await page.mouse.up();expect((await state(page)).player.x).toBeGreaterThan(x);
 await page.screenshot({path:info.outputPath('recovered.png')});
});
test('B02 native call E2E same story no contact fiction [AC08,09,15,22]',async({page},info)=>{
 // Install before navigation. Only the pre-capture browser clock is controlled;
 // the runtime, input handler, pursuit, collision and audio are not replaced.
 await page.clock.install();
 await open(page,{rng:.8,entry:{player:{x:240,y:150},npc:{x:500,y:150},balance:10}});
 await button(page,'Start').click();
 await button(page,'Khung tiếp').click();await button(page,'Khung tiếp').click();
 await expect(button(page,'Đóng sau khi xem xong')).toBeEnabled();
 expect((await snap(page)).flow.phase).toBe('MANGA');
 expect((await snap(page)).runtime.paused).toBe(true);
 // Freeze before the handoff, when the manga already holds the engine.
 // A future clock instant avoids racing the clock-control IPC itself.
 await page.clock.pauseAt(await page.evaluate(()=>Date.now()+60000));
 await button(page,'Đóng sau khi xem xong').click();await phase(page,'CHASE');
 let ready=await state(page);
 for(let frame=0;frame<64&&Math.hypot(ready.player.x-ready.npc.x,ready.player.y-ready.npc.y)>96;frame++) {
  await page.clock.runFor(16);ready=await state(page);
  expect(ready.phase).toBe('CHASE');
 }
 const distance=Math.hypot(ready.player.x-ready.npc.x,ready.player.y-ready.npc.y);
 expect(distance).toBeLessThanOrEqual(96);expect(distance).toBeGreaterThan(24);
 expect(ready.player.y).toBe(150);expect(ready.npc.y).toBe(150);
 expect(ready.paused).toBe(false);expect(ready.captureId).toBe(0);
 await evidence(page,info,'call-ready-clock-held');
 // Actionability may take arbitrary wall time: it must not advance the chase.
 // 250 ms exceeds the <=150 ms left before contact at 96 WU and 480 WU/s.
 await page.waitForTimeout(250);
 await button(page,'PHÀ ƠI').click();
 const accepted=await evidence(page,info,'call-accepted-before-next-frame');
 const calls=accepted.encounter.model.events.filter(e=>e.type==='call_accepted');
 expect(calls).toHaveLength(1);
 expect(calls[0].phase).toBe('CHASE');
 expect(calls[0].data).toMatchObject({trusted:true,outcome:'normal',rng:.8});
 expect(accepted.encounter.model.activeMs).toBe(ready.activeMs);
 expect(accepted.encounter.model.player).toEqual(ready.player);
 expect(accepted.encounter.model.npc).toEqual(ready.npc);
 expect(accepted.encounter.model.captureId).toBe(0);
 await page.clock.resume();
 await phase(page,'COMPLETE');const s=await evidence(page,info);
 expect(s.encounter.model.cause).toBe('phao_heesun');expect(s.encounter.model.balance).toBe(0);expect(s.encounter.model.captureId).toBe(1);expect(s.encounter.model.completions).toBe(1);
 expect(s.encounter.model.events.find(e=>e.type==='call_accepted').data.trusted).toBe(true);
 const events=s.encounter.model.events,captures=events.filter(e=>e.type==='capture');
 expect(captures).toHaveLength(1);expect(calls[0].seq).toBeLessThan(captures[0].seq);
 const trajectory=events.find(e=>e.type==='trajectory'&&e.seq>calls[0].seq&&e.seq<captures[0].seq);
 expect(trajectory.data).toMatchObject({source:'native',call:.8,blocked:false,until:0});
 expect(trajectory.data.distance).toBeLessThanOrEqual(96);expect(trajectory.data.touch).not.toBe(0);
 for(const type of ['call_accepted','audio_native_ended','wake_commit','recovery','hs01_playtest_complete'])expect(events.filter(e=>e.type===type),type).toHaveLength(1);
 expect(events.filter(e=>e.type==='call_rejected')).toHaveLength(0);
 expect(s.clean).toBe(true);expect(s.encounter.model.phase).toBe('COMPLETE');
 expect(s.encounter.sprite.frame).toBe('stand-24');await page.screenshot({path:info.outputPath('call-recovery.png')});
});
test('B03 pointer oracle native motion before contact [AC04,05]',async({page},info)=>{
 await open(page);await upstream(page);await pointer(page,{x:192,y:632});await page.waitForTimeout(200);await page.mouse.up();
 const s=await evidence(page,info);const input=s.encounter.worldEvents.find(e=>e.type==='input_started');expect(input.data.trusted).toBe(true);
 const raw=input.data.raw, r=Math.hypot(raw.x-160,raw.y-632),v=(r-8)/56*(raw.x-160)/r;
 const trajectories=s.encounter.model.events.filter(e=>e.type==='trajectory');let x=240;
 for(const {data:d} of trajectories){x+=v*(d.raw.x?1:0)*240*d.until/1000;expect(Math.abs(d.playerPath.at(-1).end.x-x)).toBeLessThan(.05);}
 expect(s.encounter.world.actorPosition.x).toBeCloseTo(x,1);
});
test('B04 pause owners freeze audio actual context then resume [AC11,16]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'BLACK_AUDIO');await page.waitForTimeout(450);await button(page,'Pause').click();await hidden(page,true);await page.waitForTimeout(100);
 const a=await snap(page);await page.waitForTimeout(500);const b=await snap(page);expect(b.audio.currentTime).toBe(a.audio.currentTime);expect(b.encounter.model.activeMs).toBe(a.encounter.model.activeMs);
 await button(page,'Resume').click();await page.waitForTimeout(200);expect((await snap(page)).audio.currentTime).toBe(a.audio.currentTime);
 await hidden(page,false);await phase(page,'COMPLETE');const s=await evidence(page,info);expect(s.audio.playCount).toBe(1);expect(s.audio.endCount).toBe(1);
});
test('B05 animation pause frame stability and full completion [AC12,16]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'STAND_UP');await button(page,'Pause').click();const a=await snap(page);await page.waitForTimeout(600);expect((await snap(page)).encounter.sprite.frame).toBe(a.encounter.sprite.frame);await button(page,'Resume').click();await phase(page,'DRUNK');await evidence(page,info);
});
test('B06 resize FIT pointer mapping and anchored final sprite [AC17]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'DRUNK');await button(page,'Pause').click();const before=await snap(page);
 await page.setViewportSize({width:720,height:1280});await page.waitForTimeout(200);const after=await snap(page);expect(after.encounter.sprite).toEqual(before.encounter.sprite);expect(after.encounter.world.camera).toEqual(before.encounter.world.camera);
 await page.screenshot({path:info.outputPath('portrait-paused.png')});await page.setViewportSize({width:1280,height:720});await button(page,'Resume').click();await phase(page,'COMPLETE');await evidence(page,info);
});
test('B07 TRUE NOTHING silence cause isolated then contact [AC15]',async({page},info)=>{
 await open(page,{rng:0});await upstream(page);await button(page,'PHÀ ƠI').click();const initial=await state(page);expect(initial.captureId).toBe(0);expect(initial.balance).toBe(10);expect(initial.events.find(e=>e.type==='call_accepted').data.outcome).toBe('TRUE_NOTHING');
 await phase(page,'DRUNK');const s=await evidence(page,info);expect(s.encounter.model.cause).toBe('body_contact');expect(s.encounter.model.events.filter(e=>e.type==='capture')).toHaveLength(1);
});
test('B08 audio HTTP error retry uses same capture [AC03,11,19]',async({page},info)=>{
 let reject=true;await page.route('**/assets/blackout.wav',r=>reject?r.fulfill({status:503,body:''}):r.continue());
 await open(page);await upstream(page);await phase(page,'ERROR');const before=await state(page);expect(before.captureId).toBe(1);reject=false;
 await button(page,'Retry audio / phase').click();await phase(page,'COMPLETE');const s=await evidence(page,info);expect(s.encounter.model.captureId).toBe(1);expect(s.encounter.model.events.filter(e=>e.type==='wake_commit')).toHaveLength(1);
});
test('B09 route exit audio teardown late callbacks held outside tree [AC19]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'BLACK_AUDIO');
 await page.evaluate(()=>{window.qaRead=window.__TASK05_DEV__.snapshot;window.qaLate=window.__TASK05_DEV__.lateDelivery();});await page.getByRole('link',{name:'Exit route'}).click();
 await expect.poll(()=>page.evaluate(()=>window.qaRead().foundation.live)).toBe(0);await page.evaluate(()=>window.qaLate());
 const s=await page.evaluate(()=>window.qaRead());expect(s.encounter.model.phase).toBe('DISPOSED');expect(s.encounter.model.completions).toBe(0);expect(s.encounter.sprite).toBeNull();expect(s.encounter.owned).toEqual({objects:0,bindings:0,animationCallbacks:0});expect(Object.values(s.audio.owned)).toEqual([0,0,0,0]);
 for(const key of ['objects','sceneListeners','adapterListeners','observers','timers','tweens','orphanCallbacks'])expect(s.foundation[key],key).toBe(0);
 await info.attach('after-route-exit',{body:JSON.stringify(s,null,2),contentType:'application/json'});
});
test('B10 cancel standup unmount immediate re-entry [AC19,20]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'STAND_UP');await page.evaluate(()=>{window.qaLate=window.__TASK05_DEV__.lateDelivery();});await button(page,'Unmount').click();await expect.poll(async()=>(await snap(page)).foundation.live).toBe(0);await button(page,'Re-enter').click();await expect(button(page,'Start')).toBeEnabled();await page.evaluate(()=>window.qaLate());const s=await evidence(page,info);expect(s.flow.phase).toBe('IDLE');expect(s.encounter).toBeNull();expect(s.history.at(-1).model.completions).toBe(0);
});
test('B11 reload new DEV state no persistence [AC20]',async({page},info)=>{
 await open(page);await upstream(page);await phase(page,'DRUNK');await page.reload();await expect(button(page,'Start')).toBeEnabled();expect((await snap(page)).flow.phase).toBe('IDLE');await upstream(page);const s=await evidence(page,info);expect(s.encounter.model.balance).toBe(10);expect(s.encounter.model.cooldownRemaining).toBe(0);expect(s.encounter.model.captureId).toBe(0);
});
test('B12 Canvas renderer complete visual and cleanup [AC21]',async({page},info)=>{
 await open(page,{renderer:'canvas'});await upstream(page);await phase(page,'COMPLETE');const s=await evidence(page,info);expect(s.encounter.renderer).toBe('canvas');expect(s.encounter.sprite.frame).toBe('stand-24');await page.screenshot({path:info.outputPath('canvas-recovery.png')});await button(page,'Unmount').click();await expect.poll(async()=>(await snap(page)).foundation.live).toBe(0);
});
test('B13 twenty mixed reentries resource counters [AC21]',async({page},info)=>{
 test.setTimeout(120000);await open(page);
 for(let i=0;i<20;i++){
  await expect(button(page,'Start')).toBeEnabled();
  if(i<2){await upstream(page);if(i===0)await phase(page,'COMPLETE');else await phase(page,'BLACK_AUDIO');}
  else {await button(page,'Start').click();await page.waitForTimeout(30);}
  await button(page,'Unmount').click();await expect.poll(async()=>(await snap(page)).foundation.live).toBe(0);
  const s=await snap(page);for(const key of ['objects','sceneListeners','adapterListeners','observers','timers','tweens','orphanCallbacks'])expect(s.foundation[key],key).toBe(0);
  if(i<19)await button(page,'Re-enter').click();
 }
 const s=await evidence(page,info);expect(s.foundation.created).toBe(s.foundation.destroyed);expect(s.foundation.maxLive).toBeLessThanOrEqual(1);for(const h of s.history){expect(h.owned.objects).toBe(0);expect(h.audio.owned.sources).toBe(0);}
});
test('B14 assets exact hashes 25 rects waveform3s production exclusion [AC23,24]',async({page},info)=>{
 const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
 expect(hash('src/game/phieng-loi/world/hs01/assets/player-stand.png')).toBe('9be0bcdd0c76741bd60e674e2473b57b034269003488457c25365c162d07c089');
 expect(hash('src/game/phieng-loi/world/hs01/assets/blackout.wav')).toBe('09209c63a4d9cf16adb5bd8f3cde50d635c4a27530210dc5fabe96c9f72080b4');
 const f=JSON.parse(readFileSync('src/game/phieng-loi/world/hs01/assets/frames.json'));expect(f.frames).toHaveLength(25);expect(new Set(f.frames.map(r=>r.height)).size).toBeGreaterThan(5);
 const requests=[];page.on('request',r=>requests.push(r.url()));await page.goto('http://localhost:4173/phieng-loi?dev=hs01-play');await expect(page.locator('canvas')).toHaveCount(1);expect(await page.evaluate(()=>window.__TASK05_DEV__)).toBeUndefined();expect(requests.some(u=>/blackout|player-stand|hs01\/Playtest/.test(u))).toBe(false);
 const compiled=readdirSync('dist/assets').filter(f=>f.endsWith('.js')).map(f=>readFileSync('dist/assets/'+f,'utf8')).join('');expect(compiled).not.toMatch(/task05-player-with-scarf-pumpkin|__TASK05_DEV__|T05-DEV-HS01-CFG-A01/);await info.attach('production-requests',{body:JSON.stringify(requests),contentType:'application/json'});
});
test('B15 gesture clear outside hit and paused call rejection [AC04,16]',async({page},info)=>{
 await open(page);await upstream(page);await pointer(page,{x:224,y:632});await pointer(page,{x:250,y:632},'move');await page.mouse.up();expect((await snap(page)).encounter.world.pointer).toBeNull();await button(page,'Pause').click();const p=(await state(page)).player;await page.waitForTimeout(200);expect((await state(page)).player).toEqual(p);expect(await button(page,'PHÀ ƠI').isDisabled()).toBe(true);await evidence(page,info);
});
test('B16 duplicate stale handoff no new chase [AC02]',async({page},info)=>{
 await open(page);await upstream(page);const s=await snap(page);await page.evaluate(s=>{window.__TASK05_DEV__.handoff(s.flow.sessionId,s.flow.mangaRun);window.__TASK05_DEV__.handoff(s.flow.sessionId-1,1);},s);const after=await evidence(page,info);expect(after.history).toHaveLength(1);expect(after.encounter.model.events.filter(e=>e.type==='handoff_rejected')).toHaveLength(2);
});
test('B17 manga pause retry upstream contract preserved [AC01,16]',async({page},info)=>{
 await open(page);await button(page,'Start').click();await button(page,'Khung tiếp').click();await button(page,'Pause').click();expect(await button(page,'Khung tiếp').isDisabled()).toBe(true);await button(page,'Resume').click();await button(page,'Retry manga').click();await expect(page.getByText('1 / 3',{exact:true})).toBeVisible();await button(page,'Khung tiếp').click();await button(page,'Khung tiếp').click();await button(page,'Đóng sau khi xem xong').click();await phase(page,'CHASE');const s=await evidence(page,info);expect(s.clean).toBe(true);expect(s.flow.chaseRequests).toBe(1);
});
test('B18 zero-balance native capture same visuals [AC09,22]',async({page},info)=>{
 await open(page,{entry:{player:{x:240,y:300},npc:{x:1000,y:300},balance:0}});await upstream(page);await phase(page,'DRUNK');const s=await evidence(page,info);expect(s.encounter.model.balance).toBe(0);expect(s.encounter.model.events.find(e=>e.type==='wake_commit').data.before).toBe(0);expect(s.encounter.sprite.frame).toBe('stand-24');
});
test('B19 forced WebGL unavailable AUTO falls back complete [AC21]',async({},info)=>{
 const browser=await chromium.launch({args:['--disable-webgl']});
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:info.outputPath('fallback-video')}});
 // Playwright Test owns tracing for additional contexts too; do not start it twice.
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://pl00.invalid/**',r=>r.fulfill({status:503,body:'{}'}));
 try {await open(page);await upstream(page);await phase(page,'COMPLETE');const s=await evidence(page,info,'fallback-state');expect(s.encounter.renderer).toBe('canvas');expect(s.encounter.model.completions).toBe(1);expect(errors).toEqual([]);await page.screenshot({path:info.outputPath('auto-fallback.png')});}
 finally {await context.close();await browser.close();}
});
test('B20 trusted touch pointer actor analog release [AC04,17]',async({page},info)=>{
 await open(page);await upstream(page);const start=(await state(page)).player;
 const box=await page.locator('canvas').boundingBox();const x=box.x+192*box.width/1280,y=box.y+632*box.height/720;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await page.waitForTimeout(150);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const s=await evidence(page,info,'touch-state');
 expect(s.encounter.model.player.x).toBeGreaterThan(start.x);expect(s.encounter.world.pointer).toBeNull();expect(s.encounter.worldEvents.some(e=>e.type==='input_started'&&e.data.trusted)).toBe(true);await cdp.detach();
});
test('B21 every visible phase pause pagehide resize clear with no catchup [AC16,17]',async({page},info)=>{
 test.setTimeout(120000);await open(page);await upstream(page);const records=[];
 for(const target of ['CHASE','CAPTURE_HOLD','FADE_OUT','BLACK_AUDIO','FADE_IN','STAND_UP','DRUNK','COMPLETE']) {
  await phase(page,target);await button(page,'Pause').click();await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await page.waitForTimeout(80);
  const before=await snap(page);expect(before.encounter.model.phase).toBe(target);
  await page.setViewportSize({width:720,height:1280});await page.waitForTimeout(180);
  const after=await snap(page);
  for(const key of ['player','npc','phaseMs','activeMs','alpha','balance','cooldownRemaining'])expect(after.encounter.model[key],target+':'+key).toEqual(before.encounter.model[key]);
  expect(after.encounter.sprite).toEqual(before.encounter.sprite);expect(after.audio.currentTime).toBe(before.audio.currentTime);
  await button(page,'Resume').click();expect((await state(page)).paused).toBe(true);
  await page.setViewportSize({width:1280,height:720});await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
  expect((await state(page)).paused).toBe(false);records.push({phase:target,before,after});
 }
 await info.attach('pause-resize-phase-matrix',{body:JSON.stringify(records),contentType:'application/json'});
});
test('B22 every visible phase cancel route-exit and reload matrix [AC19,20]',async({page},info)=>{
 test.setTimeout(480000);const records=[];
 for(const target of ['CHASE','CAPTURE_HOLD','FADE_OUT','BLACK_AUDIO','FADE_IN','STAND_UP','DRUNK','COMPLETE'])for(const action of ['cancel','route','reload']) {
  await open(page);await upstream(page);await phase(page,target);await button(page,'Pause').click();
  const before=await snap(page);expect(before.encounter.model.phase).toBe(target);
  await page.evaluate(()=>{window.qaRead=window.__TASK05_DEV__.snapshot;window.qaLate=window.__TASK05_DEV__.lateDelivery();});
  if(action==='reload') {
   await page.reload();await expect(button(page,'Start')).toBeEnabled();const reset=await snap(page);expect(reset.flow.phase).toBe('IDLE');expect(reset.encounter).toBeNull();
   await upstream(page);const next=await state(page);expect(next.balance).toBe(10);expect(next.captureId).toBe(0);expect(next.cooldownRemaining).toBe(0);records.push({target,action,reset:next});
  } else {
   if(action==='route')await page.getByRole('link',{name:'Exit route'}).click();else {await button(page,'Cancel').click();await button(page,'Unmount').click();}
   await expect.poll(()=>page.evaluate(()=>window.qaRead().foundation.live)).toBe(0);await page.evaluate(()=>window.qaLate());
   const after=await page.evaluate(()=>window.qaRead());expect(after.encounter.model.phase).toBe('DISPOSED');expect(after.encounter.model.balance).toBe(before.encounter.model.balance);expect(after.encounter.model.completions).toBe(before.encounter.model.completions);
   expect(Object.values(after.audio.owned)).toEqual([0,0,0,0]);expect(after.encounter.owned).toEqual({objects:0,bindings:0,animationCallbacks:0});
   for(const key of ['objects','sceneListeners','adapterListeners','observers','timers','tweens','orphanCallbacks'])expect(after.foundation[key],key).toBe(0);records.push({target,action,after});
  }
 }
 await info.attach('teardown-reload-phase-matrix',{body:JSON.stringify(records),contentType:'application/json'});
});
test('B23 denied audio unlock requires user retry real ended [AC03,11,16]',async({page},info)=>{
 await page.addInitScript(()=>{const Native=window.AudioContext;window.qaDenyAudio=true;window.AudioContext=class extends Native {resume(){return window.qaDenyAudio?Promise.reject(Error('QA denied audio unlock')):super.resume();}};});
 await open(page);await upstream(page);await phase(page,'ERROR');expect((await snap(page)).audio.playCount).toBe(0);
 await page.evaluate(()=>{window.qaDenyAudio=false;});await button(page,'Retry audio / phase').click();await phase(page,'COMPLETE');
 const s=await evidence(page,info);expect(s.audio.playCount).toBe(1);expect(s.audio.endCount).toBe(1);expect(s.encounter.model.captureId).toBe(1);expect(s.encounter.model.events.filter(e=>e.type==='wake_commit')).toHaveLength(1);
});
test('B24 asset preload and invalid entry cannot become ready or complete [AC03,12]',async({page},info)=>{
 let reject=true;await page.route('**/assets/player-stand.png',r=>reject?r.fulfill({status:503,body:''}):r.continue());
 await page.goto(URL);await expect(page.getByTestId('phaser-host').getByRole('alert')).toBeVisible();expect(await button(page,'Start').isDisabled()).toBe(true);expect((await snap(page)).encounter).toBeNull();
 reject=false;await button(page,'Re-enter').click();await expect(button(page,'Start')).toBeEnabled();
 await page.evaluate(()=>window.__TASK05_DEV__.reenter({entry:{player:{x:0,y:0},npc:{x:1000,y:300},balance:10}}));await expect(button(page,'Start')).toBeEnabled();await upstream(page);await phase(page,'ERROR');
 const invalid=await state(page);expect(invalid.captureId).toBe(0);expect(invalid.completions).toBe(0);await button(page,'Re-enter').click();await expect(button(page,'Start')).toBeEnabled();await upstream(page);await phase(page,'DRUNK');await evidence(page,info);
});
