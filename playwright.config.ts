import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Two projects, two concerns:
 *  - `ui`  → browser tests (Sauce Demo + UI Testing Playground); `baseURL` is set per-page-object, not here,
 *            because the suite spans two different hosts.
 *  - `api` → pure request-context tests (DummyJSON); no browser is launched, so they stay fast.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Sauce Demo marks every element with `data-test="…"`, so getByTestId() maps straight onto it.
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'ui',
      testDir: './tests',
      testIgnore: /tests\/api\//,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.DUMMYJSON_BASE_URL ?? 'https://dummyjson.com',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
  ],
});
