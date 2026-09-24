import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

const URL = 'http://localhost:5173/phieng-loi?dev=hs-reveal';
const frames = Array.from({ length: 25 }, (_, index) => index + 1);
const button = (page, name) => page.getByRole('button', { name, exact: true });
async function snapshot(page) {
  await button(page, 'Snapshot').click();
  return JSON.parse(await page.getByTestId('reveal-snapshot').textContent());
}
async function ready(page) {
  await button(page, 'Snapshot').waitFor({ state: 'visible' });
  await expect.poll(async () => {
    const s = await snapshot(page);
    return s.foundation.live === 1 && s.status?.state === 'ready' && s.reveal?.phase === 'idle';
  }).toBe(true);
  return snapshot(page);
}
async function phase(page, value) {
  await expect.poll(async () => (await snapshot(page)).reveal.phase, { intervals: [20] }).toBe(value);
  return snapshot(page);
}
async function evidence(info, name, value) {
  await info.attach(name, { body: JSON.stringify(value, null, 2), contentType: 'application/json' });
}

const browserLogs = new WeakMap();
test.beforeEach(async ({ page }) => {
  const logs = [];
  browserLogs.set(page, logs);
  page.on('pageerror', (error) => logs.push({ type: 'exception', text: error.message }));
  page.on('console', (message) => logs.push({ type: message.type(), text: message.text() }));
  await page.route('https://pl00.invalid/**', (route) => route.fulfill({
    status: 503, contentType: 'application/json', body: '{"message":"Backend unavailable in PL-00 test"}',
  }));
});
test.afterEach(async ({ page }, info) => {
  const logs = browserLogs.get(page);
  await evidence(info, 'browser-console', logs);
  // The missing-asset test deliberately creates an HTTP 404, not a runtime error.
  const unexpected = logs.filter((entry) => entry.type === 'exception'
    || (entry.type === 'error' && !(info.title.includes('missing asset') && entry.text.includes('404'))));
  expect(unexpected).toEqual([]);
});

for (const fps of [15, 12]) {
  test(`reveal ${fps} fps: 25 rendered frames in order, one completion after cleanup, replay`, async ({ page }, info) => {
    await page.goto(URL);
    await ready(page);
    if (fps !== 15) {
      await button(page, 'Unmount').click();
      await expect.poll(async () => (await snapshot(page)).foundation.live).toBe(0);
      await page.getByLabel('FPS', { exact: true }).selectOption(String(fps));
      await button(page, 'Mount').click();
      await ready(page);
    }
    const initial = await snapshot(page);
    await button(page, 'Play').click();
    await button(page, 'Play').click();
    const active = await snapshot(page);
    expect(active.reveal.runId).toBe(1);
    expect(active.reveal.layers).toEqual(['BeerTowerBack', 'HaloGlow', 'RibbonBack', 'HeeSunSprite25F']);
    expect(active.reveal.rootCount).toBe(1);
    expect(active.reveal.auraCount).toBe(3);
    expect(active.reveal.voice.status).toBe('unbound');
    expect(active.reveal.voice.approvedCueSeconds).toBeNull();
    const completed = await phase(page, 'completed');
    expect(completed.reveal.visitedFrames).toEqual(frames);
    expect(completed.reveal.renderedFrames).toEqual(frames);
    expect(completed.reveal.fps).toBe(fps);
    expect(completed.reveal.repeat).toBe(0);
    expect(completed.reveal.skipMissedFrames).toBe(false);
    expect(completed.reveal.animationCompleted).toBe(true);
    expect(completed.reveal.elapsedMs).toBeGreaterThanOrEqual(25000 / fps - 40);
    expect(completed.reveal.elapsedMs).toBeLessThan(25000 / fps + 250);
    expect(completed.reveal).toMatchObject({ rootCount: 0, auraCount: 0, sceneObjects: 0, sceneTweens: 0, completionCount: 1 });
    expect(completed.events).toEqual([{ type: 'reveal_complete', runId: 1, sessionId: initial.runtime.sessionId, clean: true }]);
    await page.waitForTimeout(300);
    expect((await snapshot(page)).events).toEqual(completed.events);
    await button(page, 'Play').click();
    const replay = await phase(page, 'completed');
    expect(replay.reveal.visitedFrames).toEqual(frames);
    expect(replay.reveal.renderedFrames).toEqual(frames);
    expect(replay.events.map((event) => event.runId)).toEqual([1, 2]);
    expect(replay.events.every((event) => event.clean)).toBe(true);
    expect(replay.foundation.maxLive).toBe(1);
    await evidence(info, 'playback-and-replay', { initial, active, completed, replay });
    await page.screenshot({ path: info.outputPath('completed-clean.png') });
  });
}

