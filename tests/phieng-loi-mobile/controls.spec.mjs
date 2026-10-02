import {test,expect} from '@playwright/test';
const b=(p,n)=>p.getByRole('button',{name:n,exact:true});
const root=p=>p.locator('.t06-preview');
const at=(p,s)=>expect(root(p)).toHaveAttribute('data-phase',s,{timeout:30000});
const read=p=>root(p).evaluate(e=>({...e.dataset}));
async function open(p){await p.goto('/phieng-loi');await b(p,'Bắt đầu').tap();await b(p,'Khung tiếp').tap();await b(p,'Khung tiếp').tap();await expect(b(p,'Đóng sau khi xem xong')).toBeEnabled();}
async function chase(p){await open(p);await b(p,'Đóng sau khi xem xong').tap();await at(p,'CHASE');}
async function visibleTarget(p,locator){const r=await locator.boundingBox();expect(r).not.toBeNull();const size=p.viewportSize();expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(size.width+1);expect(r.y+r.height).toBeLessThanOrEqual(size.height+1);expect(await locator.evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;})).toBe(true);return r;}
async function hold(p,info,ms=220){const r=await p.locator('canvas').boundingBox();const x=r.x+192*r.width/1280,y=r.y+632*r.height/720;
 if(info.project.name.startsWith('chromium')){const c=await p.context().newCDPSession(p);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await p.waitForTimeout(ms);return async()=>{await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();};}
 // WebKit exposes trusted tap, not a multi-event drag API. Use native mouse hold
 // for continuous MOVE, and independently test a trusted touch on PHÀ ƠI.
 await p.mouse.move(x,y);await p.mouse.down();await p.waitForTimeout(ms);return()=>p.mouse.up();
}
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{window.mobileObservation=[];let prior='';function sample(){const e=document.querySelector('.t06-preview');if(e){const s={...e.dataset};const v=JSON.stringify(s);if(v!==prior){prior=v;window.mobileObservation.push({wallMs:performance.now(),...s});}}requestAnimationFrame(sample);}requestAnimationFrame(sample);document.addEventListener('pointerdown',e=>window.mobileObservation.push({wallMs:performance.now(),event:'pointerdown',trusted:e.isTrusted,pointerType:e.pointerType,target:e.target.tagName,x:e.clientX,y:e.clientY}),true);});
});
test.afterEach(async({page},info)=>{await info.attach('phase-input-timeline',{body:JSON.stringify({environment:'Playwright Linux mobile emulation, NOT a physical iPhone',gesture:info.project.name.startsWith('webkit')?'native WebKit touch taps; native mouse hold for continuous MOVE':'native Chromium touch hold',visibility:'synthetic document.hidden + visibilitychange, NOT OS app switching',observations:await page.evaluate(()=>window.mobileObservation)},null,2),contentType:'application/json'});await page.screenshot({path:info.outputPath('final.png')});});

test('M01 manga warning, visible trusted PHÀ tap and native MOVE in CHASE [P05,P11]',async({page},info)=>{
 await open(page);await expect(page.locator('.t06-controls-guide')).toContainText('bắt đầu bị đuổi ngay');await page.screenshot({path:info.outputPath('last-manga.png')});
 await b(page,'Đóng sau khi xem xong').tap();await at(page,'CHASE');await b(page,'Tạm dừng').tap();await visibleTarget(page,b(page,'PHÀ ƠI'));await expect(b(page,'PHÀ ƠI')).toBeDisabled();await expect(page.locator('.t06-move-label')).toBeVisible();await page.screenshot({path:info.outputPath('chase-controls.png')});
 const x=Number((await read(page)).playerX);await b(page,'Tiếp tục').tap();const release=await hold(page,info,160);await release();await expect.poll(async()=>Number((await read(page)).playerX)).toBeGreaterThan(x+2);
 await b(page,'PHÀ ƠI').tap();await expect(root(page)).toHaveAttribute('data-call-trusted','true');const call=await read(page);expect(call.callOutcome).toMatch(/^(normal|TRUE_NOTHING)$/);expect(Number(call.callAt)).toBeGreaterThanOrEqual(0);await expect(b(page,'PHÀ ƠI')).toBeDisabled();await expect(page.getByRole('status')).toContainText('Đã nhận PHÀ ƠI');
 await at(page,'COMPLETE');const end=await read(page);expect(end.captureId).toBe('1');expect(end.recoveryCount).toBe('1');await expect(b(page,'PHÀ ƠI')).toHaveCount(0);
});

test('M02 real native MOVE is inverted during drunk and normal after recovery [P07]',async({page},info)=>{
 await chase(page);await at(page,'DRUNK');const start=await read(page);const release=await hold(page,info);await release();await expect.poll(async()=>Number((await read(page)).playerX)).toBeLessThan(Number(start.playerX)-3);await page.screenshot({path:info.outputPath('drunk-move.png')});
 await at(page,'COMPLETE');const normal=await read(page);expect(normal.captureId).toBe('1');expect(normal.recoveryCount).toBe('1');const up=await hold(page,info);await up();await expect.poll(async()=>Number((await read(page)).playerX)).toBeGreaterThan(Number(normal.playerX)+3);await page.screenshot({path:info.outputPath('normal-move.png')});
 const rows=await page.evaluate(()=>window.mobileObservation);const drunk=rows.find(r=>r.phase==='DRUNK'&&Number(r.phaseMs)>0),done=rows.find(r=>r.phase==='COMPLETE');expect(drunk).toBeTruthy();expect(done).toBeTruthy();expect(Number(done.activeMs)-Number(drunk.activeMs)+Number(drunk.phaseMs)).toBeGreaterThanOrEqual(5000);expect(Number(done.activeMs)-Number(drunk.activeMs)+Number(drunk.phaseMs)).toBeLessThan(5300);
});

test('M03 orientation, resize and pause clear held input without catch-up [P07,P08,P11]',async({page},info)=>{
 await chase(page);await at(page,'COMPLETE');const landscape=page.viewportSize();const up=await hold(page,info,60);await page.setViewportSize({width:390,height:844});await expect(root(page)).toHaveAttribute('data-pointer-active','false');await up();await page.setViewportSize(landscape);await page.waitForTimeout(180);
 const frozen=await read(page);await page.waitForTimeout(220);expect((await read(page)).playerX).toBe(frozen.playerX);expect((await read(page)).playerY).toBe(frozen.playerY);
 // Keyboard activation avoids fabricating a second compatibility click by mixing
 // a held WebKit mouse with touchscreen.tap's cursor movement. M01 tests touch pause.
 const release=await hold(page,info,60);await b(page,'Tạm dừng').press('Enter');await expect(root(page)).toHaveAttribute('data-paused','true');await release();await expect(root(page)).toHaveAttribute('data-pointer-active','false');const paused=await read(page);await page.waitForTimeout(300);expect((await read(page)).activeMs).toBe(paused.activeMs);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await b(page,'Tiếp tục').tap();await page.waitForTimeout(300);expect((await read(page)).activeMs).toBe(paused.activeMs);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(160);const before=await read(page);const end=await hold(page,info,180);await end();await expect.poll(async()=>Number((await read(page)).playerX)).toBeGreaterThan(Number(before.playerX)+3);expect((await read(page)).phase).toBe('COMPLETE');
});
