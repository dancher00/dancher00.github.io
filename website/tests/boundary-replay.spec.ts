import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createServer, type ViteDevServer } from "vite";

// Isolated component harness: existing videos are test transport only, never
// published or represented as the not-yet-verified matched replay experiment.
let server: ViteDevServer;
let origin: string;
let fixtureEntry = "";
test.beforeAll(async () => {
  server = await createServer({ server: { host: "127.0.0.1", port: 0, strictPort: false }, plugins: [{
    name: "test-only-boundary-entry",
    resolveId(id) { if (id === "/__boundary_replay_test_entry__.js") return id; },
    load(id) { if (id === "/__boundary_replay_test_entry__.js") return fixtureEntry; },
  }] });
  await server.listen();
  const address = server.httpServer!.address();
  if (!address || typeof address === "string") throw new Error("Missing test server port");
  origin = `http://127.0.0.1:${address.port}`;
});
test.afterAll(async () => { await server?.close(); });

test("isolated matched replay: two real video streams share seek, rate, pause and fullscreen", async ({ page }, testInfo) => {
  const existing = JSON.parse(await readFile("public/static/effects/manifest.json", "utf8"));
  const clip = existing.modes.find((mode: { id: string }) => mode.id === "seabed").variants[0];
  const experiment = {
    id: "seabed", duration_s: 8, fps: 30, telemetry_offset_s: 1 / 30,
    command_sha256: "a".repeat(64),
    variants: ["off", "on"].map((id) => ({ id, video: clip.video, poster: clip.poster, sha256: clip.sha256 })),
  };
  fixtureEntry = `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {BoundaryReplayFilm} from '/src/BoundaryReplay.tsx';
    createRoot(document.getElementById('root')).render(React.createElement(BoundaryReplayFilm, {experiment:${JSON.stringify(experiment)}}));
  `;
  const html = await server.transformIndexHtml("/__boundary_replay_test__", `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/src/styles.css"></head><body><div style="padding:8px">TEST FIXTURE — identical source video in both slots; no physics result.</div><div id="root"></div><script type="module" src="/__boundary_replay_test_entry__.js"></script></body></html>`);
  await page.route("**/__boundary_replay_test__", (route) => route.fulfill({ contentType: "text/html", body: html }));
  await page.goto(`${origin}/__boundary_replay_test__`);
  const replay = page.getByRole("region", { name: "Matched boundary replay: pool floor" });
  await expect(replay).toContainText("feedback not compensating boundary loss · uncalibrated");
  await expect(replay.getByLabel("Synchronized comparison replays", { exact: true })).toBeVisible();
  await expect(replay.getByRole("button", { name: /Show synchronized/ })).toHaveCount(0);
  const videos = replay.locator("video");
  await expect(videos).toHaveCount(2);
  for (const video of await videos.all()) await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(1);
  await expect(replay.getByRole("slider")).toHaveAttribute("max", "8");
  await replay.getByRole("slider").fill("4");
  for (const video of await videos.all()) await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(4, 2);
  await replay.getByRole("button", { name: "Playback speed 1x" }).click();
  await replay.getByRole("button", { name: "Play recording", exact: true }).click();
  for (const video of await videos.all()) {
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(.5);
  }
  await replay.getByRole("button", { name: "Pause recording", exact: true }).click();
  for (const video of await videos.all()) await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  const off = await videos.nth(0).boundingBox();
  const on = await videos.nth(1).boundingBox();
  expect(off!.width).toBeCloseTo(on!.width, 0);
  expect(off!.height).toBeCloseTo(on!.height, 0);
  if (testInfo.project.name === "mobile") expect(on!.y).toBeGreaterThanOrEqual(off!.y + off!.height - 1);
  else expect(on!.x).toBeGreaterThanOrEqual(off!.x + off!.width - 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await replay.screenshot({ path: testInfo.outputPath("matched-replay-test-fixture.png") });
  await replay.getByRole("button", { name: /^Fullscreen / }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  for (const video of await videos.all()) await expect(video).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("matched-replay-fullscreen-test-fixture.png") });
  await page.evaluate(() => document.exitFullscreen());
});
