import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

const URL = 'http://localhost:5173/phieng-loi?dev=hs-flow';
const button = (page, name) => page.getByRole('button', { name, exact: true });
const dialog = page => page.getByRole('dialog', { name: 'Manga HeeSun' });
const snapshot = page => page.evaluate(() => window.__HS_FLOW_DEV__.snapshot());
const kinds = state => state.flow.events.map(event => event.kind);
async function ready(page) {
  await expect(button(page, 'Start flow')).toBeEnabled();
  return snapshot(page);
}
async function phase(page, value) {
  await expect.poll(async () => (await snapshot(page)).flow?.phase).toBe(value);
  return snapshot(page);
}
async function openManga(page) {
  await ready(page);
  await button(page, 'Start flow').click();
  await phase(page, 'MANGA');
  await expect(button(page, 'Khung tiếp')).toBeEnabled();
}
async function last(page) {
  await button(page, 'Khung tiếp').click();
  await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-02/);
  await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await button(page, 'Khung tiếp').click();
  await expect(button(page, 'Đóng sau khi xem xong')).toBeEnabled();
}
async function complete(page) {
  await last(page);
  await button(page, 'Đóng sau khi xem xong').click();
  return phase(page, 'HANDOFF');
}
async function hidden(page, value) {
  await page.evaluate(value => {
    Object.defineProperty(document, 'hidden', { configurable: true, value });
    document.dispatchEvent(new Event('visibilitychange'));
  }, value);
}
async function finishing(page, action) {
  await page.evaluate(async action => {
    const deadline = performance.now() + 10000;
    while (performance.now() < deadline) {
      await new Promise(requestAnimationFrame);
      if (window.__HS_FLOW_DEV__.snapshot().reveal.phase === 'finishing') {
        [...document.querySelectorAll('button')].find(b => b.textContent === action).click();
        return;
      }
    }
    throw new Error('Missing finishing phase');
  }, action);
}
async function evidence(info, name, value) {
  await info.attach(name, { body: JSON.stringify(value, null, 2), contentType: 'application/json' });
}

const logs = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  logs.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  await page.route('https://pl00.invalid/**', route => route.fulfill({ status: 503, body: '{}' }));
});
test.afterEach(async ({ page }, info) => {
  if (await page.evaluate(() => Boolean(window.__HS_FLOW_DEV__))) await evidence(info, 'flow-final-snapshot', await snapshot(page));
  await evidence(info, 'runtime-exceptions', logs.get(page));
  expect(logs.get(page)).toEqual([]);
});

for (const fps of [15, 12]) {
  test(`flow ${fps} fps: real reveal cleanup, manual manga, exactly one handoff`, async ({ page }, info) => {
    await page.goto(URL); await ready(page);
    if (fps === 12) {
      await page.getByLabel('Flow FPS').selectOption('12');
      await button(page, 'Re-enter flow').click(); await ready(page);
    }
    await button(page, 'Start flow').click();
    await expect(dialog(page)).toHaveCount(0);
    const reveal = await snapshot(page);
    expect(reveal.flow.chaseRequests).toBe(0);
    expect(reveal.reveal.rootCount).toBe(1);
    const manga = await phase(page, 'MANGA');
    expect(manga.reveal.renderedFrames).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    expect(manga.reveal).toMatchObject({ fps, rootCount: 0, auraCount: 0, sceneObjects: 0, sceneTweens: 0 });
    await expect(button(page, 'Khung tiếp')).toBeEnabled();
    await page.waitForTimeout(1100); // Observe absence of autoplay, not readiness synchronization.
    await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-01/);
    await expect(button(page, 'Đóng sau khi xem xong')).toHaveCount(0);
    await button(page, 'Khung tiếp').click(); await expect(button(page, 'Khung trước')).toBeEnabled();
    await button(page, 'Khung trước').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled();
    await last(page);
    await page.screenshot({ path: info.outputPath(`manga-final-${fps}.png`) });
    await button(page, 'Đóng sau khi xem xong').evaluate(b => { b.click(); b.click(); });
    const handoff = await phase(page, 'HANDOFF');
    expect(handoff.flow.chaseRequests).toBe(1);
    expect(handoff.handoffs).toEqual([{ request: { type: 'chase_requested', flowSessionId: handoff.flow.sessionId,
      mangaRunId: handoff.flow.mangaRun }, mangaCount: 0, revealClean: true, paused: false }]);
    expect(handoff.mangaCount).toBe(0);
    expect(handoff.voice.status).toBe('unbound');
    expect(handoff.runtime.audioDisabled).toBe(true);
    expect(handoff.flow.events.filter(e => ['reveal_cleanup', 'reveal_complete_accepted', 'manga_opened', 'manga_cleanup', 'manga_complete_accepted', 'chase_requested'].includes(e.kind)).map(e => e.kind))
      .toEqual(['reveal_cleanup', 'reveal_complete_accepted', 'manga_opened', 'manga_cleanup', 'manga_complete_accepted', 'chase_requested']);
    expect(handoff.flow.events.filter(e => e.kind.endsWith('_cleanup')).every(e => e.clean && !e.injected)).toBe(true);
    await page.waitForTimeout(250);
    expect((await snapshot(page)).flow.chaseRequests).toBe(1);
    await page.screenshot({ path: info.outputPath(`handoff-${fps}.png`) });
    await evidence(info, 'real-event-order', { reveal, manga, handoff });
    await button(page, 'Re-enter flow').click(); await openManga(page);
    const replay = await complete(page);
    expect(replay.flow.sessionId).not.toBe(handoff.flow.sessionId);
    expect(replay.flow.chaseRequests).toBe(1); expect(replay.handoffs).toHaveLength(1);
    expect(replay.foundation.maxLive).toBe(1);
    await evidence(info, 'second-valid-session', replay);
  });
}

