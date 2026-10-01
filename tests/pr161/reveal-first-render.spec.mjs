import {test,expect} from '@playwright/test';

const frames=Array.from({length:25},(_,i)=>i+1);
const button=(page,name)=>page.getByRole('button',{name,exact:true});
const snapshot=async page=>{
  await button(page,'Snapshot').click();
  return JSON.parse(await page.getByTestId('reveal-snapshot').textContent());
};
for(const fps of [15,12])test(`PR161 replay at ${fps} fps renders frame 1 before a long first native update`,async({page},info)=>{
  await page.clock.install();
  await page.goto('http://localhost:5173/phieng-loi?dev=hs-reveal');
  await expect.poll(async()=>(await snapshot(page)).reveal?.phase).toBe('idle');
  if(fps===12){
    await button(page,'Unmount').click();
    await page.getByLabel('FPS',{exact:true}).selectOption('12');
    await button(page,'Mount').click();
    await expect.poll(async()=>(await snapshot(page)).reveal?.phase).toBe('idle');
  }
  // Drive browser time only. Do not call Phaser.step, change its delta/clock,
  // replace sprites, inject an animation callback, or edit the render probe.
  await page.clock.pauseAt(await page.evaluate(()=>Date.now()+60000));
  await page.clock.runFor(3000);
  await button(page,'Play').click();
  await page.clock.runFor(3000);
  const first=await snapshot(page);
  expect(first.reveal.phase).toBe('completed');
  expect(first.reveal.visitedFrames).toEqual(frames);
  expect(first.reveal.renderedFrames).toEqual(frames);
  // Warm native delta history to 100 ms before replay. That is above both
  // authored frame intervals (66.67/83.33 ms), without changing Phaser config.
  for(let i=0;i<12;i++)await page.clock.fastForward(100);
  await button(page,'Play').click();
  const before=await snapshot(page);
  await page.clock.fastForward(100);
  const firstDraw=await snapshot(page);
  await info.attach('first-native-render',{body:JSON.stringify({fps,before,firstDraw},null,2),contentType:'application/json'});
  expect(firstDraw.reveal.renderedFrames).toEqual([1]);
  expect(firstDraw.reveal.visitedFrames).toEqual([1]);
  await page.screenshot({path:info.outputPath('replay-first-frame.png')});
  for(let i=0;i<30;i++)await page.clock.fastForward(100);
  const replay=await snapshot(page);
  expect(replay.reveal.phase).toBe('completed');
  expect(replay.reveal.visitedFrames).toEqual(frames);
  expect(replay.reveal.renderedFrames).toEqual(frames);
  expect(replay.events.map(e=>e.runId)).toEqual([1,2]);
  expect(replay.events.every(e=>e.clean)).toBe(true);
  await info.attach('completed-replay',{body:JSON.stringify(replay,null,2),contentType:'application/json'});
  // Cancellation before the deferred first update must remove its callback.
  await button(page,'Play').click();await button(page,'Cancel').click();
  await page.clock.fastForward(100);
  const cancelled=await snapshot(page);
  expect(cancelled.reveal.phase).toBe('cancelled');
  expect(cancelled.reveal.rootCount).toBe(0);
  expect(cancelled.events).toEqual(replay.events);
  await button(page,'Play').click();await button(page,'Pause').click();
  await page.clock.fastForward(100);
  const paused=await snapshot(page);
  expect(paused.reveal.renderedFrames).toEqual([]);
  await button(page,'Unmount').click();await page.clock.runFor(32);
  const disposed=await snapshot(page);
  expect(disposed.reveal.phase).toBe('disposed');
  expect(disposed.foundation.live).toBe(0);
  expect(disposed.events).toEqual(replay.events);
});
