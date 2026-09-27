import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const DEV_URL = 'http://localhost:5173/phieng-loi?dev=world-move';
const BASE = 'c45f3b2d860db1f92efc038d0a94532f818f0f69';
const C = { x: 160, y: 632 }, SPAWN = { x: 240, y: 300 };
const snapshot = page => page.evaluate(() => window.__TASK04_WORLD_DEV__?.snapshot());
const action = (page, name, args = []) => page.evaluate(({ name, args }) => window.__TASK04_WORLD_DEV__[name](...args), { name, args });
const button = (page, name) => page.getByRole('button', { name, exact: true });
const near = (a, b, tolerance = 1e-6) => {
  expect(Math.abs(a.x-b.x), `x: ${a.x} expected ${b.x}`).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(a.y-b.y), `y: ${a.y} expected ${b.y}`).toBeLessThanOrEqual(tolerance);
};
const nearVector=(a,b,tolerance=.05)=>expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeLessThanOrEqual(tolerance);
// Oracle is deliberately independent: no production imports, no use of MOVE
// fraction/desired/end as expected. Split a segment at each geometry boundary,
// classify open intervals, and stop at the start of the first forbidden one.
function legal(p) {
  return p.x >= 94-1e-6 && p.x <= 1186+1e-6 && p.y >= 90-1e-6 && p.y <= 510+1e-6
    && !(p.x > 586+1e-6 && p.x < 774-1e-6 && p.y > 210+1e-6 && p.y < 390-1e-6);
}
function oracle(p, q, dt) {
  const x=q.x-160, y=q.y-632, r=Math.hypot(x,y);
  const magnitude=r<=8 || r>80 ? 0 : Math.min(1,(r-8)/56);
  const dx=r ? x/r*magnitude*240*dt/1000 : 0, dy=r ? y/r*magnitude*240*dt/1000 : 0;
  const cuts=[0,1];
  if(dx) for(const edge of [94,586,774,1186]) { const t=(edge-p.x)/dx; if(t>0 && t<1) cuts.push(t); }
  if(dy) for(const edge of [90,210,390,510]) { const t=(edge-p.y)/dy; if(t>0 && t<1) cuts.push(t); }
  cuts.sort((a,b)=>a-b);
  let t=1;
  for(let i=0;i<cuts.length-1;i++) {
    const mid=(cuts[i]+cuts[i+1])/2;
    if(!legal({x:p.x+dx*mid,y:p.y+dy*mid})) { t=cuts[i]; break; }
  }
  return {x:p.x+dx*t,y:p.y+dy*t};
}
async function ready(page) {
  await expect.poll(async () => (await snapshot(page))?.world?.lifecycle).toBe('ACTIVE');
  await expect.poll(async () => (await snapshot(page)).world.updates).toBeGreaterThan(1);
  return snapshot(page);
}
async function open(page) { await page.goto(DEV_URL); return ready(page); }
async function reenter(page, fault='approved', renderer='auto') { await action(page,'reenter',[fault,renderer]); return ready(page); }
async function css(page,q) {
  const box=await page.locator('[data-testid="canvas-parent"] canvas').boundingBox();
  return {x:box.x+q.x*box.width/1280,y:box.y+q.y*box.height/720};
}
async function pointerDown(page,q) {
  const point=await css(page,q); await page.mouse.move(point.x,point.y); await page.mouse.down();
}
async function pointerMove(page,q) { const point=await css(page,q); await page.mouse.move(point.x,point.y); }
async function nativeDrag(page,q,ms=150) {
  const before=await snapshot(page), seq=before.events.at(-1)?.seq??0;
  await pointerDown(page,q);
  await expect.poll(async()=>{const state=await snapshot(page);return state.events.filter(e=>e.seq>seq && e.run===before.world.run && e.type==='movement' && e.data.source==='native').reduce((sum,e)=>sum+e.data.delta,0);},{intervals:[20,20,50]}).toBeGreaterThanOrEqual(ms);
  await page.mouse.up();
  const after=await snapshot(page);
  const events=after.events.filter(e=>e.seq>seq && e.run===before.world.run);
  const start=events.find(e=>e.type==='input_started');
  expect(start?.data.trusted).toBe(true);
  nearVector(start.data.raw,q,.5);
  const moves=events.filter(e=>e.type==='movement' && e.data.source==='native');
  if(Math.hypot(q.x-160,q.y-632)>8) expect(moves.length).toBeGreaterThan(0);
  let expected={...before.world.actorPosition};
  // Raw accepted input and scene delta are inputs to the oracle, never MOVE outputs.
  for(const {data} of moves) {
    expected=oracle(expected,start.data.raw,data.delta);
    nearVector(data.end,expected); expect(legal(data.end)).toBe(true);
  }
  nearVector(after.world.actorPosition,expected);
  expect(after.world.pointer).toBeNull();
  return {before,after,moves,expected,raw:start.data.raw};
}
async function still(page, milliseconds=140, frozenTime=false) {
  const a=(await snapshot(page)).world; await page.waitForTimeout(milliseconds);
  const b=(await snapshot(page)).world; near(b.position,a.position);
  if(frozenTime) expect(b.activeMs).toBe(a.activeMs);
  return b;
}
async function synthetic(page,p,d) {
  const length=Math.hypot(d.x,d.y), q=length ? {x:160+64*d.x/length,y:632+64*d.y/length}:C;
  const dt=length/240*1000;
  await page.evaluate(({p,q,dt})=>{ const api=window.__TASK04_WORLD_DEV__,s=api.snapshot().world;
    api.synthetic({position:p,pointer:q,delta:dt,session:s.session,run:s.run}); },{p,q,dt});
  const actual=(await snapshot(page)).world.actorPosition;
  near(actual,oracle(p,q,dt)); expect(legal(actual)).toBe(true); return actual;
}
async function hidden(page,value) {
  await page.evaluate(value=>{Object.defineProperty(document,'hidden',{configurable:true,value});document.dispatchEvent(new Event('visibilitychange'));},value);
}
async function disposed(page) {
  await expect.poll(async()=> (await snapshot(page)).foundation.live).toBe(0);
  const s=await snapshot(page);
  for(const key of ['live','objects','probes','sceneListeners','adapterListeners','observers','timers','tweens','orphanCallbacks']) expect(s.foundation[key],key).toBe(0);
  for(const world of s.history) { expect(world.lifecycle).toBe('DISPOSED'); expect(world.owned).toEqual({objects:0,domListeners:0,sceneBindings:0}); expect(world.actorPosition).toBeNull(); }
  expect(s.foundation.created).toBe(s.foundation.destroyed);
  expect(s.foundation.maxLive).toBeLessThanOrEqual(1);
  expect(s.events.some(e=>/complete|chase|capture/.test(e.type))).toBe(false);
  for(const e of s.events.filter(e=>e.type==='world_disposed')) expect(s.events.some(i=>i.run===e.run&&i.type==='world_invalidated'&&i.seq<e.seq)).toBe(true);
  await expect(page.locator('[data-testid="canvas-parent"] canvas')).toHaveCount(0);
  return s;
}
const errors=new WeakMap();
test.beforeEach(async({page})=>{
  const logs=[];errors.set(page,logs);
  page.on('pageerror',e=>logs.push(e.message));
  page.on('console',m=>{if(m.type()==='error' && !m.text().includes('503 (Service Unavailable)')) logs.push(m.text());});
  await page.route('https://pl00.invalid/**',route=>route.fulfill({status:503,body:'{}'}));
});
test.afterEach(async({page},info)=>{
  if(!page.isClosed()) {
    const s=await snapshot(page);
    if(s) { await info.attach('world-ledger-and-actor',{body:JSON.stringify(s,null,2),contentType:'application/json'}); expect(s.droppedEvents).toBe(0); }
    await page.screenshot({path:info.outputPath('world-evidence.png')});
  }
  await info.attach('browser-version',{body:page.context().browser().version(),contentType:'text/plain'});
  await info.attach('runtime-console-errors',{body:JSON.stringify(errors.get(page)),contentType:'application/json'});
  expect(errors.get(page)).toEqual([]);
});