test('manual and hidden pause freeze reveal and finishing without duplicate manga', async ({ page }, info) => {
  await page.goto(URL); await ready(page); await button(page, 'Start flow').click();
  await button(page, 'Pause flow').click();
  const paused = await snapshot(page);
  await hidden(page, true); await button(page, 'Resume flow').click();
  await page.waitForTimeout(600);
  expect((await snapshot(page)).reveal).toEqual(paused.reveal);
  expect((await snapshot(page)).flow.phase).toBe('REVEAL');
  await hidden(page, false);
  await finishing(page, 'Pause flow');
  const fade = await snapshot(page);
  expect(fade.reveal.phase).toBe('finishing');
  await page.waitForTimeout(500);
  expect((await snapshot(page)).reveal).toEqual(fade.reveal);
  await expect(dialog(page)).toHaveCount(0);
  await button(page, 'Resume flow').click();
  const resumed = await phase(page, 'MANGA');
  expect(kinds(resumed).filter(k => k === 'manga_opened')).toHaveLength(1);
  await evidence(info, 'pause-playing-and-finishing', { paused, fade, resumed });
});

test('manga engine hold is independent of manual, hidden and page lifecycle pause', async ({ page }) => {
  await page.goto(URL); await openManga(page);
  expect((await snapshot(page)).runtime.paused).toBe(true);
  await button(page, 'Khung tiếp').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await button(page, 'Pause flow').click(); await hidden(page, true); await hidden(page, false);
  await expect(button(page, 'Khung tiếp')).toBeDisabled();
  await button(page, 'Resume flow').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await expect(button(page, 'Khung tiếp')).toBeDisabled();
  await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
  await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await button(page, 'Khung tiếp').click(); await expect(button(page, 'Đóng sau khi xem xong')).toBeEnabled();
  await hidden(page, true); await button(page, 'Pause flow').click(); await button(page, 'Resume flow').click();
  await expect(button(page, 'Đóng sau khi xem xong')).toBeDisabled();
  expect((await snapshot(page)).flow.chaseRequests).toBe(0);
  await hidden(page, false); await button(page, 'Đóng sau khi xem xong').click();
  await phase(page, 'HANDOFF');
});

test('real completions crossing pause are consumed once after resume', async ({ page }, info) => {
  await page.goto(URL); await ready(page);
  await page.evaluate(() => window.__HS_FLOW_DEV__.holdCompletions(true));
  await button(page, 'Start flow').click();
  await expect.poll(async () => (await snapshot(page)).held).toBe(1);
  await button(page, 'Pause flow').click();
  await page.evaluate(() => window.__HS_FLOW_DEV__.delivery()());
  const revealPending = await snapshot(page);
  expect(revealPending.flow.phase).toBe('REVEAL');
  expect(revealPending.flow.pending.type).toBe('reveal_complete');
  await expect(dialog(page)).toHaveCount(0);
  await button(page, 'Resume flow').click(); await phase(page, 'MANGA');
  await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await page.evaluate(() => window.__HS_FLOW_DEV__.holdCompletions(true));
  await last(page); await button(page, 'Đóng sau khi xem xong').click();
  await expect.poll(async () => (await snapshot(page)).held).toBe(1);
  await button(page, 'Pause flow').click(); await page.evaluate(() => window.__HS_FLOW_DEV__.delivery()());
  const mangaPending = await snapshot(page);
  expect(mangaPending.flow.phase).toBe('MANGA'); expect(mangaPending.flow.chaseRequests).toBe(0);
  expect(mangaPending.mangaCount).toBe(0);
  await page.evaluate(() => { const api = window.__HS_FLOW_DEV__; const s = api.snapshot(); api.inject(s.flow.pending); });
  expect(kinds(await snapshot(page)).filter(k => k === 'manga_complete_accepted')).toHaveLength(1);
  await button(page, 'Resume flow').click(); const handoff = await phase(page, 'HANDOFF');
  expect(handoff.flow.chaseRequests).toBe(1);
  await evidence(info, 'deferred-real-completions', { revealPending, mangaPending, handoff });
});

