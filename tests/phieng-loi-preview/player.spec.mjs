import {test,expect} from '@playwright/test';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertTask06Boundary} from '../../scripts/task06-boundary.mjs';
const button=(p,n)=>p.getByRole('button',{name:n,exact:true});
const phase=p=>p.locator('.t06-preview');
const at=(p,s)=>expect(phase(p)).toHaveAttribute('data-phase',s);
async function open(p){await p.goto('/phieng-loi');await expect(button(p,'Bắt đầu')).toBeEnabled();}
async function manga(p){await open(p);await button(p,'Bắt đầu').click();await at(p,'MANGA');}
async function chase(p){await manga(p);await button(p,'Khung tiếp').click();await button(p,'Khung tiếp').click();await button(p,'Đóng sau khi xem xong').click();await at(p,'CHASE');}
test.afterEach(async({page},info)=>{await page.screenshot({path:info.outputPath('preview.png')});await info.attach('candidate',{body:execFileSync('git',['rev-parse','HEAD','HEAD^{tree}']),contentType:'text/plain'});});
test('Q01 direct route refresh and exact candidate identity',async({page,request})=>{
 const v=await (await request.get('/preview-version.json')).json();
 expect(v.sha).toBe(process.env.TASK06_EXPECT_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());expect(v.dirty).toBe(false);
 await open(page);await expect(page.getByText('PHIÊNG LƠI · PREVIEW',{exact:true})).toBeVisible();await page.reload();await expect(button(page,'Bắt đầu')).toBeEnabled();
 await expect(page.locator('.t06-bar small')).toHaveAttribute('title',v.sha);
});
test('Q02 preview has no harness APIs and ordinary build stays excluded',async({page})=>{
 await page.goto('/phieng-loi?dev=hs01-play');await expect(button(page,'Bắt đầu')).toBeEnabled();
 expect(await page.evaluate(()=>Object.keys(window).filter(k=>/^__(TASK0[345]|PL00|HS01)/.test(k)))).toEqual([]);
 await expect(button(page,'Re-enter')).toHaveCount(0);
 for(const f of readdirSync('dist/assets').filter(f=>f.endsWith('.js')))expect(readFileSync('dist/assets/'+f,'utf8')).not.toMatch(/__TASK05_DEV__|t06-preview|task04-player-footpoint/);
});
test('Q03 double Start still presents one manga and one canvas',async({page})=>{
 await open(page);await button(page,'Bắt đầu').dblclick();await at(page,'MANGA');await expect(page.locator('canvas')).toHaveCount(1);await expect(page.getByRole('dialog',{name:'Manga HeeSun'})).toHaveCount(1);
});
test('Q04 manga manual back navigation and pause',async({page})=>{
 await manga(page);await page.waitForTimeout(1500);await expect(page.getByText('1 / 3',{exact:true})).toBeVisible();
 await button(page,'Khung tiếp').click();await button(page,'Khung trước').click();await expect(page.getByText('1 / 3',{exact:true})).toBeVisible();
 await button(page,'Tạm dừng').click();await expect(button(page,'Khung tiếp')).toBeDisabled();await button(page,'Tiếp tục').click();await expect(button(page,'Khung tiếp')).toBeEnabled();
});
test('Q05 real contact audio stand drunk recovery through visible controls',async({page})=>{
 await chase(page);await expect(phase(page)).toHaveAttribute('data-phase','DRUNK',{timeout:20000});
 await expect(page.getByTestId('preview-balance')).toContainText('0 xu');
 await expect(phase(page)).toHaveAttribute('data-phase','COMPLETE',{timeout:10000});
 await expect(page.getByText('Đã hồi phục',{exact:true})).toBeVisible();await expect(button(page,'PHÀ ƠI')).toHaveCount(0);
 await page.mouse.move(160,632);await page.mouse.down();await page.mouse.move(190,632);await page.waitForTimeout(250);await page.mouse.up();await at(page,'COMPLETE');
});
test('Q06 manual and hidden pause cannot catch up chase',async({page,context})=>{
 await chase(page);await button(page,'Tạm dừng').click();await page.waitForTimeout(2500);await at(page,'CHASE');
 const other=await context.newPage();await other.goto('about:blank');await page.waitForTimeout(1000);await page.bringToFront();await other.close();await at(page,'CHASE');
 await expect(button(page,'Tiếp tục')).toBeVisible();await button(page,'Tiếp tục').click();await expect(phase(page)).toHaveAttribute('data-phase','COMPLETE',{timeout:25000});
});
test('Q07 replay creates a fresh fixture session after recovery',async({page})=>{
 await chase(page);const session=await phase(page).getAttribute('data-session');await expect(phase(page)).toHaveAttribute('data-phase','COMPLETE',{timeout:25000});
 await button(page,'Chơi lại').click();await expect(button(page,'Bắt đầu')).toBeEnabled();expect(await phase(page).getAttribute('data-session')).not.toBe(session);await expect(page.locator('canvas')).toHaveCount(1);await at(page,'IDLE');
});
test('Q08 exit during reveal tears down canvas and reentry starts idle',async({page})=>{
 await open(page);await button(page,'Bắt đầu').click();await page.getByRole('link',{name:'Thoát',exact:true}).click();await expect(page.locator('.t06-preview')).toHaveCount(0);await expect(page.locator('.pl-v2-host')).toHaveCount(0);
 await page.waitForTimeout(2000);await open(page);await at(page,'IDLE');await expect(page.locator('canvas')).toHaveCount(1);
});
test('Q09 image failure cannot complete and retry starts manga page one',async({page})=>{
 await page.route('**/heesun-02*',r=>r.abort());await manga(page);const session=await phase(page).getAttribute('data-session');await button(page,'Khung tiếp').click();await expect(page.getByText('Không tải được ảnh. Hãy mở lại màn xem.')).toBeVisible();
 await expect(button(page,'Đóng sau khi xem xong')).toHaveCount(0);await page.unroute('**/heesun-02*');await button(page,'Tải lại manga từ trang 1').click();await expect(page.getByText('1 / 3',{exact:true})).toBeVisible();await at(page,'MANGA');expect(await phase(page).getAttribute('data-session')).toBe(session);
});
test('Q10 failed native audio cannot fake recovery',async({page})=>{
 await page.route('**/blackout-*.wav',r=>r.abort());await open(page);await button(page,'Bắt đầu').click();await expect(page.locator('.t06-error')).toBeVisible();await page.waitForTimeout(4500);expect(await phase(page).getAttribute('data-phase')).not.toBe('COMPLETE');await expect(button(page,'Thử lại')).toBeVisible();
 await page.unroute('**/blackout-*.wav');await button(page,'Thử lại').click();await expect(button(page,'Bắt đầu')).toBeEnabled();
});
test('Q11 touch layout and resize retain manual manga state',async({browser})=>{
 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const page=await context.newPage();
 await page.goto((process.env.TASK06_URL||'http://localhost:4176')+'/phieng-loi');await expect(button(page,'Bắt đầu')).toBeEnabled();await button(page,'Bắt đầu').tap();await at(page,'MANGA');await button(page,'Khung tiếp').tap();
 await page.setViewportSize({width:390,height:844});await expect(page.getByText('2 / 3',{exact:true})).toBeVisible();await page.setViewportSize({width:844,height:390});await button(page,'Khung tiếp').tap();await expect(button(page,'Đóng sau khi xem xong')).toBeEnabled();await context.close();
});
test('Q12 narrow boundary rejects changed allowed bytes and extra upstream source',()=>{
 const pins=JSON.parse(readFileSync('docs/task06/upstream-exceptions.json'));const paths=[...pins.files.map(r=>r.path),'src/game/phieng-loi/reveal/HeeSunReveal.ts'];
 expect(()=>assertTask06Boundary(paths)).not.toThrow();expect(()=>assertTask06Boundary([...paths,'src/App.tsx'])).toThrow();
 for(const p of pins.files)expect(()=>assertTask06Boundary(paths,f=>f===p.path?Buffer.concat([readFileSync(f),Buffer.from('\n// unauthorized')]):readFileSync(f))).toThrow(/Unauthorized source bytes/);
});