test('T04-N01 DEV production exclusion and unchanged baseline/legacy boundary',async({page})=>{
  await open(page);
  for(const name of ['foundation','reveal','manga','flow']) {
    const path=`tests/phieng-loi/${name}.spec.mjs`;
    expect(readFileSync(path,'utf8')).toBe(execFileSync('git',['show',`${BASE}:${path}`],{encoding:'utf8'}));
  }
  const diff=execFileSync('git',['diff',BASE,'--name-only'],{encoding:'utf8'}).split('\n');
  expect(diff.filter(p=>p.startsWith('src/')&&!p.startsWith('src/game/phieng-loi/world/')&&p!=='src/pages/PhiengLoiV2Page.tsx')).toEqual([]);
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(DEV_URL.replace(':5173',':4173'));
  await expect(page.getByTestId('phaser-host')).toBeVisible();
  expect(await page.evaluate(()=>Boolean(window.__TASK04_WORLD_DEV__))).toBe(false);
  await expect(page.getByTestId('world-harness')).toHaveCount(0);
  expect(requests.some(u=>/world-move|WorldHarness/.test(new URL(u).pathname))).toBe(false);
  for(const file of readdirSync('dist/assets').filter(f=>f.endsWith('.js'))) {
    expect(readFileSync(`dist/assets/${file}`,'utf8')).not.toMatch(/__TASK04_WORLD_DEV__|task04-player-footpoint|T04-DEV-WM-CFG-P01/);
  }
});