test('cancel discards pending completion; re-entry rejects previous session callbacks', async ({ page }) => {
  await page.goto(URL); await ready(page);
  await page.evaluate(() => window.__HS_FLOW_DEV__.holdCompletions(true));
  await button(page, 'Start flow').click(); await expect.poll(async () => (await snapshot(page)).held).toBe(1);
  await button(page, 'Pause flow').click(); await page.evaluate(() => window.__HS_FLOW_DEV__.delivery()());
  const pending = (await snapshot(page)).flow.pending;
  await button(page, 'Cancel flow').click(); await button(page, 'Resume flow').click();
  expect((await snapshot(page)).flow).toMatchObject({ phase: 'CANCELLED', pending: null, chaseRequests: 0 });
  await button(page, 'Re-enter flow').click(); const entered = await ready(page);
  expect(entered.flow.sessionId).not.toBe(pending.flowSessionId);
  await page.evaluate(event => window.__HS_FLOW_DEV__.inject(event), pending);
  expect((await snapshot(page)).flow.phase).toBe('IDLE');
  expect((await snapshot(page)).flow.events.at(-1).reason).toBe('session');
  await button(page, 'Start flow').click(); await phase(page, 'MANGA');
  await expect(button(page, 'Khung tiếp')).toBeEnabled(); await complete(page);
});

test('callback cleanup, phase, run and duplicate guards are observable', async ({ page }, info) => {
  await page.goto(URL); await ready(page); await button(page, 'Start flow').click();
  await button(page, 'Pause flow').click();
  await page.evaluate(() => {
    const api = window.__HS_FLOW_DEV__, f = api.snapshot().flow;
    const e = { type: 'reveal_complete', flowSessionId: f.sessionId, runId: f.revealRun, clean: false };
    api.inject(e); api.inject({ ...e, runId: 999, clean: true });
    api.inject({ ...e, type: 'manga_complete', clean: true });
  });
  expect((await snapshot(page)).flow.events.filter(e => e.kind === 'callback_rejected').map(e => e.reason)).toEqual(['cleanup', 'run', 'phase']);
  await button(page, 'Resume flow').click(); await phase(page, 'MANGA');
  await page.evaluate(() => {
    const api = window.__HS_FLOW_DEV__, f = api.snapshot().flow;
    api.inject({ type: 'reveal_complete', flowSessionId: f.sessionId, runId: f.revealRun, clean: true });
    api.inject({ type: 'manga_complete', flowSessionId: f.sessionId, runId: f.mangaRun, clean: false });
  });
  expect((await snapshot(page)).flow.phase).toBe('MANGA');
  await expect(button(page, 'Khung tiếp')).toBeEnabled(); await complete(page);
  await page.evaluate(() => {
    const api = window.__HS_FLOW_DEV__, f = api.snapshot().flow;
    api.inject({ type: 'manga_complete', flowSessionId: f.sessionId, runId: f.mangaRun, clean: true });
  });
  expect((await snapshot(page)).flow.chaseRequests).toBe(1);
  await evidence(info, 'guard-rejections', await snapshot(page));
});

test('late real reveal callback cannot revive a cancelled or disposed session', async ({ page }, info) => {
  await page.goto(URL); await ready(page);
  await page.evaluate(() => window.__HS_FLOW_DEV__.holdCompletions(true));
  await button(page, 'Start flow').click();
  await expect.poll(async () => (await snapshot(page)).held).toBe(1);
  await page.evaluate(() => { window.lateReveal = window.__HS_FLOW_DEV__.delivery(); });
  const oldId = (await snapshot(page)).flow.sessionId;
  await button(page, 'Cancel flow').click();
  await page.evaluate(() => window.lateReveal());
  const cancelled = await snapshot(page);
  expect(cancelled.flow).toMatchObject({ phase: 'CANCELLED', chaseRequests: 0 });
  expect(cancelled.flow.events.at(-1)).toMatchObject({ kind: 'callback_rejected', reason: 'phase', injected: false });
  await button(page, 'Re-enter flow').click(); const entered = await ready(page);
  await page.evaluate(() => window.lateReveal());
  const stale = await snapshot(page);
  expect(stale.flow).toEqual(entered.flow);
  expect(stale.history.find(s => s.sessionId === oldId)).toMatchObject({ phase: 'DISPOSED', chaseRequests: 0 });
  expect(stale.history.find(s => s.sessionId === oldId).events.at(-1)).toMatchObject({ kind: 'callback_rejected', reason: 'phase', injected: false });
  await expect(dialog(page)).toHaveCount(0);
  await evidence(info, 'late-real-reveal', { cancelled, entered, stale });
});

