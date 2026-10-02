import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.WM_SITE_TEST_PORT ?? 4175);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command:
      `${process.env.WM_SITE_TEST_PUBLICATION === "1" ? "npm run build:publication" : "npm run build"} && npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