test('T04-N02 StrictMode one actual actor and ready per validated run',async({page})=>{
  const s=await open(page);
  expect(s.foundation.mounts).toBeGreaterThanOrEqual(2); expect(s.foundation.maxLive).toBe(1);
  expect(s.history.filter(w=>w.ready)).toHaveLength(1);
  expect(s.world).toMatchObject({configId:'T04-DEV-WM-CFG-P01',pointer:null,vector:{x:0,y:0},sceneObjects:4});
  expect(s.world.owned).toEqual({objects:4,domListeners:9,sceneBindings:5});
  expect(s.events.filter(e=>e.type==='world_ready')).toHaveLength(1);
  expect(s.events.filter(e=>e.type==='movement')).toHaveLength(0);
  near(s.world.actorPosition,SPAWN); expect(s.world.actorPosition.name).toBe('task04-player-footpoint');
});

test('T04-N03 invalid geometry/config errors and clean new-session retry',async({page})=>{
  await open(page);
  for(const fault of ['bad-spawn','outside-spawn','footprint-spawn','bad-hit','bad-gap','missing-bounds','nonfinite','missing-stick-x','bad-footprint']) {
    await action(page,'reenter',[fault]);
    await expect.poll(async()=> (await snapshot(page)).world?.lifecycle).toBe('ERROR');
    const bad=await snapshot(page); expect(bad.world.ready).toBe(false); expect(bad.world.actorPosition).toBeNull();
    expect(bad.events.filter(e=>e.run===bad.world.run&&e.type==='world_ready')).toHaveLength(0);
    const good=await reenter(page);expect(good.world.session).not.toBe(bad.world.session);near(good.world.actorPosition,SPAWN);
  }
});

test('T04-N04 real pointer analog quarter/half/three-quarter/full and release',async({page})=>{
  await open(page);
  for(const m of [.25,.5,.75,1]) { await reenter(page); await nativeDrag(page,{x:160+8+56*m,y:632},1100); await still(page); }
});

