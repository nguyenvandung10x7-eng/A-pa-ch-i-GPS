import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/phieng-loi',
  outputDir: './node_modules/.cache/pl00-results',
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: './node_modules/.cache/pl00-report/results.json' }],
    ['html', { outputFolder: './node_modules/.cache/pl00-report/html', open: 'never' }],
  ],
  use: {
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: [
    { command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort', url: 'http://localhost:5173', reuseExistingServer: false, timeout: 60000 },
    { command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: false, timeout: 60000 },
  ],
});
