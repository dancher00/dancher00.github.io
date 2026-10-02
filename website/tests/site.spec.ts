import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

test("model benchmarks match verified reports and exclude expert scores", async ({ page, request }) => {
  await page.goto("/?view=explore#results");
  const results = page.locator("#results");
  await results.locator(".model-study > summary").click();
  await results.locator(".benchmark-evidence > summary").click();
  const data = await (await request.get("/static/model-benchmarks.json")).json();
  const valve = JSON.parse(readFileSync(new URL("../fixtures/valve_visual_20260923/final_report/results.json", import.meta.url), "utf8"));
  await expect(results.locator("tbody tr")).toHaveCount(data.rows.length);
  for (const model of ["ACT", "DP"]) {
    const reference = valve.methods.find((r: {model: string}) => r.model === model);
    const row = data.rows.find((r: {task: string; model: string}) => r.task === "RotateValve" && r.model === model);
    expect(row.successes).toBe(reference.successes);
    expect(row.episodes).toBe(reference.episodes);
    expect(row.median_success_time_s).toBe(reference.median_success_time_s);
  }
  expect(data.rows.every((r: {model: string}) => r.model !== "Expert")).toBe(true);
  await expect(results).toContainText("75 s horizon");
  await expect(results).not.toContainText("Development checkpoint");
});

