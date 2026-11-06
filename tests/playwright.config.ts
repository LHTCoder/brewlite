import { defineConfig, devices } from '@playwright/test';

/**
 * E2E chạy trên hệ thống đã khởi động (local: docker compose up; CI: job e2e).
 * WEB_URL / API_URL có thể trỏ tới production để smoke E2E sau deploy.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.WEB_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Pixel 7'], // mobile-first
  },
  projects: [{ name: 'mobile-chromium', use: { ...devices['Pixel 7'] } }],
});
