const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/serve_web.js',
    url: 'http://127.0.0.1:8765',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
