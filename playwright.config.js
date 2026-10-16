import { defineConfig, devices } from '@playwright/test';

const phone = { viewport: { width: 360, height: 740 } };

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: { command: 'node tests/serve.mjs', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'], ...phone } }, // WebKit = moteur de Safari
    { name: 'android', use: { ...devices['Pixel 5'], ...phone } }, // Chromium
  ],
});
