import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

for (const [task, reportFile] of [["open-hatch", "recordings/open-hatch/registered-grounded-v1/report"], ["rotate-valve", "recordings/rotate-valve/registered-grounded-v1/report"], ["press-button-overview", "recordings/press-button/registered-grounded-v1/report"]]) {
  test(`${task}: actual camera feeds follow the observer timeline`, async ({ page, request }, testInfo) => {
    const report = await (await request.get(`/static/${reportFile}.json`)).json();
    test.skip(!report.camera_streams?.length, "This task has not yet published synchronized camera streams");
    expect(report.camera_alignment.same_episode).toBe(true);
    expect(report.camera_alignment.max_pair_timestamp_difference_s).toBeLessThan(0.001);
    await page.goto(`/?view=explore#${task}`);
    for (const stream of report.camera_streams) {
      const response = await request.get(stream.src.replace(/^\.\//, "/"));
      expect(response.ok()).toBe(true);
      const servedHash = createHash("sha256").update(await response.body()).digest("hex");
      if (process.env.WM_SITE_TEST_PUBLICATION === "1") {
        const manifest = await (await request.get("/media-manifest.json")).json();
        const file = manifest.files[stream.src.replace(/^\.\//, "")];
        expect(file.source_sha256).toBe(stream.sha256);
        expect(servedHash).toBe(file.web_sha256);
      } else expect(servedHash).toBe(stream.sha256);
    }
    if (task !== "press-button-overview") {
      await page.locator(".task-group > summary").nth(2).click();
      const player = page.locator(`#${task} .expert-multiview`);
      await player.scrollIntoViewIfNeeded();
      await expect(player.locator("video")).toHaveCount(3);
      const master = player.locator(".demo-external video");
      await expect.poll(() => master.evaluate((v:HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
      await master.evaluate((v:HTMLVideoElement) => { v.pause(); v.currentTime = 30; });
      for (const video of await player.locator("video").all()) await expect.poll(() => video.evaluate((v:HTMLVideoElement) => v.currentTime)).toBeCloseTo(30, 1);
      return;
    }
    const player = page.locator(`#${task} .cinema-player`);
    await player.scrollIntoViewIfNeeded();
    await expect(player.locator("video")).toHaveCount(3);
    for (const video of await player.locator("video").all()) {
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
      expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(report.duration_s, 1);
    }
    await player.getByRole("slider").fill("30");
    for (const video of await player.locator("video").all())
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(30, 1);
    await player.getByRole("button", { name: "Playback speed 1x" }).click();
    await player.getByRole("button", { name: "Play recording", exact: true }).click();
    for (const video of await player.locator("video").all()) {
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
      expect(await video.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(0.5);
    }
    await player.getByRole("button", { name: "Pause recording", exact: true }).click();
    for (const video of await player.locator("video").all())
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await player.getByRole("button", { name: "Show synchronized robot cameras" }).click();
    await expect(player.locator(".cinema-camera-bank")).toBeHidden();
    await player.getByRole("button", { name: "Show synchronized robot cameras" }).click();
    await expect(player.locator(".cinema-camera-bank")).toBeVisible();
    await expect(player.locator(".cinema-error")).toHaveCount(0);
    await player.screenshot({ path: testInfo.outputPath(`${task}-cameras.png`) });
  });
}

test("lighting and water controls load actual paired captures", async ({ page, request }, testInfo) => {
  await page.goto("/?view=explore#underwater-imaging");
  const panel = page.locator("#lighting-water");
  await expect(panel).toContainText("not a policy evaluation or a video");
  for (const lighting of ["Scene lighting", "All lights off", "Vehicle lamps only"]) {
    await panel.getByRole("button", { name: lighting, exact: true }).click();
    for (const clarity of ["Clear", "Coastal", "Turbid harbor"]) {
      const button = panel.getByRole("button", { name: clarity, exact: true });
      if (lighting === "All lights off") await expect(button).toBeDisabled();
      else await button.click();
      for (const img of await panel.locator("img").all()) {
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth)).toBe(512);
      }
    }
  }
  expect((await request.get("/static/optics/report.json")).ok()).toBe(true);
  await panel.screenshot({ path: testInfo.outputPath("robot-lamps-turbid.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("robot section shows the bimanual expert without robot or task selectors", async ({ page }) => {
  await page.goto("/?view=explore#rexrov2");
  const robot = page.locator("#embodiments");
  await expect(robot).toContainText("RexROV2 + twin Oberon7");
  await expect(robot).not.toContainText("BlueROV2");
  await expect(robot.locator("video")).toHaveCount(1);
  await expect(robot.locator("video")).toHaveAttribute("src", /bimanual-valve\/two-hands.mp4/);
  await expect(robot.getByRole("button")).toHaveCount(0);
});
