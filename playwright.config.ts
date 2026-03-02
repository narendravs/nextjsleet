import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",

  // Global timeout for a single test
  timeout: 60000,

  /* Shared settings for all the projects below. */
  use: {
    /* Use the explicit IPv4 address to avoid localhost resolution issues */
    baseURL: "http://127.0.0.1:7000",

    // Timeouts for individual actions (clicking, typing) and navigation
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          slowMo: 50, // Helps prevent CPU spikes during heavy tests
        },
      },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run start",
    // Playwright will 'ping' this URL to see if the server is alive
    url: "http://127.0.0.1:7000",
    reuseExistingServer: !process.env.CI,

    // How long to wait for 'npm run start' to be ready
    timeout: 120000,

    // Shows the Next.js logs in your terminal so you can see if the server crashed
    stdout: "pipe",
    stderr: "pipe",
  },
});
