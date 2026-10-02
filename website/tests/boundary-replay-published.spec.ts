import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

for (const id of ["seabed", "wall"]) {
  test(`${id}: verified replay archive remains available but product page has one optional-effect player`, async ({ page, request }) => {
    const manifest = await (await request.get("/static/effects/boundary_replay_v1/manifest.json")).json();
    expect(manifest.audit.passed).toBe(true);
    expect(manifest.calibrated).toBe(false);
    expect(manifest.feedback_compensation).toBe(false);
    const mode = manifest.modes.find((entry: { id: string }) => entry.id === id);
    for (const variant of mode.variants) {
      const response = await request.get(variant.video);
      expect(response.ok()).toBe(true);
      expect(createHash("sha256").update(await response.body()).digest("hex")).toBe(variant.sha256);
    }
    await page.goto("/?view=explore#physical-effects");
    await page.locator(`#effects-demo-tab-${id}`).click();
    const explorer = page.locator("#effects-robot-demos");
    await expect(explorer.locator(".boundary-replay, .boundary-archived-evidence")).toHaveCount(0);
    await expect(explorer.locator(".cinema-player")).toHaveCount(1);
    await expect(explorer.getByRole("switch")).not.toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