test('late real manga callback after retry is rejected before a new valid handoff', async ({ page }, info) => {
  await page.goto(URL); await openManga(page);
  await page.evaluate(() => window.__HS_FLOW_DEV__.holdCompletions(true));
  await last(page); await button(page, 'Đóng sau khi xem xong').click();
  await expect.poll(async () => (await snapshot(page)).held).toBe(1);
  await page.evaluate(() => { window.lateManga = window.__HS_FLOW_DEV__.delivery(); });
  const before = await snapshot(page);
  await button(page, 'Retry manga from page 1').click();
  await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await page.evaluate(() => window.lateManga());
  const rejected = await snapshot(page);
  expect(rejected.flow).toMatchObject({ phase: 'MANGA', mangaRun: before.flow.mangaRun + 1, chaseRequests: 0 });
  expect(rejected.flow.events.at(-1)).toMatchObject({ kind: 'callback_rejected', reason: 'run', injected: false });
  const handoff = await complete(page);
  expect(handoff.flow.chaseRequests).toBe(1);
  await evidence(info, 'late-real-manga', { before, rejected, handoff });
});

for (const failedPage of [2, 3]) {
  test(`failed image ${failedPage} retries page one in the same flow with a new manga run`, async ({ page }, info) => {
    const asset = `**/heesun-0${failedPage}.png`;
    await page.route(asset, route => route.abort());
    await page.goto(URL); await openManga(page);
    await button(page, 'Khung tiếp').click();
    if (failedPage === 3) { await expect(button(page, 'Khung tiếp')).toBeEnabled(); await button(page, 'Khung tiếp').click(); }
    await expect(dialog(page).getByRole('status')).toContainText('Không tải được ảnh');
    const failed = await snapshot(page);
    expect(failed.flow.chaseRequests).toBe(0);
    if (failedPage === 3) await expect(button(page, 'Đóng sau khi xem xong')).toBeDisabled();
    else await expect(button(page, 'Khung tiếp')).toBeDisabled();
    await page.unroute(asset); await button(page, 'Retry manga from page 1').click();
    await expect(button(page, 'Khung tiếp')).toBeEnabled();
    await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-01/);
    const retried = await snapshot(page);
    expect(retried.flow.sessionId).toBe(failed.flow.sessionId);
    expect(retried.flow.mangaRun).toBe(failed.flow.mangaRun + 1);
    expect(kinds(retried).filter(k => k === 'reveal_started')).toHaveLength(1);
    await page.evaluate(f => window.__HS_FLOW_DEV__.inject({ type: 'manga_complete', flowSessionId: f.sessionId, runId: f.mangaRun, clean: true }), failed.flow);
    expect((await snapshot(page)).flow.events.at(-1).reason).toBe('run');
    const handoff = await complete(page);
    expect(handoff.flow.chaseRequests).toBe(1);
    await evidence(info, 'image-error-and-retry', { failed, retried, handoff });
  });
}

test('loading final image cannot complete or hand off', async ({ page }) => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/heesun-03.png', async route => { await pending; await route.continue(); });
  await page.goto(URL); await openManga(page);
  await button(page, 'Khung tiếp').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await button(page, 'Khung tiếp').click();
  await expect(button(page, 'Đóng sau khi xem xong')).toBeDisabled();
  expect((await snapshot(page)).flow.chaseRequests).toBe(0);
  release(); await expect(button(page, 'Đóng sau khi xem xong')).toBeEnabled();
  await button(page, 'Đóng sau khi xem xong').click(); await phase(page, 'HANDOFF');
});

test('cancel at reveal, finishing and manga never counts as completion', async ({ page }) => {
  await page.goto(URL);
  for (const point of ['playing', 'finishing', 'manga']) {
    await ready(page); await button(page, 'Start flow').click();
    if (point === 'finishing') await finishing(page, 'Cancel flow');
    else { if (point === 'manga') await phase(page, 'MANGA'); await button(page, 'Cancel flow').click(); }
    const state = await phase(page, 'CANCELLED');
    expect(state.flow.chaseRequests).toBe(0);
    expect(state.reveal).toMatchObject({ rootCount: 0, auraCount: 0, sceneObjects: 0, sceneTweens: 0 });
    await expect(dialog(page)).toHaveCount(0);
    await button(page, 'Re-enter flow').click();
  }
});