test("all seventeen catalog task contracts and honest result table", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?view=explore");
  await expect(page.locator(".task-card")).toHaveCount(17);
  for (const [index, count] of [2, 6, 9].entries()) {
    await expect(
      page.locator(".task-group").nth(index).locator(".task-card"),
    ).toHaveCount(count);
  }
  const benchmark = await (await request.get("/static/model-benchmarks.json")).json();
  await expect(page.locator("#results tbody tr")).toHaveCount(benchmark.rows.length);
  await page.locator(".task-group > summary").first().click();
  await page.locator(".task-spec summary").first().click();
  await expect(page.locator(".task-spec").first()).toContainText(
    "Travel ≥ 4 mm",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("shell full expert film is verified and plays without overlays", async ({ page, request }, testInfo) => {
  await page.goto("/?view=explore#tasks");
  const card = page.locator("#collect-shell");
  await page.locator(".task-group").filter({ has: card }).locator(":scope > summary").click();
  const report = await (await request.get("/static/recordings/collect-shell/registered-v1/report.json")).json();
  expect(report.full_task_success).toBe(true);
  expect(report.telemetry_contract_replayed).toBe(true);
  const movie = await request.get(report.video_url);
  expect(createHash("sha256").update(await movie.body()).digest("hex")).toBe(report.video_sha256);
  await expect(card.locator(".preview-label")).toHaveCount(0);
  await expect(card).toContainText("Validated");
  await expect(card).toContainText("DP 28/30");
  const video = card.locator("video.expert-demo");
  await expect(video).not.toHaveAttribute("controls");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
  expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(report.duration_s, 1);
  await video.evaluate((v: HTMLVideoElement) => { v.pause(); v.currentTime = v.duration - 1; });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
  await card.screenshot({ path: testInfo.outputPath("collect-shell-demo.png") });
});

for (const task of ["rotate-valve", "open-hatch"]) {
  test(`${task} uses a clean verified expert film`, async ({ page, request }, testInfo) => {
    await page.goto(`/?view=explore#${task}`);
    const card = page.locator(`#${task}`);
    await page.locator(".task-group > summary").nth(2).click();
    const report = await (await request.get(`/static/recordings/${task}/registered-grounded-v1/report.json`)).json();
    expect(report.telemetry_contract_replayed).toBe(true);
    expect(report.automatic_resets).toBe(0);
    const movie = await request.get(report.video_url);
    expect(createHash("sha256").update(await movie.body()).digest("hex")).toBe(report.video_sha256);
    const video = card.locator("video.expert-demo");
    await expect(video).toHaveCount(1);
    await expect(video).not.toHaveAttribute("controls");
    await expect(card.locator(".cinema-player, .preview-label, .camera-bank, select")).toHaveCount(0);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
    expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeCloseTo(report.duration_s, 1);
    await video.evaluate((v: HTMLVideoElement) => { v.pause(); v.currentTime = v.duration - 2; });
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.seeking)).toBe(false);
    await card.screenshot({ path: testInfo.outputPath(`${task}-clean-demo.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("explorers and mobile navigation work", async ({ page, isMobile }) => {
  await page.goto("/?view=explore");
  if (isMobile)
    await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Tasks", exact: true })
    .click();
  await expect(page).toHaveURL(/#tasks$/);
  await page
    .getByRole("button", { name: "Hydrodynamics", exact: true })
    .click();
  await expect(page.locator(".explorer-content")).toContainText("0–0.22 m/s");
  await page
    .getByRole("button", { name: "End-effector targets", exact: true })
    .click();
  await expect(page.locator(".control-panel").first()).toContainText(
    "Trained ACT and Diffusion Policy",
  );
  await page.getByText("Model equations and numerical sensitivity", { exact: true }).click();
  await page.getByRole("button", { name: "Visibility", exact: true }).click();
  await expect(page.locator(".effect-panel")).toContainText(
    "No policy robustness result yet",
  );
});

test("actual rollout, raw results and internal links resolve", async ({
  page,
  request,
}) => {
  await page.goto("/?view=explore");
  const json = await request.get("/static/press_button_evaluation.json");
  expect(json.ok()).toBe(true);
  expect(await json.json()).toEqual(
    JSON.parse(
      readFileSync(
        new URL(
          "../fixtures/press_button_evaluation.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ),
  );
  await expect.poll(() => page.locator(".cinema-observer").evaluateAll((videos) => videos.filter((video) => !video.closest("#effects-robot-demos")).length)).toBe(4);
  const smooth = await request.get("/static/press_button_smooth_evaluation.json");
  expect(smooth.ok()).toBe(true);
  expect(await smooth.json()).toEqual(JSON.parse(readFileSync(
    new URL("../fixtures/press_button_smooth_evaluation.json", import.meta.url), "utf8",
  )));
  for (const name of ["press_button_t200_evaluation", "press_button_ideal_matched_2031", "press_button_approach_evaluation"]) {
    const result = await request.get(`/static/${name}.json`);
    expect(result.ok()).toBe(true);
    expect(await result.json()).toEqual(JSON.parse(readFileSync(
      new URL(`../fixtures/${name}.json`, import.meta.url), "utf8",
    )));
  }
  const video = page.locator(".overview .cinema-observer");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState))
    .toBeGreaterThan(0);
  expect(
    await video.evaluate((v: HTMLVideoElement) => v.duration),
  ).toBeCloseTo(36, 0);
  await expect(page.locator(".overview .media-note")).toContainText("1.7 m");
  await expect(page.locator("#results")).toContainText("16 s horizon");
  await expect(page.locator(".task-group > summary")).toHaveCount(3);
  for (const group of await page.locator(".task-group > summary").all()) await group.click();
  for (const preview of await page.locator(".task-media video").all()) {
    await expect
      .poll(() => preview.evaluate((v: HTMLVideoElement) => v.readyState))
      .toBeGreaterThan(0);
    expect(
      await preview.evaluate((v: HTMLVideoElement) => v.duration),
    ).toBeGreaterThan(3);
  }
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((a) => a.getAttribute("href")!.slice(1))
        .filter((id) => !document.getElementById(id)),
    );
  expect(broken).toEqual([]);
});

test("custom observation player supports playback, seeking and speed", async ({ page }) => {
  await page.goto("/?view=explore");
  const player = page.locator(".overview .cinema-player");
  await player.scrollIntoViewIfNeeded();
  const video = player.locator(".cinema-observer");
  await expect(video).not.toHaveAttribute("controls");
  await player.getByRole("button", { name: "Play recording", exact: true }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await player.getByRole("button", { name: "Pause recording", exact: true }).click();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  const seek = player.getByRole("slider");
  await seek.fill("2");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(2, 1);
  await player.getByRole("button", { name: "Playback speed 1x" }).click();
  expect(await video.evaluate((v: HTMLVideoElement) => v.playbackRate)).toBe(0.5);
});

test("task catalog uses underwater scenarios", async ({ page }) => {
  await page.goto("/?view=explore");
  await expect(page.locator(".task-group > summary")).toHaveCount(3);
  for (const group of await page.locator(".task-group > summary").all()) await group.click();
  for (const name of ["Collect Shell into a Hoop", "Open a Submerged Chest", "Seabed Object Recovery", "Cut Kelp", "Cut an Entangling Net", "Insert into Socket"]) {
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: /Lemon|Toss Ball|Cabinet/ })).toHaveCount(0);
});
