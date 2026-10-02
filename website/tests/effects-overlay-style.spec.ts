import { expect, test } from "@playwright/test";

for (const mode of ["seabed", "wall"]) {
  test(`${mode}: thin projected rays without archived comparison UI`, async ({ page, request }, testInfo) => {
    const data = await (await request.get("/static/boundary_comparison_v1.json")).json();
    const cases = data.modes[mode === "seabed" ? "floor" : "wall"];
    expect(cases.map((entry: { seed: number }) => entry.seed)).toEqual([2058, 2059, 2060]);
    expect(data.calibrated).toBe(false);
    await page.goto("/?view=explore#physical-effects");
    const explorer = page.locator("#effects-robot-demos");
    const film = explorer.locator(".effects-film-stage");
    await explorer.locator(`#effects-demo-tab-${mode}`).click();
    await expect(film.getByRole("slider")).toHaveAttribute("max", "8");
    await film.getByRole("slider").fill("4");
    const rays = explorer.locator(".projected-rotor-ray");
    await expect(rays).toHaveCount(4);
    for (const ray of await rays.all()) {
      await expect(ray).toHaveAttribute("vector-effect", "non-scaling-stroke");
      expect(await ray.evaluate((element) => parseFloat(getComputedStyle(element).strokeWidth))).toBe(.9);
    }
    for (const path of await explorer.locator(".projected-hemisphere path").all()) {
      await expect(path).toHaveAttribute("vector-effect", "non-scaling-stroke");
      expect(await path.evaluate((element) => parseFloat(getComputedStyle(element).strokeWidth))).toBeLessThanOrEqual(.6);
    }
    await expect(explorer.locator(".boundary-archived-evidence, .boundary-replay, .proximity-delta-comparison")).toHaveCount(0);
    await expect(explorer.getByRole("region", { name: "Independent matched boundary ON/OFF evidence" })).toHaveCount(0);
    await expect(explorer.locator(".effects-demo-technical")).not.toHaveAttribute("open", "");
    // Evidence is still downloadable, not a visible product-view comparison.
    for (const entry of cases) {
      expect(entry.points).toHaveLength(240);
      expect(Number.isFinite(entry.max_position_delta_mm)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await explorer.screenshot({ path: testInfo.outputPath(`${mode}-thin-rays-optional-view.png`), style: "header, .skip-link { visibility:hidden !important; }" });
  });
}

test("coral gripper trail is thin and dashed in both recorded cameras and fullscreen", async ({ page }, testInfo) => {
  await page.goto("/?view=explore#physical-effects");
  const explorer = page.locator("#effects-robot-demos");
  const film = explorer.locator(".effects-film-stage");
  await explorer.getByRole("button", { name: "1.70 m/s", exact: true }).click();
  await expect(film.getByRole("slider")).toHaveAttribute("max", "8");
  await film.getByRole("slider").fill("7.9");
  const trails = explorer.locator(".gripper-trail");
  await expect(trails).toHaveCount(2);
  const check = async () => {
    for (const trail of await trails.all()) {
      await expect(trail).toHaveAttribute("vector-effect", "non-scaling-stroke");
      const style = await trail.evaluate((element) => ({ width: getComputedStyle(element).strokeWidth, dash: getComputedStyle(element).strokeDasharray, filter: getComputedStyle(element).filter }));
      expect(parseFloat(style.width)).toBe(.85);
      expect(style.dash).toBe("4px, 3px");
      expect(style.filter).toBe("none");
    }
  };
  await check();
  await film.getByRole("button", { name: /^Fullscreen / }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await check();
  await page.screenshot({ path: testInfo.outputPath("thin-dashed-gripper-main-inset-fullscreen.png") });
  await page.evaluate(() => document.exitFullscreen());
});
