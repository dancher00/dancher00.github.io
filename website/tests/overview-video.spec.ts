import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const overview = JSON.parse(readFileSync(new URL("../src/overviewVideo.json", import.meta.url), "utf8"));

test("the overview loads on demand, seeks to chapters and plays its full-resolution stream", async ({ page }, testInfo) => {
  const errors: string[] = [];
  const movieRequests: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (/overview-v8\/WasserMan-overview-v8\.mp4/.test(request.url())) movieRequests.push(request.url()); });
  await page.goto("/");
  const section = page.locator("#overview-video");
  const video = section.locator("video");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(video).not.toHaveAttribute("controls", "");
  await expect(section.getByRole("button", { name: "Play overview video", exact: true })).toBeVisible();
  await expect(video).not.toHaveAttribute("autoplay", "");
  await expect(section).toContainText("1 min 48 s");
  expect(movieRequests).toEqual([]);
  expect(await video.evaluate(async (v: HTMLVideoElement) => { const poster = new Image(); poster.src = v.poster; await poster.decode(); return poster.naturalWidth; })).toBe(1920);
  await section.locator("summary").click();
  await section.getByRole("button", { name: /Policy learning/ }).click();
  await expect(video).toHaveAttribute("controls", "");
  await expect(section.getByRole("button", { name: "Play overview video", exact: true })).toHaveCount(0);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(89, 1);
  expect(await video.evaluate((v: HTMLVideoElement) => [v.videoWidth, v.videoHeight, v.duration, v.error])).toEqual([1920, 1080, overview.duration_seconds, null]);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await video.evaluate(async (v: HTMLVideoElement) => { v.muted = true; await v.play(); });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(89.2);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
  await section.getByRole("button", { name: /SmolVLA/ }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(97, 1);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await section.screenshot({ path: testInfo.outputPath("overview-video.png") });
  const src = await video.locator("source").getAttribute("src");
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await expect(video.locator("source")).toHaveAttribute("src", src!);
  expect(await video.evaluate(v => getComputedStyle(v).filter)).toBe("none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const captions = await page.request.get(overview.captions);
  expect(captions.ok()).toBe(true);
  expect(await captions.text()).toContain("SmolVLA");
  expect(errors).toEqual([]);
});

test("the poster play button starts the film with native playback controls", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#overview-video");
  const video = section.locator("video");
  await section.getByRole("button", { name: "Play overview video", exact: true }).click();
  await expect(video).toHaveAttribute("controls", "");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
});