test('pause/resume freezes frames and aura; fade pause does not complete early', async ({ page }, info) => {
  await page.goto(URL);
  await ready(page);
  await button(page, 'Play').click();
  await page.waitForTimeout(350);
  await button(page, 'Pause').click();
  const paused = await snapshot(page);
  await page.screenshot({ path: info.outputPath('reveal-paused-1280x720.png') });
  await button(page, 'Play').click();
  await page.waitForTimeout(1100);
  const held = await snapshot(page);
  expect(held.runtime.paused).toBe(true);
  expect(held.reveal).toEqual(paused.reveal);
  expect(held.events).toHaveLength(0);
  await button(page, 'Resume').click();
  // Observe and pause in the same browser task. A protocol round trip plus
  // actionability checks can otherwise outlast the authored 200ms fade.
  await page.waitForFunction(async () => {
    const control = (name) => [...document.querySelectorAll('button')]
      .find((element) => element.textContent === name);
    control('Snapshot').click();
    await Promise.resolve();
    const value = JSON.parse(document.querySelector('[data-testid="reveal-snapshot"]').textContent);
    if (value.reveal.phase !== 'finishing') return false;
    control('Pause').click();
    return true;
  }, null, { polling: 'raf', timeout: 10000 });
  const fadePaused = await snapshot(page);
  expect(fadePaused.reveal.phase).toBe('finishing');
  await page.waitForTimeout(500);
  const fadeHeld = await snapshot(page);
  expect(fadeHeld.reveal).toEqual(fadePaused.reveal);
  expect(fadeHeld.events).toHaveLength(0);
  await button(page, 'Resume').click();
  const completed = await phase(page, 'completed');
  expect(completed.reveal.renderedFrames).toEqual(frames);
  expect(completed.events).toHaveLength(1);
  expect(completed.events[0].clean).toBe(true);
  await evidence(info, 'pause-resume', { paused, held, fadePaused, fadeHeld, completed });
});

test('cancel, scene restart and immediate re-entry leave no stale root or callback', async ({ page }, info) => {
  await page.goto(URL);
  await ready(page);
  await button(page, 'Play').click();
  await page.waitForTimeout(250);
  await button(page, 'Cancel').click();
  const cancelled = await snapshot(page);
  expect(cancelled.reveal).toMatchObject({ phase: 'cancelled', rootCount: 0, auraCount: 0, sceneObjects: 0, sceneTweens: 0 });
  await button(page, 'Play').click();
  await button(page, 'Restart scene').click();
  const restarted = await ready(page);
  expect(restarted.events).toHaveLength(0);
  expect(restarted.reveal.rootCount).toBe(0);
  await button(page, 'Play').click();
  await button(page, 'Pause').click();
  await button(page, 'Re-enter now').click();
  const reentered = await ready(page);
  expect(reentered.runtime.sessionId).not.toBe(restarted.runtime.sessionId);
  expect(reentered.foundation.maxLive).toBe(1);
  expect(reentered.events).toHaveLength(0);
  await button(page, 'Play').click();
  const completed = await phase(page, 'completed');
  expect(completed.events).toHaveLength(1);
  expect(completed.events[0]).toMatchObject({ sessionId: reentered.runtime.sessionId, clean: true });
  await button(page, 'Play').click();
  await button(page, 'Pause').click();
  await button(page, 'Unmount').click();
  await expect.poll(async () => (await snapshot(page)).foundation.live).toBe(0);
  await page.waitForTimeout(300);
  const unmounted = await snapshot(page);
  expect(unmounted.reveal.phase).toBe('disposed');
  expect(unmounted.reveal.rootCount).toBe(0);
  expect(unmounted.foundation.adapterListeners).toBe(0);
  expect(unmounted.foundation.sceneListeners).toBe(0);
  expect(unmounted.foundation.observers).toBe(0);
  expect(unmounted.foundation.created).toBe(unmounted.foundation.destroyed);
  expect(unmounted.events).toHaveLength(1);
  await expect(page.locator('canvas')).toHaveCount(0);
  await evidence(info, 'cancellation-and-cleanup', { cancelled, restarted, reentered, completed, unmounted });
});