test('T04-N05 exact synthetic dead/R/H boundaries and real leave-H ownership',async({page})=>{
  await open(page);
  for(const r of [0,7.999999,8,8.000001,63.999999,64,64.000001,79.999999,80,80.000001]) {
    await page.evaluate(r=>{const a=window.__TASK04_WORLD_DEV__,w=a.snapshot().world;a.synthetic({position:{x:240,y:300},pointer:{x:160+r,y:632},delta:100,session:w.session,run:w.run});},r);
    near((await snapshot(page)).world.actorPosition,oracle(SPAWN,{x:160+r,y:632},100));
  }
  await reenter(page);await pointerDown(page,{x:224,y:632});await page.waitForTimeout(80);
  await pointerMove(page,{x:241,y:632});expect((await snapshot(page)).world.pointer).toBeNull();await still(page);
  await pointerMove(page,{x:224,y:632});await still(page);await page.mouse.up();await nativeDrag(page,{x:224,y:632});
});

test('T04-N06 axis/diagonal no boost and partition-independent free displacement',async({page})=>{
  await open(page);
  for(const q of [{x:160+36,y:632},{x:160+36/Math.SQRT2,y:632-36/Math.SQRT2}]) {
    await reenter(page);const data=await nativeDrag(page,q,1150);
    const dt=data.moves.reduce((sum,e)=>sum+e.data.delta,0)/1000;
    expect(dt).toBeGreaterThanOrEqual(1);
    const distance=Math.hypot(data.after.world.actorPosition.x-240,data.after.world.actorPosition.y-300);
    const r=Math.hypot(data.raw.x-160,data.raw.y-632);
    expect(Math.abs(distance/dt-240*(r-8)/56)).toBeLessThanOrEqual(.1);
  }
  const results=[];
  for(const parts of [[1000],[250,250,250,250],Array(100).fill(10)]) {
    await page.evaluate(parts=>{const a=window.__TASK04_WORLD_DEV__,w=a.snapshot().world;let p={x:240,y:150};
      for(const delta of parts) {a.synthetic({position:p,pointer:{x:224,y:632},delta,session:w.session,run:w.run});p=a.snapshot().world.actorPosition;}},parts);
    results.push((await snapshot(page)).world.actorPosition);
  }
  for(const p of results) near(p,{x:480,y:150});
});

test('T04-N07 native instantaneous analog changes without acceleration or inertia',async({page})=>{
  await open(page);await pointerDown(page,{x:182,y:632});await page.waitForTimeout(1100);
  await pointerMove(page,{x:196,y:632});await page.waitForTimeout(500);await page.mouse.up();
  const s=await snapshot(page);let p={...SPAWN},q=null;
  for(const e of s.events) {
    if(['input_started','input_changed'].includes(e.type)) q=e.data.raw;
    if(e.type==='movement') { expect(q).not.toBeNull();p=oracle(p,q,e.data.delta);nearVector(e.data.end,p); }
  }
  nearVector(s.world.actorPosition,p);await still(page);
});

test('T04-N08 pointer cancellation lost capture blur outside secondary touch and pause UI',async({page})=>{
  await open(page);
  for(const kind of ['pointercancel','lostpointercapture','blur']) {
    await pointerDown(page,{x:224,y:632});await page.waitForTimeout(60);
    await page.evaluate(kind=>{const id=window.__TASK04_WORLD_DEV__.snapshot().world.pointer;
      if(kind==='blur') window.dispatchEvent(new Event('blur'));
      else (kind==='lostpointercapture'?document.querySelector('canvas'):window).dispatchEvent(new PointerEvent(kind,{pointerId:id}));},kind);
    expect((await snapshot(page)).world.pointer).toBeNull();await still(page);await page.mouse.up();
  }
  await page.mouse.click(450,550);expect((await snapshot(page)).world.pointer).toBeNull();await still(page);
  // CDP dispatch drives trusted touch PointerEvents in the browser, not a MOVE API.
  const client=await page.context().newCDPSession(page),a=await css(page,{x:196,y:632}),b=await css(page,{x:124,y:632});
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:31}]});
  const first=(await snapshot(page)).world.pointer;expect(first).not.toBeNull();
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:31},{...b,id:32}]});
  expect((await snapshot(page)).world.pointer).toBe(first);expect((await snapshot(page)).world.vector.x).toBeGreaterThan(0);
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await still(page);
  await pointerDown(page,{x:224,y:632});await button(page,'Pause world').evaluate(b=>b.click());
  expect((await snapshot(page)).world.pointer).toBeNull();await still(page,150,true);await page.mouse.up();
  await button(page,'Resume world').click();await still(page);await nativeDrag(page,{x:196,y:632});
});

