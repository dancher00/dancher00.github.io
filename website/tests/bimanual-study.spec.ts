import { expect, test } from "@playwright/test";

test("bimanual results and three pool films use the completed study", async ({ page, request }, testInfo) => {
  const response = await request.get("/static/bimanual-valve/summary.json");
  expect(response.ok(), "Install the completed campaign before validating publication").toBe(true);
  const report = await response.json();
  expect(report.complete).toBe(true);
  expect(report.evaluation_split).toBe("final");
  expect(report.seeds).toEqual(Array.from({ length: 30 }, (_, i) => 92000 + i));
  expect(report.modes).toHaveLength(3);

  await page.goto("/?view=explore#results");
  const results = page.locator("#results");
  await results.locator(".model-study > summary").click();
  await results.getByRole("tab", { name: /Embodiments/ }).click();
  await results.getByRole("button", { name: "Two-arm manipulation", exact: true }).click();
  const study = results.getByRole("region", { name: "Bimanual valve comparison" });
  await expect(study).toBeVisible();
  await expect(study.locator(".articulated-plots svg")).toHaveCount(4);
  for (const mode of report.modes) {
    expect(mode.episodes).toBe(30);
    // Frozen v1 values, independently reduced from both turning phases.
    const expectedRms: Record<string, string> = { free: "0.093°", support: "0.095°", "two-hands": "0.060°" };
    await expect(study.locator(`[data-turning-mode="${mode.mode}"]`)).toContainText(expectedRms[mode.mode]);
    const labels: Record<string, string> = { free: "One hand", support: "One hand + support", "two-hands": "Two hands on valve" };
    await expect(study).toContainText(`${labels[mode.mode]} ${mode.successes}/${mode.episodes}`);
    const film = report.media[mode.mode];
    await study.locator(".bimanual-film").getByRole("button", { name: labels[mode.mode], exact: true }).click();
    const video = study.locator(".bimanual-film video");
    await expect(video).toHaveAttribute("src", film.video);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
    const metadata = await video.evaluate((v: HTMLVideoElement) => ({
      duration: v.duration, width: v.videoWidth, height: v.videoHeight, muted: v.muted,
    }));
    expect(metadata).toMatchObject({ width: 1280, height: 720, muted: true });
    expect(metadata.duration).toBeCloseTo(film.duration_s, 1);
    expect(metadata.duration).toBeCloseTo(180, 1);
    await expect(study.locator(".bimanual-contact rect[fill='#163e52'], .bimanual-contact rect[fill='#087fbd']"))
      .toHaveCount(film.contact_intervals.length);

    await video.evaluate(async (v: HTMLVideoElement) => {
      const sought = new Promise<void>(resolve => v.addEventListener("seeked", () => resolve(), { once: true }));
      v.currentTime = 135;
      await sought;
    });
    await expect(study.locator(".bimanual-contact")).toContainText("135.0 s");
    await study.locator(".bimanual-contact").press("ArrowRight");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(136, 1);
    await study.screenshot({ path: testInfo.outputPath(`bimanual-${mode.mode}.png`) });
  }
  await expect(study).toContainText("plots aggregate the benchmark resets");
  await expect(study.locator(".articulated-plots .bimanual-chart")).toHaveCount(4);
  for (const chart of await study.locator(".articulated-plots .bimanual-chart").all()) {
    await expect(chart.getByLabel("Line styles and hand roles")).toBeVisible();
    await expect(chart.locator(".bimanual-legend li")).toHaveCount(3);
    await expect(chart.locator("polyline")).toHaveCount(3);
    expect(await chart.locator("polyline").evaluateAll(lines => new Set(lines.map(line => line.getAttribute("stroke-dasharray"))).size)).toBe(3);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("rapid recordings retain matched settings and the failed audit disclosure", async ({ page, request }, testInfo) => {
  const response = await request.get("/static/bimanual-fast-turn/summary.json");
  expect(response.ok()).toBe(true);
  const report = await response.json();
  expect(report.requested_turn_speed_rad_s).toBe(1.4);
  expect(report.seed).toBe(93003);
  expect(report.modes.every((m: { overturned: boolean }) => !m.overturned)).toBe(true);
  expect(report.modes.find((m: { mode: string }) => m.mode === "two-hands").joint_limit_audit_passed).toBe(false);
  await page.goto("/?view=explore#results");
  const results = page.locator("#results");
  await results.locator(".model-study > summary").click();
  await results.getByRole("tab", { name: /Embodiments/ }).click();
  await results.getByRole("button", { name: "Two-arm manipulation", exact: true }).click();
  const fast = page.getByRole("region", { name: "Rapid valve command demonstration" });
  await expect(fast).toBeVisible();
  await expect(fast).toContainText("None overturns");
  await expect(fast).toContainText("0.00236 rad");
  for (const [i, name] of ["One hand", "One hand + support", "Two hands on valve"].entries()) {
    await fast.getByRole("button", { name, exact: true }).click();
    const video = fast.locator("video");
    await expect(video).toHaveAttribute("src", report.modes[i].video);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
    expect(await video.evaluate((v: HTMLVideoElement) => ({ duration: v.duration, w: v.videoWidth, h: v.videoHeight, muted: v.muted }))).toEqual({ duration: 50, w: 1280, h: 720, muted: true });
    await expect(fast.locator(".bimanual-fast-metrics")).toContainText(report.modes[i].peak_orientation_error_deg.toFixed(2) + "°");
  }
  await fast.screenshot({ path: testInfo.outputPath("rapid-demo.png") });
  await page.locator(".articulated-plots .bimanual-chart").first().screenshot({ path: testInfo.outputPath("readable-chart.png") });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