test('resizing a paused reveal preserves composition, frame and single root', async ({ page }, info) => {
  await page.goto(URL);
  await ready(page);
  await button(page, 'Play').click();
  await page.waitForTimeout(400);
  await button(page, 'Pause').click();
  const before = await snapshot(page);
  const samples = [];
  for (const [width, height] of [[1280, 720], [844, 390], [390, 844], [844, 390]]) {
    await page.setViewportSize({ width, height });
    const canvas = page.locator('[data-testid="canvas-parent"] canvas');
    await expect.poll(async () => {
      const box = await canvas.boundingBox();
      return Math.abs(box.width - Math.min(width, height * 16 / 9));
    }).toBeLessThan(2);
    const box = await canvas.boundingBox();
    expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.01);
    const current = await snapshot(page);
    expect(current.reveal).toEqual(before.reveal);
    expect(current.runtime.sessionId).toBe(before.runtime.sessionId);
    await page.screenshot({ path: info.outputPath(`reveal-${width}x${height}.png`) });
    samples.push({ viewport: { width, height }, box, snapshot: current });
  }
  await button(page, 'Resume').click();
  const completed = await phase(page, 'completed');
  expect(completed.reveal.renderedFrames).toEqual(frames);
  expect(completed.events).toHaveLength(1);
  await evidence(info, 'viewport-resize', { samples, completed });
});

test('a long browser frame never skips an authored frame or ends on an independent timer', async ({ page }, info) => {
  await page.goto(URL);
  await ready(page);
  await button(page, 'Play').click();
  // Test-only main-thread stall. Do not replace or manually step Phaser clocks.
  await page.evaluate(() => {
    const end = performance.now() + 500;
    while (performance.now() < end) { /* simulate a long browser frame */ }
  });
  const completed = await phase(page, 'completed');
  expect(completed.reveal.visitedFrames).toEqual(frames);
  expect(completed.reveal.renderedFrames).toEqual(frames);
  expect(completed.events).toHaveLength(1);
  expect(completed.events[0].clean).toBe(true);
  await evidence(info, 'long-frame-playback', completed);
});

test('missing asset fails explicitly without reveal or completion; production excludes harness', async ({ page }, info) => {
  await page.route('**/hs_beer_saint_13.png', (route) => route.fulfill({ status: 404, body: 'missing test asset' }));
  await page.goto(URL);
  await expect(page.getByRole('alert')).toContainText('Asset load failed');
  await button(page, 'Play').click();
  const failed = await snapshot(page);
  expect(failed.reveal).toBeNull();
  expect(failed.events).toHaveLength(0);
  await button(page, 'Unmount').click();
  await expect.poll(async () => (await snapshot(page)).foundation.live).toBe(0);
  await evidence(info, 'asset-failure', failed);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('http://localhost:4173/phieng-loi?dev=hs-reveal');
  await expect(page.locator('[data-testid="canvas-parent"] canvas')).toHaveCount(1);
  await expect(page.getByTestId('reveal-harness')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-testid="canvas-parent"] canvas')).toHaveCount(1);
  expect(requests.filter((url) => url.includes('/hs-reveal/'))).toEqual([]);
  for (const file of readdirSync('dist/assets').filter((name) => name.endsWith('.js'))) {
    expect(readFileSync('dist/assets/' + file, 'utf8')).not.toContain('HeeSunRevealRoot');
  }
});