test('T04-N09 bounds every edge and corner retain entire footprint and gap',async({page})=>{
  await open(page);
  for(const [p,d,expected] of [
    [{x:110,y:150},{x:-40,y:0},{x:94,y:150}],[{x:1170,y:150},{x:40,y:0},{x:1186,y:150}],
    [{x:300,y:110},{x:0,y:-40},{x:300,y:90}],[{x:300,y:490},{x:0,y:40},{x:300,y:510}],
    [{x:110,y:106},{x:-40,y:-40},{x:94,y:90}],[{x:1170,y:106},{x:40,y:-40},{x:1186,y:90}],
    [{x:110,y:494},{x:-40,y:40},{x:94,y:510}],[{x:1170,y:494},{x:40,y:40},{x:1186,y:510}],
    [{x:1170,y:480},{x:30,y:30},{x:1186,y:496}],
  ]) near(await synthetic(page,p,d),expected);
  await reenter(page);await nativeDrag(page,{x:96,y:632},900);near((await snapshot(page)).world.actorPosition,{x:94,y:300});
});

test('T04-N10 obstacle all faces/corners and open passages',async({page})=>{
  await open(page);
  for(const [p,d,expected] of [
    [{x:550,y:300},{x:100,y:0},{x:586,y:300}],[{x:810,y:300},{x:-100,y:0},{x:774,y:300}],
    [{x:680,y:180},{x:0,y:100},{x:680,y:210}],[{x:680,y:420},{x:0,y:-100},{x:680,y:390}],
    [{x:566,y:190},{x:40,y:40},{x:586,y:210}],[{x:794,y:190},{x:-40,y:40},{x:774,y:210}],
    [{x:566,y:410},{x:40,y:-40},{x:586,y:390}],[{x:794,y:410},{x:-40,y:-40},{x:774,y:390}],
    [{x:550,y:200},{x:240,y:0},{x:790,y:200}],[{x:550,y:400},{x:240,y:0},{x:790,y:400}],
  ]) near(await synthetic(page,p,d),expected);
  await reenter(page);await nativeDrag(page,{x:224,y:632},1800);near((await snapshot(page)).world.actorPosition,{x:586,y:300});await still(page);
});

test('T04-N11 whole-vector first contact held diagonal tangent away and grazing',async({page})=>{
  await open(page);
  near(await synthetic(page,{x:500,y:150},{x:120,y:120}),{x:586,y:236});
  near(await synthetic(page,{x:586,y:236},{x:20,y:20}),{x:586,y:236});
  near(await synthetic(page,{x:586,y:236},{x:0,y:20}),{x:586,y:256});
  near(await synthetic(page,{x:586,y:236},{x:-20,y:0}),{x:566,y:236});
  near(await synthetic(page,{x:576,y:220},{x:20,y:-20}),{x:596,y:200});
});

test('T04-N12 synthetic 1000ms sweep cannot tunnel through obstacle',async({page})=>{
  await open(page);near(await synthetic(page,{x:550,y:300},{x:240,y:0}),{x:586,y:300});
  expect((await snapshot(page)).events.some(e=>e.type==='movement'&&e.data.source==='synthetic'&&e.data.delta===1000)).toBe(true);
});

