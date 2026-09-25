import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

const DEV = 'http://localhost:5173';
const PROD = 'http://localhost:4173';
const HARNESS = DEV + '/phieng-loi?dev=foundation';
const fixture = '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#ffffff"/></svg>';
const button = (page, name) => page.getByRole('button', { name, exact: true });

test.beforeEach(async ({ page }) => {
  // No login, credentials or backend gameplay data are supplied to the engine.
  await page.route('https://pl00.invalid/**', (route) => route.fulfill({
    status: 503, contentType: 'application/json', body: '{"message":"Backend unavailable in PL-00 test"}',
  }));
  page.on('pageerror', (error) => console.error('PL00 browser exception:', error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') console.error('PL00 browser console:', message.text());
  });
});

test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus) {
    console.log('PL00 failed page:', await page.locator('body').innerText());
  }
});

async function snapshot(page) {
  await button(page, 'Snapshot').click();
  return JSON.parse(await page.getByTestId('foundation-snapshot').textContent());
}

async function ready(page, expectedLive = 1) {
  // Route/chunk loading is not engine readiness. Keep the existing 10s engine
  // predicate budget, starting after the lazy harness can actually be sampled.
  await button(page, 'Snapshot').waitFor({ state: 'visible' });
  await expect.poll(async () => {
    const value = await snapshot(page);
    return value.live === expectedLive && value.runtime?.probe !== null && value.runtime?.renderer !== 'pending';
  }).toBe(true);
  return snapshot(page);
}

async function gone(page) {
  await expect.poll(async () => (await snapshot(page)).live).toBe(0);
  await expect(page.locator('[data-testid="canvas-parent"] canvas')).toHaveCount(0);
  const value = await snapshot(page);
  for (const key of ['adapterListeners', 'observers', 'sceneListeners', 'probes', 'timers', 'tweens', 'objects']) {
    expect(value[key], key).toBe(0);
  }
  expect(value.orphanCallbacks).toBe(0);
  expect(value.created).toBe(value.destroyed);
  return value;
}

async function chooseAndMount(page, selected) {
  await button(page, 'Unmount').click();
  await gone(page);
  await page.getByLabel('Fixture', { exact: true }).selectOption(selected);
  await button(page, 'Mount').click();
}

test('empty manifest boots in StrictMode; native renderer and systems are minimal', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(HARNESS);
  const value = await ready(page);
  expect(value.mounts).toBeGreaterThanOrEqual(2);
  expect(value.cancelledStarts).toBeGreaterThanOrEqual(1);
  expect(value.created).toBe(1);
  expect(value.maxLive).toBe(1);
  expect(value.bootStarts).toBe(1);
  expect(value.sceneStarts).toBe(1);
  expect(value.readyEvents).toBe(1);
  expect(value.runtime.renderer).toBe('webgl');
  expect(value.runtime.physics).toBe(false);
  expect(value.runtime.audioDisabled).toBe(true);
  expect(value.runtime.sceneKeys.sort()).toEqual(['pl:v2:boot', 'pl:v2:foundation']);
  expect(value.runtime.probe.fixtureLoaded).toBe(true);
  await page.screenshot({ path: info.outputPath('foundation-webgl.png') });
  await page.reload();
  await ready(page);
  expect(errors).toEqual([]);
});

test('rerenders and changing callback identities keep the same Game and ready notification', async ({ page }) => {
  await page.goto(HARNESS);
  const first = await ready(page);
  for (let index = 0; index < 5; index += 1) await button(page, 'Rerender').click();
  const next = await snapshot(page);
  expect(next.runtime.sessionId).toBe(first.runtime.sessionId);
  expect(next.created).toBe(first.created);
  expect(next.sceneStarts).toBe(first.sceneStarts);
  expect(next.notifications.filter((item) => item.state === 'ready')).toHaveLength(1);
});

test('cancelled lazy factory import cannot create an engine or a late ready callback', async ({ page }) => {
  let release;
  const hold = new Promise((resolve) => { release = resolve; });
  let requested = false;
  await page.route('**/src/game/phieng-loi/createGame.ts*', async (route) => {
    requested = true;
    await hold;
    await route.continue();
  });
  await page.goto(HARNESS);
  await expect.poll(() => requested).toBe(true);
  await button(page, 'Unmount').click();
  release();
  await expect.poll(async () => (await snapshot(page)).cancelledStarts).toBeGreaterThanOrEqual(2);
  const value = await gone(page);
  expect(value.created).toBe(0);
  expect(value.readyEvents).toBe(0);
  await button(page, 'Mount').click();
  await ready(page);
});

test('native loader accepts a technical fixture', async ({ page }) => {
  await page.route('**/__pl00_tests__/success.png', (route) => route.fulfill({ contentType: 'image/svg+xml', body: fixture }));
  await page.goto(HARNESS);
  await ready(page);
  await chooseAndMount(page, 'success');
  const value = await ready(page);
  expect(value.runtime.probe.fixtureLoaded).toBe(true);
  expect(value.errors).toBe(0);
});

