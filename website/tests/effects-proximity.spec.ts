import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

for (const modeId of ["seabed", "wall"]) {
  test(`${modeId}: one showcase player defaults disabled and optional enable loads real matching footage`, async ({ page, request }, testInfo) => {
    const manifest = await (await request.get("/static/effects/manifest.json")).json();
    expect(manifest.version).toBe("v5-optional");
    const mode = manifest.modes.find((entry: { id: string }) => entry.id === modeId);
    await page.goto("/?view=explore#physical-effects");
    const explorer = page.locator("#effects-robot-demos");
    await explorer.locator(`#effects-demo-tab-${modeId}`).click();
    const toggle = explorer.getByRole("switch");
    await expect(toggle).not.toBeChecked();
    await expect(explorer.locator(".cinema-player")).toHaveCount(1);
    await expect(explorer.locator(".boundary-replay, .proximity-delta-comparison")).toHaveCount(0);
    await expect(explorer.locator(".effects-demo-technical")).not.toHaveAttribute("open", "");
    for (const variant of mode.variants) {
      await explorer.getByRole("button", { name: variant.label, exact: true }).click();
      await expect(toggle).not.toBeChecked();
      expect(variant.hemisphere_radius_m).toBe(.018);
      expect(variant.disabled.video).not.toBe(variant.video);
      for (const enabled of [false, true]) {
        if (enabled) await toggle.click();
        await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
        const media = enabled ? variant : variant.disabled;
        const response = await request.get(media.video);
        expect(response.ok()).toBe(true);
        expect(createHash("sha256").update(await response.body()).digest("hex")).toBe(media.sha256);
        const frames = (await (await request.get(media.trace)).json()).frames;
        const film = explorer.locator(".effects-film-stage");
        await expect(film.locator("video")).toHaveCount(1);
        await expect(film.locator("video")).toHaveAttribute("src", `${media.video}?v=${media.sha256.slice(0, 12)}`);
        await expect(film.getByRole("slider")).toHaveAttribute("max", "8");
        await film.getByRole("slider").fill("7.9");
        const frame = frames[237];
        const hud = film.getByLabel("Recorded measurements");
        await expect.poll(async () => Number(await hud.getAttribute("data-recorded-time"))).toBeCloseTo(frame.t_s, 6);
        const actual = modeId === "wall" ? frame.wall_plane_x_m - frame.base_position_w_m[0] : frame.base_position_w_m[2];
        const target = modeId === "wall" ? frame.wall_plane_x_m - frame.target_position_w_m[0] : frame.target_position_w_m[2];
        const delta = (actual - target) * 1000;
        expect(frame.annotations.commanded_distance.value_m).toBeCloseTo(target, 10);
        expect(frame.annotations.measured_distance.value_m).toBeCloseTo(actual, 10);
        await expect(hud).toContainText(`Target ${target.toFixed(3)} · actual ${actual.toFixed(3)}`);
        await expect(hud).toContainText(`Δ ${delta.toFixed(1)} mm`);
        await expect(film.locator(".projected-error-badge text")).toHaveText(`Δ ${delta >= 0 ? "+" : ""}${delta.toFixed(1)} mm`);
        for (const cap of await film.locator(".projected-hemisphere").all()) await expect(cap).toHaveAttribute("data-radius-m", "0.018");
        if (!enabled) expect(frame.boundary_gain.every((value: number) => value === 1)).toBe(true);
        expect(await explorer.innerText()).not.toMatch(/ON[−/]OFF|OFF reference|Matched motor-command replay|Same video time/);
        if (variant.id.endsWith("-near")) await explorer.screenshot({ path: testInfo.outputPath(`${modeId}-optional-${enabled ? "enabled" : "disabled"}.png`), style: "header, .skip-link { visibility:hidden !important; }" });
      }
      await toggle.click();
      await expect(toggle).not.toBeChecked();
    }
    await toggle.click();
    await explorer.locator("#effects-demo-tab-current").click();
    await explorer.locator(`#effects-demo-tab-${modeId}`).click();
    await expect(toggle).not.toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