test('T04-N13 synthetic invalid delta ERROR retry without foundation clock edits',async({page})=>{
  await open(page);
  for(const value of [0,1000,-1,NaN,Infinity,1000.001]) {
    await reenter(page);
    await page.evaluate(delta=>{const a=window.__TASK04_WORLD_DEV__,w=a.snapshot().world;a.synthetic({position:{x:240,y:150},pointer:{x:224,y:632},delta,session:w.session,run:w.run});},value);
    const s=await snapshot(page);
    if(value===0 || value===1000) { expect(s.world.lifecycle).toBe('ACTIVE');near(s.world.actorPosition,{x:240+.24*value,y:150}); }
    else {expect(s.world.lifecycle).toBe('ERROR');expect(s.world.pointer).toBeNull();near(s.world.actorPosition,{x:240,y:150});await still(page,100,true);}
  }
});

test('T04-N14 resize letterbox portrait landscape idle drag paused camera and input',async({page},info)=>{
  await open(page);
  for(const [i,size] of [{width:1000,height:720},{width:390,height:844},{width:844,height:390},{width:1280,height:720}].entries()) {
    if(i===1) await pointerDown(page,{x:196,y:632});
    if(i===2) await action(page,'pause',[true]);
    const before=await snapshot(page);
    await page.setViewportSize(size);
    await expect(async()=>{const b=await page.locator('canvas').boundingBox();expect(Math.abs(b.width-Math.min(size.width,size.height*16/9))).toBeLessThan(2);}).toPass();
    await expect.poll(async()=> (await snapshot(page)).world.pointer).toBeNull();
    const s=await snapshot(page);
    expect(s.world.session).toBe(before.world.session);expect(s.world.run).toBe(before.world.run);
    const mapping=s.events.filter(e=>e.type==='mapping_changed').at(-1);
    near(s.world.actorPosition,mapping.data.position);
    if(i!==1) near(s.world.actorPosition,before.world.actorPosition);
    expect(s.world.camera).toEqual({scrollX:0,scrollY:0,zoom:1,rotation:0});
    await still(page);await page.mouse.up();
    await page.screenshot({path:info.outputPath(`resize-${i}.png`)});
    if(i===2) {expect(s.world.pauseReasons).toContain('manual');await action(page,'pause',[false]);}
    await nativeDrag(page,{x:196,y:632},80);
  }
});

test('T04-N15 manual pause freezes actor and active time fresh input no catchup',async({page})=>{
  await open(page);await pointerDown(page,{x:196,y:632});await page.waitForTimeout(100);
  await action(page,'pause',[true]);await still(page,500,true);await page.mouse.up();
  const p=(await snapshot(page)).world.position;await action(page,'pause',[false]);await still(page,300);near((await snapshot(page)).world.actorPosition,p);
  await nativeDrag(page,{x:196,y:632});expect((await snapshot(page)).events.filter(e=>e.type==='world_ready')).toHaveLength(1);
});

test('T04-N16 manual hidden pagehide pause owners released in both orders',async({page})=>{
  await open(page);
  for(const first of ['manual','hidden']) {
    await pointerDown(page,{x:196,y:632});await page.waitForTimeout(60);
    await hidden(page,true);await action(page,'pause',[true]);await still(page,160,true);await page.mouse.up();
    if(first==='manual') await action(page,'pause',[false]); else await hidden(page,false);
    await still(page,160,true);expect((await snapshot(page)).world.lifecycle).toBe('PAUSED');
    if(first==='manual') await hidden(page,false); else await action(page,'pause',[false]);
    await ready(page);await still(page);await nativeDrag(page,{x:196,y:632},60);
  }
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await still(page,160,true);
  await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await ready(page);await still(page);await nativeDrag(page,{x:196,y:632},60);
});