test('required fixture errors cannot produce a successful ready', async ({ page }) => {
  await page.route('**/__pl00_tests__/error.png', (route) => route.fulfill({ status: 404, body: 'missing test fixture' }));
  await page.goto(HARNESS);
  const first = await ready(page);
  await chooseAndMount(page, 'error');
  await expect(page.getByRole('alert')).toContainText('Asset load failed');
  const failed = await snapshot(page);
  expect(failed.errors).toBe(1);
  expect(failed.readyEvents).toBe(first.readyEvents);
  expect(failed.sceneStarts).toBe(first.sceneStarts);
  await button(page, 'Unmount').click();
  await gone(page);
});

test('unmount while preload is in flight prevents stale callbacks and scene creation', async ({ page }) => {
  let release;
  const hold = new Promise((resolve) => { release = resolve; });
  let requested = false;
  await page.route('**/__pl00_tests__/slow.png', async (route) => {
    requested = true;
    await hold;
    await route.fulfill({ contentType: 'image/svg+xml', body: fixture });
  });
  await page.goto(HARNESS);
  const first = await ready(page);
  await chooseAndMount(page, 'slow');
  await expect.poll(() => requested).toBe(true);
  await button(page, 'Unmount').click();
  release();
  const value = await gone(page);
  expect(value.readyEvents).toBe(first.readyEvents);
  expect(value.sceneStarts).toBe(first.sceneStarts);
  expect(value.errors).toBe(0);
});

test('pause intent during preload applies when ready without pausing the loader', async ({ page }) => {
  let release;
  const hold = new Promise((resolve) => { release = resolve; });
  let requested = false;
  await page.route('**/__pl00_tests__/slow.png', async (route) => {
    requested = true;
    await hold;
    await route.fulfill({ contentType: 'image/svg+xml', body: fixture });
  });
  await page.goto(HARNESS);
  await ready(page);
  await chooseAndMount(page, 'slow');
  await expect.poll(() => requested).toBe(true);
  await button(page, 'Pause').click();
  release();
  const value = await ready(page);
  expect(value.runtime.paused).toBe(true);
  expect(value.lastStatus.reasons).toContain('manual');
  await button(page, 'Resume').click();
  expect((await snapshot(page)).runtime.paused).toBe(false);
});

test('immediate re-entry and idempotent disposal wait for the old destroy barrier', async ({ page }) => {
  await page.goto(HARNESS);
  const first = await ready(page);
  await button(page, 'Pause').click();
  await button(page, 'Re-enter now').click();
  await expect.poll(async () => (await snapshot(page)).readyEvents).toBe(first.readyEvents + 1);
  const next = await ready(page);
  expect(next.created).toBe(2);
  expect(next.destroyed).toBe(1);
  expect(next.maxLive).toBe(1);
  expect(next.runtime.sessionId).not.toBe(first.runtime.sessionId);
  await button(page, 'Unmount').click();
  await gone(page);
});

test('short and long pauses freeze native tween and timer without wall-time catch-up', async ({ page }) => {
  await page.goto(HARNESS);
  const first = await ready(page);
  await expect.poll(async () => (await snapshot(page)).runtime.probe.x).toBeGreaterThan(325);
  for (const duration of [250, 1200, 250]) {
    await button(page, 'Pause').click();
    const before = await snapshot(page);
    await page.waitForTimeout(duration);
    const paused = await snapshot(page);
    expect(paused.runtime.probe.x).toBe(before.runtime.probe.x);
    expect(paused.runtime.probe.elapsed).toBe(before.runtime.probe.elapsed);
    expect(paused.updates).toBe(before.updates);
    // Sample the first native update, not a later Playwright click after 200ms
    // of legitimate movement. No clock stepping and no threshold relaxation.
    const resumed = await page.evaluate(async (updatesBefore) => {
      const control = (name) => [...document.querySelectorAll('button')]
        .find((element) => element.textContent === name);
      control('Resume').click();
      const deadline = performance.now() + 10000;
      while (performance.now() < deadline) {
        await new Promise(requestAnimationFrame);
        control('Snapshot').click();
        await Promise.resolve(); // flush the React snapshot update
        const value = JSON.parse(document.querySelector('[data-testid="foundation-snapshot"]').textContent);
        if (value.updates > updatesBefore) return value;
      }
      throw new Error('No native update after resume');
    }, paused.updates);
    expect(resumed.runtime.paused).toBe(false);
    expect(resumed.runtime.probe.x - paused.runtime.probe.x).toBeLessThan(8);
    expect(resumed.runtime.probe.elapsed - paused.runtime.probe.elapsed).toBeLessThan(160);
  }
  const last = await snapshot(page);
  expect(last.created).toBe(first.created);
  expect(last.sceneStarts).toBe(first.sceneStarts);
  expect(last.readyEvents).toBe(first.readyEvents);
});