test('20 immediate re-entries, paused unmount and route exit clean up ownership', async ({ page }, info) => {
  test.setTimeout(90000);
  await page.goto(URL); const first = await ready(page);
  for (let i = 0; i < 20; i++) {
    await button(page, 'Start flow').click();
    await button(page, 'Re-enter flow').click(); await ready(page);
  }
  const entered = await snapshot(page);
  expect(entered.flow.sessionId).toBeGreaterThan(first.flow.sessionId);
  expect(entered.foundation.live).toBe(1); expect(entered.foundation.maxLive).toBe(1);
  expect(entered.history.filter(s => s.phase !== 'IDLE').every(s => s.phase === 'DISPOSED' && s.chaseRequests === 0)).toBe(true);
  await button(page, 'Start flow').click(); await button(page, 'Pause flow').click();
  await button(page, 'Unmount flow').click();
  await expect.poll(async () => (await snapshot(page)).foundation.live).toBe(0);
  const unmounted = await snapshot(page);
  expect(unmounted.foundation).toMatchObject({ adapterListeners: 0, observers: 0, sceneListeners: 0 });
  expect(unmounted.flow).toMatchObject({ phase: 'DISPOSED', chaseRequests: 0 });
  expect(unmounted.reveal.rootCount).toBe(0);
  await expect(dialog(page)).toHaveCount(0);
  await evidence(info, 'reentry-and-paused-teardown', { entered, unmounted });
  await button(page, 'Resume flow').click(); await button(page, 'Re-enter flow').click(); await ready(page);
  await button(page, 'Start flow').click(); await phase(page, 'MANGA');
  await page.getByRole('link', { name: 'Exit flow route' }).click();
  await expect(page.locator('canvas')).toHaveCount(0); await expect(dialog(page)).toHaveCount(0);
  expect(await page.evaluate(() => typeof window.__HS_FLOW_DEV__)).toBe('undefined');
});

test('touch and rotation preserve manga page and the final handoff', async ({ browser }, info) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 844, height: 390 } });
  const page = await context.newPage();
  try {
    await page.goto(URL); await ready(page); await button(page, 'Start flow').tap(); await phase(page, 'MANGA');
    await expect(button(page, 'Khung tiếp')).toBeEnabled(); await button(page, 'Khung tiếp').tap();
    await expect(button(page, 'Khung tiếp')).toBeEnabled();
    expect(await page.evaluate(() => {
      const panel = document.querySelector('.hs-flow-panel').getBoundingClientRect();
      const viewer = document.querySelector('.hs-manga-viewer').getBoundingClientRect();
      return panel.right <= viewer.left || panel.bottom <= viewer.top;
    })).toBe(true);
    await page.screenshot({ path: info.outputPath('flow-touch-landscape.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-02/);
    expect(await dialog(page).getByRole('img').evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
    expect(await page.evaluate(() => document.querySelector('.hs-flow-panel').getBoundingClientRect().bottom <=
      document.querySelector('.hs-manga-viewer').getBoundingClientRect().top)).toBe(true);
    await page.screenshot({ path: info.outputPath('flow-touch-portrait.png') });
    await button(page, 'Khung tiếp').tap(); await expect(button(page, 'Đóng sau khi xem xong')).toBeEnabled();
    await button(page, 'Đóng sau khi xem xong').tap(); const done = await phase(page, 'HANDOFF');
    expect(done.flow.chaseRequests).toBe(1); await evidence(info, 'touch-emulation-not-F12', done);
  } finally { await context.close(); }
});

test('production excludes integration harness, coordinator, debug API and assets', async ({ page }) => {
  await page.goto('http://localhost:4173/phieng-loi?dev=hs-flow');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('flow-harness')).toHaveCount(0);
  expect(await page.evaluate(() => typeof window.__HS_FLOW_DEV__)).toBe('undefined');
  const files = readdirSync('dist/assets');
  expect(files.filter(name => /FlowHarness|PresentationFlow|manga|heesun-0[123]/i.test(name))).toEqual([]);
  for (const file of files.filter(name => name.endsWith('.js'))) {
    const content = readFileSync(`dist/assets/${file}`, 'utf8');
    for (const marker of ['chase_requested', '__HS_FLOW_DEV__', 'reveal_complete', 'manga_complete']) expect(content).not.toContain(marker);
  }
});
