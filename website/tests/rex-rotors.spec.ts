import { expect, test } from "@playwright/test";
import rex from "../../benchmarks/articulated-embodiments-v3/rex-rotors.json" with { type: "json" };
import media from "../../benchmarks/articulated-embodiments-v3/media.json" with { type: "json" };

test("Rex powered film has six moving native rotors and is the platform lead", async ({ page }) => {
  expect(rex.video_sha256).toBe(media["rex.mp4"].sha256);
  const rotor = rex.rotor_presentation;
  expect(rotor.native_rotor_paths).toHaveLength(6);
  expect(rotor.frame_angles_deg).toHaveLength(600);
  expect(rotor.physical_rpm).toBe(false);
  expect(rotor.accumulated_absolute_turns.every((v:number) => v > 0)).toBe(true);
  for (let i=0;i<6;i++) {
    expect(new Set(rotor.frame_angles_deg.map((f:number[])=>f[i])).size).toBeGreaterThan(30);
  }
  await page.goto("/?view=explore#rexrov2");
  const robot=page.locator("#rexrov2");
  const film=robot.locator("video").first();
  await expect(film).toHaveAttribute("src",new RegExp(`articulated-v3/rex.mp4\\?v=${rex.video_sha256.slice(0,12)}`));
  await robot.locator(".cinema-player").first().scrollIntoViewIfNeeded();
  await expect.poll(()=>film.evaluate((v:HTMLVideoElement)=>v.duration)).toBeCloseTo(20,1);
  await expect(robot).toContainText("six active thrusters");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