test('T04-N17 two MOVE locks never release another owner or global pause',async({page})=>{
  await open(page);await pointerDown(page,{x:196,y:632});await action(page,'lock',['a',true]);await action(page,'lock',['b',true]);await page.mouse.up();
  expect((await snapshot(page)).runtime.paused).toBe(false);
  await still(page,100,true);await action(page,'pause',[true]);await action(page,'lock',['a',false]);
  expect((await snapshot(page)).world.moveLockReasons).toEqual(['b']);expect((await snapshot(page)).runtime.paused).toBe(true);
  await action(page,'lock',['b',false]);expect((await snapshot(page)).runtime.paused).toBe(true);await still(page,100,true);
  await action(page,'pause',[false]);await ready(page);await still(page);await nativeDrag(page,{x:196,y:632});
});

test('T04-N18 cancel unmount route-exit BOOTING ACTIVE PAUSED no completion',async({page},info)=>{
  for(const mode of ['cancel','unmount','route']) {
    let release;const hold=new Promise(resolve=>release=resolve);
    await page.route('**/src/game/phieng-loi/createGame.ts*',async route=>{await hold;await route.continue();});
    await page.goto(DEV_URL);await expect(page.getByTestId('world-harness')).toBeVisible();
    await page.waitForFunction(()=>window.__TASK04_WORLD_DEV__);
    expect((await snapshot(page)).world).toBeNull();
    await page.evaluate(()=>window.__t04BootRead=window.__TASK04_WORLD_DEV__.snapshot);
    if(mode==='route') await page.getByRole('link',{name:'Exit world route',exact:true}).click(); else await action(page,mode);
    release();await page.unroute('**/src/game/phieng-loi/createGame.ts*');
    if(mode==='route') {await expect(page.getByTestId('world-harness')).toHaveCount(0);expect(await snapshot(page)).toBeUndefined();}
    else await disposed(page);
    await expect.poll(()=>page.evaluate(()=>window.__t04BootRead().runtime.disposed)).toBe(true);
    const boot=await page.evaluate(()=>window.__t04BootRead());
    expect(boot.foundation.created).toBe(0);expect(boot.foundation.readyEvents).toBe(0);
    await info.attach(`boot-${mode}`,{body:JSON.stringify(boot),contentType:'application/json'});
    for(const paused of [false,true]) {
      // Exercise actual same-document re-entry after teardown, rather than
      // discarding the application and its teardown barrier via full reload.
      if(mode==='route') { await page.goBack(); await ready(page); }
      else await reenter(page);
      await nativeDrag(page,{x:196,y:632},50);if(paused) await action(page,'pause',[true]);
      // Capture a read-only closure so route-exit cleanup can be observed after API deletion.
      await page.evaluate(()=>window.__t04Read=window.__TASK04_WORLD_DEV__.snapshot);
      if(mode==='route') { await page.getByRole('link',{name:'Exit world route',exact:true}).click();
        await expect.poll(async()=>page.evaluate(()=>window.__t04Read().foundation.live)).toBe(0);
        const s=await page.evaluate(()=>window.__t04Read());expect(s.foundation.objects).toBe(0);expect(s.world.owned.domListeners).toBe(0);
        await info.attach(`route-${paused}`,{body:JSON.stringify(s),contentType:'application/json'});
      } else {await action(page,mode);await disposed(page);}
    }
  }
});

test('T04-N19 restart reentry reject previous run/session delivery',async({page})=>{
  await open(page);await nativeDrag(page,{x:196,y:632});
  const old=await snapshot(page);await page.evaluate(()=>window.__late=window.__TASK04_WORLD_DEV__.staleDelivery());
  await pointerDown(page,{x:196,y:632});
  await action(page,'restart');await expect.poll(async()=> (await snapshot(page)).world.run).toBeGreaterThan(old.world.run);await ready(page);
  const restarted=await snapshot(page);expect(restarted.world.session).toBe(old.world.session);near(restarted.world.actorPosition,SPAWN);
  await pointerMove(page,{x:224,y:632});await still(page);await page.mouse.up();
  await page.evaluate(()=>window.__late());await still(page);near((await snapshot(page)).world.actorPosition,SPAWN);
  await page.evaluate(()=>window.__late=window.__TASK04_WORLD_DEV__.staleDelivery());await pointerDown(page,{x:196,y:632});await reenter(page);
  await pointerMove(page,{x:224,y:632});await still(page);await page.mouse.up();await page.evaluate(()=>window.__late());
  const next=await snapshot(page);expect(next.world.session).not.toBe(old.world.session);near(next.world.actorPosition,SPAWN);
  expect(next.history.filter(w=>w.staleRejected===1)).toHaveLength(2);
});

