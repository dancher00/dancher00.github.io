import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

const cabinet = "4d2e8cecbc075f49eb3ad883acb62b531789fe67d876e6fe54347bb4a8e726e2";

test("HDD water playback uses the corrected handle recording and cache version", async ({ page, request }) => {
  const report = await (await request.get("/static/wreck-water/results.json")).json();
  expect(report.model).toBe("wreck-water-v3");
  expect(report.tasks.cabin.unchanged_task_files["src/wasman/assets/data/captain_cabin/cabinet.usda"]).toBe(cabinet);
  await page.goto("/?view=explore#underwater-imaging");
  await page.getByRole("tab", { name: "Water during manipulation" }).click();
  const videos = page.locator(".imaging-camera-pair video");
  await expect(videos).toHaveCount(2);
  const manifest = await (await request.get("/media-manifest.json")).json();
  for (const camera of ["base", "gripper"]) {
    const video = videos.nth(camera === "base" ? 0 : 1);
    await expect(video).toHaveAttribute("src", new RegExp(`${camera}_clear\\.mp4\\?v=wreck-water-v3$`));
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
    expect(await video.evaluate((v: HTMLVideoElement) => [v.videoWidth / v.videoHeight, v.duration, v.error])).toEqual([1, 135.9, null]);
    const name = `static/wreck-water/cabin/${camera}_clear.mp4`;
    const bytes = await (await request.get("/" + name)).body();
    const source = report.tasks.cabin.streams[`${camera}_clear`].sha256;
    const file = manifest.files[name];
    expect(file.source_sha256).toBe(source);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(file.web_sha256);
  }
});

test("selected film preserves measured physics overlays and corrected HDD geometry", async ({ request }) => {
  const film = await (await request.get("/static/publication/overview-v8/edit-manifest.json")).json();
  expect(film.water_recording_version).toBe("wreck-water-v3");
  expect(film.cabin_geometry["src/wasman/assets/data/captain_cabin/cabinet.usda"]).toBe(cabinet);
  expect(film.full_audio_video_decode).toBe("passed");
  const mosaic = film.clips.find((c: {layout: string}) => c.layout === "suite");
  expect(mosaic.streams).toHaveLength(10);
  for (let i = 0; i < mosaic.streams.length; i++) {
    const box = mosaic.streams[i].box;
    expect(box.slice(2)).toEqual([352, 198]);
    expect(box[1]).toBe(mosaic.streams[i < 5 ? 0 : 5].box[1]);
    expect(box[0]).toBe(mosaic.streams[i % 5].box[0]);
  }
  for (const clip of film.clips.filter((c: {layout: string}) => ["task", "optics"].includes(c.layout))) {
    for (const stream of clip.streams) expect(stream.label).not.toMatch(/external|base|gripper|camera/i);
  }
  expect(new Set(Object.values(film.chart_palette)).size).toBe(4);
  const physics = film.clips.filter((c: {layout: string}) => ["current", "proximity", "actuators"].includes(c.layout));
  expect(physics.flatMap((c: {streams: unknown[]}) => c.streams)).toHaveLength(9);
  for (const clip of physics) for (const stream of clip.streams) {
    expect(stream.annotation.frames).toBe(clip.duration * film.fps);
    expect(stream.annotation.source_sha256).toBe(film.inputs[stream.source].sha256);
    expect([stream.annotation.width, stream.annotation.height]).toEqual(stream.box.slice(2));
  }
  const manifest = await (await request.get("/media-manifest.json")).json();
  const oldHandleHash = "7afef780ebf0b26c567c6b8152fbe1273d1436bf04b9921fe3cd47f5c7da8bf7";
  expect(Object.values(manifest.files).some((f: any) => f.source_sha256 === oldHandleHash)).toBe(false);
  expect(Object.keys(manifest.files).filter(name => /^static\/publication\/overview/.test(name)).every(name => name.includes("overview-v8/"))).toBe(true);
});
