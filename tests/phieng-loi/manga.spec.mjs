import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
const url = 'http://localhost:5173/phieng-loi?dev=hs-manga';
const button = (page, name) => page.getByRole('button', { name, exact: true });
const dialog = page => page.getByRole('dialog', { name: 'Manga HeeSun' });
async function open(page) { await button(page, 'Mở manga').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled(); }
async function last(page) { await button(page, 'Khung tiếp').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled(); await button(page, 'Khung tiếp').click(); await expect(button(page, 'Đóng sau khi xem xong')).toBeEnabled(); }
test.beforeEach(async ({ page }) => {
  page.on('pageerror', e => { throw e; });
  await page.route('https://pl00.invalid/**', r => r.fulfill({ status: 503, body: '{}' }));
});
test('manga order, previous, exactly one completion after cleanup and reopen', async ({ page }, info) => {
  await page.goto(url); await open(page);
  await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-01/);
  await expect(button(page, 'Khung trước')).toBeDisabled();
  await expect(button(page, 'Đóng sau khi xem xong')).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('frame-01.png') });
  await button(page, 'Khung tiếp').click();
  await expect(button(page, 'Khung trước')).toBeEnabled();
  await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-02/);
  await page.screenshot({ path: info.outputPath('frame-02.png') });
  await button(page, 'Khung trước').click(); await expect(button(page, 'Khung tiếp')).toBeEnabled();
  await last(page);
  await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-03/);
  await page.screenshot({ path: info.outputPath('frame-03.png') });
  await button(page, 'Đóng sau khi xem xong').evaluate(b => { b.click(); b.click(); });
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.getByTestId('manga-events')).toHaveText('[{"type":"manga_complete","runId":1,"clean":true}]');
  await page.screenshot({ path: info.outputPath('cleanup.png') });
  await open(page); await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-01/);
  await last(page); await button(page, 'Đóng sau khi xem xong').click();
  await expect(page.getByTestId('manga-events')).toHaveText('[{"type":"manga_complete","runId":1,"clean":true},{"type":"manga_complete","runId":2,"clean":true}]');
});
test('pause reasons, final pause, cancellation and route cleanup', async ({ page }) => {
  await page.goto(url); await open(page);
  await button(page, 'Pause').click(); await expect(button(page, 'Khung tiếp')).toBeDisabled();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await button(page, 'Resume').click(); await expect(button(page, 'Khung tiếp')).toBeDisabled();
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await last(page); await button(page, 'Pause').click();
  await expect(button(page, 'Đóng sau khi xem xong')).toBeDisabled();
  await expect(page.getByTestId('manga-events')).toHaveText('[]');
  await button(page, 'Unmount (cancel)').click(); await expect(dialog(page)).toHaveCount(0);
  await open(page); await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-01/);
  await page.getByRole('link', { name: 'Exit route' }).click(); await expect(dialog(page)).toHaveCount(0);
  await page.goto(url); await expect(page.getByTestId('manga-events')).toHaveText('[]');
});
test('touch and resize preserve page and contain entire image', async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 844, height: 390 } });
  const page = await context.newPage(); await page.goto(url); await button(page, 'Mở manga').tap();
  await expect(button(page, 'Khung tiếp')).toBeEnabled(); await button(page, 'Khung tiếp').tap();
  await expect(button(page, 'Khung tiếp')).toBeEnabled(); await page.setViewportSize({ width: 390, height: 844 });
  await expect(dialog(page).getByRole('img')).toHaveAttribute('src', /heesun-02/);
  expect(await dialog(page).getByRole('img').evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
  await context.close();
});
test('failed image cannot complete and reopen recovers', async ({ page }) => {
  await page.route('**/heesun-02.png', route => route.abort());
  await page.goto(url); await open(page); await button(page, 'Khung tiếp').click();
  await expect(dialog(page).getByRole('status')).toContainText('Không tải được ảnh');
  await expect(button(page, 'Khung tiếp')).toBeDisabled();
  await expect(page.getByTestId('manga-events')).toHaveText('[]');
  await button(page, 'Unmount (cancel)').click(); await page.unroute('**/heesun-02.png');
  await open(page); await last(page); await button(page, 'Đóng sau khi xem xong').click();
  await expect(page.getByTestId('manga-events')).toContainText('"runId":2,"clean":true');
});
test('production excludes manga entry, module and images', async ({ page }) => {
  await page.goto('http://localhost:4173/phieng-loi?dev=hs-manga');
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('manga-harness')).toHaveCount(0);
  const files = readdirSync('dist/assets');
  expect(files.filter(name => /manga|heesun-0[123]/i.test(name))).toEqual([]);
  for (const name of files.filter(name => name.endsWith('.js'))) expect(readFileSync(`dist/assets/${name}`, 'utf8')).not.toContain('manga_complete');
});
