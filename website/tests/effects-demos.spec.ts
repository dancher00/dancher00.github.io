import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

for (const modeId of ["current", "seabed", "wall", "actuator"]) {
  test(`${modeId}: robot diagnostic video and measured overlays share a timeline`, async ({ page, request }, testInfo) => {
    const response = await request.get("/static/effects/manifest.json");
    expect(response.ok(), "Real diagnostic recordings must be published before release").toBe(true);
    const manifest = await response.json();
    expect(manifest.version).toBe("v5-optional");
    const mode = manifest.modes.find((m: { id: string }) => m.id === modeId);
    expect(mode.variants).toHaveLength(modeId === "current" ? 3 : 2);
    await page.goto("/?view=explore#physical-effects");
    const explorer = page.locator("#effects-robot-demos");
    const film = explorer.locator(".effects-film-stage");
    await explorer.locator(`#effects-demo-tab-${modeId}`).click();
    if (modeId === "seabed" || modeId === "wall") {
      await expect(explorer.getByRole("switch")).not.toBeChecked();
      await explorer.getByRole("switch").click();
    }
    await expect(explorer.getByRole("tab")).toHaveCount(4);
    await expect(page.locator(".effects-model-details")).not.toHaveAttribute("open", "");
    for (const variant of mode.variants) {
      expect(variant.source_report).toMatch(modeId === "wall" || modeId === "seabed" ? /boundary_motor_replay/ : /effects_v3\//);
      expect(variant.annotations_schema_version).toBe(2);
      expect(variant.scene.kind).toBe(modeId === "current" ? "sand" : "pool");
      expect(variant.scene.manipulation_objects).toEqual([]);
      if (modeId !== "current") {
        expect(variant.scene.dimensions).toMatchObject({ length_m: 25, width_m: 25, water_depth_m: 2.5 });
        expect(variant.scene.free_surface_dynamics).toBe(false);
      }
      if (modeId === "wall") expect(variant.scene.boundary_surface).toBe("pool_wall");
      const videoResponse = await request.get(variant.video);
      expect(videoResponse.ok()).toBe(true);
      expect(createHash("sha256").update(await videoResponse.body()).digest("hex")).toBe(variant.sha256);
      const trace = await (await request.get(variant.trace)).json();
      expect(trace.frames).toHaveLength(240);
      expect(variant.telemetry_offset_s).toBeCloseTo(1 / 30, 6);
      await explorer.getByRole("button", { name: variant.label, exact: true }).click();
      await expect(explorer.getByLabel("Recorded simulation scene")).toContainText(modeId === "current" ? "Sandy seabed · ρ = 1025 kg/m³" : "25 × 25 m pool · 2.5 m water depth · ρ = 1025 kg/m³");
      await expect(explorer.locator(".effects-demo-legacy")).toHaveCount(0);
      const video = film.locator(".cinema-observer");
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(1);
      expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(8, 2);
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
      expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(0.05);
      const firstFrameMean = await video.evaluate((v: HTMLVideoElement) => {
        const canvas = document.createElement("canvas"); canvas.width = 32; canvas.height = 18;
        const context = canvas.getContext("2d")!; context.drawImage(v, 0, 0, 32, 18);
        const pixels = context.getImageData(0, 0, 32, 18).data;
        return pixels.reduce((sum, value, index) => sum + (index % 4 === 3 ? 0 : value), 0) / (32 * 18 * 3);
      });
      expect(firstFrameMean, "Frame zero must be rendered, not cold-start black").toBeGreaterThan(5);
      await film.getByRole("slider").fill("4");
      const hud = explorer.getByLabel("Recorded measurements");
      await expect.poll(async () => Number(await hud.getAttribute("data-recorded-time"))).toBeCloseTo(4 + 1 / 30, 3);
      const measured = trace.frames[120];
      expect(measured.annotations.schema_version).toBe(2);
      expect(measured.annotations.viewport_px).toEqual([1280, 720]);
      const overlay = film.locator(".cinema-player > .effects-projected-geometry");
      await expect.poll(async () => Number(await overlay.getAttribute("data-recorded-time"))).toBeCloseTo(4 + 1 / 30, 3);
      const endpoints = async (selector: string) => overlay.locator(selector).evaluateAll((lines) => lines.map((line) => ["x1", "y1", "x2", "y2"].map((key) => Number(line.getAttribute(key)))));
      if (modeId === "current") {
        await expect(hud).toContainText(`WATER X / ${measured.current_w_m_s[0].toFixed(2)} m/s`);
        const errorMm = Math.hypot(measured.base_position_w_m[0] - measured.target_position_w_m[0], measured.base_position_w_m[1] - measured.target_position_w_m[1]) * 1000;
        await expect(hud).toContainText(`XY error / ${errorMm.toFixed(1)} mm`);
        const arrows = measured.annotations.current_arrows.filter((arrow: { valid: boolean }) => arrow.valid);
        expect(await endpoints(".projected-current-arrows line")).toEqual(arrows.map((arrow: { start_px: number[]; end_px: number[] }) => [...arrow.start_px, ...arrow.end_px]));
        if (variant.id !== "current-still") {
          expect(arrows).toHaveLength(3);
          await film.getByRole("slider").fill("1");
          await expect(hud).toContainText("WATER X / 0.00 m/s");
          await expect(overlay.locator(".projected-current-arrows line")).toHaveCount(0);
          await film.getByRole("slider").fill("4");
        }
        await expect(explorer.locator(".effects-xy-inset")).toHaveCount(0);
        const inset = explorer.getByLabel("Synchronized external camera", { exact: true });
        await expect(inset).toBeVisible();
        expect(createHash("sha256").update(await (await request.get(variant.inset_video)).body()).digest("hex")).toBe(variant.inset_sha256);
        const insetVideo = inset.locator("video");
        await expect.poll(() => insetVideo.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(1);
        await expect.poll(() => insetVideo.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(4, 2);
        expect(await insetVideo.evaluate((v: HTMLVideoElement) => [v.videoWidth, v.videoHeight, v.duration])).toEqual([640, 480, 8]);
        await expect(hud).toContainText(`Allocator scale / ${(measured.allocator_saturation_scale * 100).toFixed(1)}%`);
        for (const [scope, annotation] of [[overlay, measured.annotations], [inset, measured.inset_annotations]] as const) {
          const trajectory = annotation.gripper_trajectory;
          expect(trajectory.points_px).toHaveLength(121);
          await expect(scope.locator(".gripper-current")).toHaveAttribute("cx", String(trajectory.current_px[0]));
          await expect(scope.locator(".gripper-current")).toHaveAttribute("cy", String(trajectory.current_px[1]));
          await expect(scope.locator(".gripper-reference")).toHaveAttribute("cx", String(annotation.gripper_reference.point_px[0]));
          await expect(scope.locator(".gripper-reference title")).toHaveText("Initial tool position");
          const path = await scope.locator(".gripper-trail").getAttribute("d");
          expect(path).toContain(`${trajectory.current_px[0]} ${trajectory.current_px[1]}`);
          expect(path!.replace(/[MLZ]/g, " ").trim().split(/\s+/).map(Number)).toEqual(trajectory.points_px.filter((_: number[], i: number) => trajectory.valid[i]).flat());
        }
      } else {
        const actual = modeId === "wall" ? measured.wall_plane_x_m - measured.base_position_w_m[0] : measured.base_position_w_m[2];
        const reference = measured.target_position_w_m;
        const target = modeId === "wall" ? measured.wall_plane_x_m - reference[0] : reference[2];
        await expect(hud).toContainText(`Target ${target.toFixed(3)} · actual ${actual.toFixed(3)}`);
        await expect(hud).toContainText(`Δ ${((actual - target) * 1000).toFixed(1)} mm`);
        if (modeId !== "actuator") {
          const rays = measured.annotations.rotor_rays.filter((ray: { motor_index: number; valid: boolean }) => ray.valid && (modeId === "wall" ? ray.motor_index < 4 : ray.motor_index >= 4));
          expect(rays).toHaveLength(4);
          expect(await endpoints(".projected-rotor-ray")).toEqual(rays.map((ray: { start_px: number[]; end_px: number[] }) => [...ray.start_px, ...ray.end_px]));
          await expect(overlay.locator(".projected-hemisphere")).toHaveCount(rays.filter((ray: { hemisphere: { valid: boolean } }) => ray.hemisphere.valid).length);
          for (const ray of rays) {
            if (!ray.hemisphere.valid) continue;
            const glyph = overlay.locator(`[data-motor-index="${ray.motor_index}"] .projected-hemisphere`);
            await expect(glyph).toHaveAttribute("data-radius-m", String(variant.hemisphere_radius_m ?? 0.045));
            const ring = ray.hemisphere.base_ring;
            const ringPath = await glyph.locator(".hemisphere-base").getAttribute("d");
            expect(ringPath!.replace(/[MLZ]/g, " ").trim().split(/\s+/).map(Number)).toEqual(ring.points_px.filter((_: number[], i: number) => ring.valid[i]).flat());
            await expect(glyph.locator(".hemisphere-meridian")).toHaveCount(1);
          }
          for (const [selector, field] of [[".projected-commanded-line", "commanded_line"], [".projected-measured-line", "measured_line"]]) {
            expect(await endpoints(selector)).toEqual(measured.annotations[field].filter((line: { valid: boolean }) => line.valid).map((line: { start_px: number[]; end_px: number[] }) => [...line.start_px, ...line.end_px]));
          }
          expect(measured.annotations.measured_distance.value_m).toBeCloseTo(actual, 6);
          expect(measured.annotations.commanded_distance.value_m).toBeCloseTo(target, 6);
        }
      }
      await film.getByRole("button", { name: "Play recording", exact: true }).click();
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
      await film.getByRole("button", { name: "Pause recording", exact: true }).click();
      if (modeId === "current") {
        const insetVideo = film.locator(".external-camera-bank video");
        await expect.poll(() => insetVideo.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
        await film.getByRole("button", { name: "Playback speed 1x" }).click();
        await film.getByRole("button", { name: "Play recording", exact: true }).click();
        await expect.poll(() => insetVideo.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(0.5);
        await expect.poll(() => insetVideo.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
        await film.getByRole("button", { name: "Pause recording", exact: true }).click();
        await film.getByRole("button", { name: "Playback speed 0.5x" }).click();
        await film.getByRole("button", { name: "Show synchronized external camera" }).click();
        await expect(film.locator(".external-camera-bank")).toBeHidden();
        await film.getByRole("button", { name: "Show synchronized external camera" }).click();
        await expect(film.locator(".external-camera-bank")).toBeVisible();
        if (variant.id === "current-overload") {
          await film.getByRole("slider").fill("7.9");
          await expect.poll(() => insetVideo.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(7.9, 2);
          const late = trace.frames[237];
          expect(late.allocator_saturation_scale).toBeLessThan(0.8);
          expect(Math.hypot(late.base_position_w_m[0] - late.target_position_w_m[0], late.base_position_w_m[1] - late.target_position_w_m[1])).toBeGreaterThan(1.5);
          await expect(hud).toContainText("thrust limited");
          await expect(hud).toContainText("controller capped");
          await expect(explorer.locator(".effects-demo-finding")).toContainText(/controller|allocation/i);
        }
      }
      if (modeId === "actuator") {
        await expect(explorer.getByRole("img", { name: "Measured height tracking, synchronized with robot recording" })).toBeVisible();
        await expect(explorer.locator(".height-actual")).toHaveCount(2);
        const points = await explorer.locator(".height-actual").first().getAttribute("points");
        expect(points?.split(" ").length).toBeGreaterThan(100);
      }
    }
    if (modeId !== "actuator") {
      await film.getByRole("button", { name: /^Fullscreen / }).click();
      await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
      await expect(page.locator(":fullscreen > .effects-projected-geometry")).toBeVisible();
      await expect(page.locator(":fullscreen > .effects-projected-geometry clipPath rect")).toHaveAttribute("width", "1280");
      await expect(page.locator(":fullscreen > .effects-projected-geometry clipPath rect")).toHaveAttribute("height", "720");
      if (modeId === "current") await expect(page.locator(":fullscreen .external-camera-bank .effects-projected-geometry")).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`${modeId}-fullscreen.png`) });
      await page.evaluate(() => document.exitFullscreen());
      await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (testInfo.project.name === "mobile") {
      const image = await film.locator(".cinema-observer").boundingBox();
      const controls = await film.locator(".cinema-controls").boundingBox();
      expect(controls!.y).toBeGreaterThanOrEqual(image!.y + image!.height - 1);
    }
    await explorer.screenshot({ path: testInfo.outputPath(`${modeId}-robot-demo.png`), style: "header, .skip-link { visibility:hidden !important; }" });
  });
}

test("physical-effect tabs support keyboard navigation without claiming unrecorded footage", async ({ page }) => {
  await page.goto("/?view=explore#physical-effects");
  const current = page.locator("#effects-demo-tab-current");
  await current.focus();
  await current.press("ArrowRight");
  await expect(page.locator("#effects-demo-tab-seabed")).toBeFocused();
  await expect(page.locator("#effects-demo-tab-seabed")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(page.locator("#effects-demo-tab-actuator")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(current).toBeFocused();
});
