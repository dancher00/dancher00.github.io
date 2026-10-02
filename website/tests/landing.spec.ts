import { expect, test } from "@playwright/test";

test("project homepage preserves tasks, robots, control, physics and verified results", async ({ page, isMobile }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Underwater Manipulation");
  await expect(page.locator("h1")).not.toContainText("Diagnostic");
  if (isMobile) await page.getByRole("button", {name: "Menu", exact: true}).click();
  for (const name of ["Tasks", "Embodiments", "Physical effects", "Results", "Docs ↗"]) await expect(page.getByRole("navigation", {name: "Main navigation"}).getByRole("link", {name, exact: true})).toBeVisible();
  if (isMobile) await page.getByRole("button", {name: "Menu", exact: true}).click();
  await expect(page.locator(".landing-task-card")).toHaveCount(10);
  for (const group of await page.locator(".landing-task-group").all()) { if (await group.getAttribute("open") === null) await group.locator(":scope > summary").click(); }
  for (const group of await page.locator(".landing-task-grid").all()) {
    for (const video of await group.locator("video").all()) {
      await video.scrollIntoViewIfNeeded();
      // Metadata-only preload is allowed to stop before decoding a frame.
      // Request data explicitly so this tests every recording, including paused followers.
      await video.evaluate((v: HTMLVideoElement) => { v.preload = "auto"; v.load(); });
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), {
        message: `Decode the task camera ${await video.getAttribute("src")}`, timeout: 10_000,
      }).toBeGreaterThanOrEqual(2);
      expect(await video.evaluate((v: HTMLVideoElement) => v.error)).toBeNull();
      expect(await video.evaluate(async (v: HTMLVideoElement) => { const img = new Image(); img.src = v.poster; await img.decode(); return img.naturalWidth; })).toBeGreaterThan(0);
      expect(await video.evaluate(v => { const r = v.getBoundingClientRect(); const c = v.closest("article")!.getBoundingClientRect(); return r.right <= c.right + 1 && r.bottom <= c.bottom + 1; })).toBe(true);
    }
  }
  for (const card of await page.locator(".landing-task-card").all()) {
    await expect(card.locator("video")).toHaveCount(3);
    await expect(card.getByRole("button", {name:/^(Expert|ACT|DP)$/})).toHaveCount(0);
    await expect(card.locator(".expert-multiview figcaption")).toHaveCount(0);
    await expect(card).not.toContainText(/expert demonstration/i);
    const externalBounds = await card.locator(".demo-external video").boundingBox();
    expect(externalBounds!.width / externalBounds!.height).toBeCloseTo(16 / 9, 2);
    const cameras = await card.locator(".demo-camera-streams video").all();
    const top = (await cameras[0].boundingBox())!;
    const bottom = (await cameras[1].boundingBox())!;
    expect(Math.abs(top.y - externalBounds!.y)).toBeLessThan(1);
    expect(Math.abs(bottom.y + bottom.height - externalBounds!.y - externalBounds!.height)).toBeLessThan(1);
    expect(top.x).toBeCloseTo(bottom.x, 1);

    for (const camera of await card.locator(".demo-camera-streams video").all()) {
      const bounds = await camera.boundingBox();
      expect(bounds!.width / bounds!.height).toBeCloseTo(1, 2);
      expect(bounds!.x).toBeGreaterThanOrEqual(externalBounds!.x + externalBounds!.width);
      expect(await camera.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBe(await camera.evaluate((v: HTMLVideoElement) => v.videoHeight));
    }
  }
  await page.locator(".landing-task-grid").nth(1).screenshot({path: testInfo.outputPath("task-envs-transport.png")});
  const cabin = page.locator(".landing-task-card").filter({has: page.getByRole("heading", {name:"Cabin recovery", exact:true})});
  await cabin.scrollIntoViewIfNeeded();
  const external = cabin.locator(".demo-external video");
  await external.evaluate((v:HTMLVideoElement) => { v.pause(); v.currentTime = 30; });
  for (const video of await cabin.locator("video").all()) {
    await expect.poll(() => video.evaluate((v:HTMLVideoElement) => v.currentTime)).toBeCloseTo(30, 1);
    await expect.poll(() => video.evaluate((v:HTMLVideoElement) => v.paused)).toBe(true);
  }
  await expect(page.locator(".landing-teaser img")).toBeVisible();
  await expect(page.locator("#embodiments video")).toHaveCount(1);
  await expect(page.locator("#policy-control")).toHaveCount(0);
  await expect(page.locator("#embodiments")).not.toContainText("BlueROV2");
  await page.locator("#physical-effects").scrollIntoViewIfNeeded();
  for (const name of ["Current", "Pool-floor effect", "Near-wall effect", "Actuator response"]) {
    await page.getByRole("tab", {name: new RegExp(name)}).click();
    await expect(page.locator("#effects-demo-panel video").first()).toBeVisible();
  }
  await page.locator("#results").scrollIntoViewIfNeeded();
  await page.locator(".study-numbers > summary").first().click();
  await expect(page.locator("#results tbody tr")).toHaveCount(6);
  await expect(page.getByRole("row", {name: /^Collect shell /})).toContainText("33.3 ± 12.0");
  await expect(page.getByRole("row", {name: /^Pull lever /})).toContainText("40.0 ± 38.4");
  await expect(page.locator("#tasks")).toContainText("earlier asset version");
  await expect(page.locator("#results")).toContainText("3 training seeds");
  await expect(page.getByRole("tab", {name:/VLA \/ SmolVLA/})).toBeVisible();
  await expect(page.getByRole("heading", {name:"WasserMan in motion",exact:true})).toHaveCount(0);
  await expect(page.getByRole("link", {name:"Watch film ↓",exact:true})).toHaveCount(0);
  await expect(page.locator('#embodiments video[src*="bimanual-valve/two-hands"]')).toHaveCount(1);
  await page.locator("#underwater-imaging").scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", {name:"Underwater imaging",exact:true})).toHaveCount(1);
  await page.getByRole("tab", {name:"Water during manipulation",exact:true}).click();
  await expect(page.locator("#imaging-panel video")).toHaveCount(2);
  await expect(page.getByRole("button", {name:"Gripper camera",exact:true})).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute("href")!.slice(1)).filter(id => !document.getElementById(id)))).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({path: testInfo.outputPath("landing.png")});
  for (const href of await page.locator('a[href*="view=docs"]').evaluateAll(links => [...new Set(links.map(a => a.getAttribute("href")!))])) {
    await page.goto(href);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.locator("#docs-content h1")).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});