test('T04-N20 twenty full cycles with real MOVE restart pause and zero teardown',async({page},info)=>{
  await open(page);const cycles=[];
  for(let i=0;i<20;i++) {
    await nativeDrag(page,{x:196,y:632},35);const before=await snapshot(page);
    await action(page,'restart');await expect.poll(async()=> (await snapshot(page)).world.run).toBeGreaterThan(before.world.run);await ready(page);
    expect((await snapshot(page)).world.sceneObjects).toBe(4);
    await action(page,'pause',[true]);await action(page,'cancel');cycles.push(await disposed(page));
    await action(page,'pause',[false]);await reenter(page);
  }
  await action(page,'unmount');await disposed(page);await info.attach('twenty-cycle-cleanup',{body:JSON.stringify(cycles),contentType:'application/json'});
});

test('T04-N21 world actions leave Task03 real handoff unchanged',async({page},info)=>{
  await open(page);await nativeDrag(page,{x:224,y:632},1700);await action(page,'pause',[true]);await action(page,'unmount');await disposed(page);
  const writes=[];page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url());});
  await page.goto('http://localhost:5173/phieng-loi?dev=hs-flow');await expect(button(page,'Start flow')).toBeEnabled();await button(page,'Start flow').click();
  await expect(button(page,'Khung tiếp')).toBeEnabled();await button(page,'Khung tiếp').click();await expect(button(page,'Khung tiếp')).toBeEnabled();await button(page,'Khung tiếp').click();
  await expect(button(page,'Đóng sau khi xem xong')).toBeEnabled();await button(page,'Đóng sau khi xem xong').click();
  await expect.poll(()=>page.evaluate(()=>window.__HS_FLOW_DEV__.snapshot().flow.phase)).toBe('HANDOFF');
  const s=await page.evaluate(()=>window.__HS_FLOW_DEV__.snapshot());
  expect(s.flow.chaseRequests).toBe(1);expect(s.handoffs).toHaveLength(1);expect(s.handoffs[0]).toMatchObject({revealClean:true,mangaCount:0,paused:false});
  expect(s.voice.status).toBe('unbound');expect(s.mangaCount).toBe(0);expect(writes).toEqual([]);
  await page.waitForTimeout(200);expect(await page.evaluate(()=>window.__HS_FLOW_DEV__.snapshot().flow.chaseRequests)).toBe(1);
  await info.attach('unchanged-handoff-only',{body:JSON.stringify(s),contentType:'application/json'});
});

for(const renderer of ['auto','canvas','fallback']) test(`T04-N22 ${renderer} native pointer bounds obstacle and controlled cross-renderer oracle`,async({page},info)=>{
  if(renderer==='fallback') await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){if(String(kind).includes('webgl'))return null;return get.call(this,kind,...args);};});
  await open(page);if(renderer==='canvas') await reenter(page,'approved','canvas');
  expect((await snapshot(page)).runtime.renderer).toBe(renderer==='auto'?'webgl':'canvas');
  await nativeDrag(page,{x:224,y:632},1800);near((await snapshot(page)).world.actorPosition,{x:586,y:300});
  await nativeDrag(page,{x:96,y:632},2400);near((await snapshot(page)).world.actorPosition,{x:94,y:300});
  near(await synthetic(page,{x:500,y:150},{x:120,y:120}),{x:586,y:236});
  await page.screenshot({path:info.outputPath(`renderer-${renderer}.png`)});
});