test('manual pause survives simulated visibility hide/show and pending destruction', async ({ page }) => {
  await page.goto(HARNESS);
  await ready(page);
  const visible = (hidden) => page.evaluate((value) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await button(page, 'Pause').click();
  await visible(true);
  expect((await snapshot(page)).lastStatus.reasons.sort()).toEqual(['hidden', 'manual']);
  await visible(false);
  expect((await snapshot(page)).runtime.paused).toBe(true);
  await button(page, 'Resume').click();
  expect((await snapshot(page)).runtime.paused).toBe(false);
  await visible(true);
  expect((await snapshot(page)).runtime.paused).toBe(true);
  await button(page, 'Unmount').click();
  await visible(false);
  await gone(page);
});

test('20 mount/unmount and scene-restart cycles do not accumulate owned resources', async ({ page }) => {
  await page.goto(HARNESS);
  await ready(page);
  for (let index = 0; index < 20; index += 1) {
    const before = await snapshot(page);
    await button(page, 'Restart scene').click();
    await expect.poll(async () => (await snapshot(page)).sceneStarts).toBe(before.sceneStarts + 1);
    const restarted = await snapshot(page);
    expect(restarted.readyEvents).toBe(before.readyEvents);
    expect(restarted.probes).toBe(1);
    expect(restarted.timers).toBe(1);
    expect(restarted.tweens).toBe(1);
    expect(restarted.objects).toBe(2);
    expect(restarted.sceneListeners).toBe(6);
    expect(restarted.runtime.probe.sceneObjects).toBe(2);
    expect(restarted.runtime.probe.sceneTweens).toBe(1);
    await button(page, 'Unmount').click();
    const disposed = await gone(page);
    await page.waitForTimeout(35);
    const after = await snapshot(page);
    expect(after.updates).toBe(disposed.updates);
    expect(after.timerCallbacks).toBe(disposed.timerCallbacks);
    await button(page, 'Mount').click();
    await ready(page);
  }
  const value = await snapshot(page);
  expect(value.maxLive).toBe(1);
  expect(value.created).toBe(21);
  expect(value.orphanCallbacks).toBe(0);
});

test('resize and portrait/landscape preserve aspect and pointer mapping; Canvas path works', async ({ page }, info) => {
  await page.goto(HARNESS);
  await ready(page);
  for (const viewport of [{ width: 844, height: 390 }, { width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(viewport);
    await expect(async () => {
      const box = await page.locator('[data-testid="canvas-parent"] canvas').boundingBox();
      expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.01);
      expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.height).toBeLessThanOrEqual(viewport.height + 1);
      // The previous viewport also had a 16:9 canvas; wait for the new FIT size.
      expect(Math.abs(box.width - Math.min(viewport.width, viewport.height * 16 / 9))).toBeLessThan(2);
    }).toPass({ timeout: 10000 });
    const box = await page.locator('[data-testid="canvas-parent"] canvas').boundingBox();
    expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.height).toBeLessThanOrEqual(viewport.height + 1);
    await page.mouse.click(box.x + box.width * 0.75, box.y + box.height * 0.75);
    const value = await snapshot(page);
    expect(value.runtime.probe.pointer.x).toBeCloseTo(960, -1);
    expect(value.runtime.probe.pointer.y).toBeCloseTo(540, -1);
  }
  await button(page, 'Unmount').click();
  await gone(page);
  await page.getByLabel('Renderer', { exact: true }).selectOption('canvas');
  await button(page, 'Mount').click();
  const value = await ready(page);
  expect(value.runtime.renderer).toBe('canvas');
  await page.screenshot({ path: info.outputPath('foundation-canvas.png') });
});

test('AUTO falls back to Canvas when WebGL contexts are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (String(kind).toLowerCase().includes('webgl')) return null;
      return getContext.call(this, kind, ...args);
    };
  });
  await page.goto(HARNESS);
  const value = await ready(page);
  expect(value.runtime.renderer).toBe('canvas');
});

test('route exit clears canvas and re-entry boots a new session without login', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(HARNESS);
  await ready(page);
  await page.getByRole('link', { name: 'Exit route' }).click();
  await expect(page).toHaveURL(DEV + '/');
  await expect(page.getByTestId('phaser-host')).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.goBack();
  await ready(page);
  expect(errors).toEqual([]);
});

test('production deep link refresh works and query cannot enable the dev harness', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(PROD + '/phieng-loi?dev=foundation');
  await expect(page.locator('[data-testid="canvas-parent"] canvas')).toHaveCount(1);
  await expect(page.getByTestId('foundation-harness')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-testid="canvas-parent"] canvas')).toHaveCount(1);
  await page.screenshot({ path: info.outputPath('production-foundation.png') });
  const chunks = readdirSync('dist/assets').filter((name) => name.endsWith('.js'));
  for (const chunk of chunks) {
    expect(readFileSync('dist/assets/' + chunk, 'utf8')).not.toContain('Foundation harness');
    expect(chunk).not.toMatch(/FoundationHarness|FoundationProbe/);
  }
  expect(errors).toEqual([]);
});

test('unrelated production routes render without downloading the Phaser chunk', async ({ page }) => {
  const requests = [];
  const errors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/book', '/credits']) {
    await page.goto(PROD + path);
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page.getByTestId('phaser-host')).toHaveCount(0);
  }
  expect(requests.filter((url) => /createGame-|PhiengLoiV2Page-/.test(url))).toEqual([]);
  expect(errors).toEqual([]);
});
