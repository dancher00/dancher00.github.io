import { test, expect } from "@playwright/test";
import data from "../src/modelBenchmarks.json" with { type: "json" };
import experts from "../public/static/marine-mechanisms/experts.json" with { type: "json" };

test("completed marine tasks expose verified expert films and model curves", async ({ page, request }) => {
  for (const task of ["PushSlider", "PullLever"]) {
    const rows = data.rows.filter(r => r.task === task);
    expect(rows.map(r => r.model).sort()).toEqual(["ACT", "DP"]);
    expect(rows.every(r => r.episodes === 30)).toBe(true);
    const film = (experts as {task:string;video:string}[]).find(r => r.task === task);
    expect(film).toBeTruthy();
    const response = await request.get(film!.video.replace("./", "/"), { headers: { Range: "bytes=0-1023" } });
    expect([200,206]).toContain(response.status());
  }
  await page.goto("/?view=explore");
  await page.locator(".task-group > summary").nth(2).click();
  for (const task of ["Push Slider", "Pull Lever"]) {
    const card=page.locator(".task-card").filter({has:page.getByRole("heading",{name:task,exact:true})});
    await expect(card.locator("video")).toHaveAttribute("aria-label",`${task} recording`);
    await expect(card.locator(".badge")).toHaveText("Benchmarked");
    await expect(card.locator(".preview-label")).toHaveCount(0);
  }
  await page.locator("#results").scrollIntoViewIfNeeded();
  await page.locator("#results .model-study > summary").click();
  await page.getByRole("link",{name:"Additional studies and diagnostics ↗"}).click();
  const study=page.getByRole("region",{name:"Constrained mechanism evaluation"});
  for (const task of ["Push Slider", "Pull Lever"]) {
    await page.getByRole("group",{name:"Mechanism results task"}).getByRole("button",{name:task}).click();
    await expect(study.getByRole("img",{name:`${task} cumulative success over time`})).toBeVisible();
    await expect(study.locator("svg polyline")).toHaveCount(4);
  }
  await page.getByRole("link",{name:"← WasserMan results",exact:true}).click();
  await page.locator("#results .model-study > summary").click();
  for (const task of ["PushSlider", "PullLever"]) {
    const rows=data.rows.filter(r=>r.task===task);
    for (const row of rows) {
      const point=page.locator(`.research-data-point[data-task="${task}"][data-model="${row.model}"]`).first();
      await expect(point).toHaveAttribute("data-value",String(100*row.successes/30));
    }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("marine expert gallery plays clean complete films", async ({ page, request }, testInfo) => {
  const manifest = await (await request.get("/static/marine-mechanisms/experts.json")).json();
  expect(manifest.map((x:{task:string})=>x.task).sort()).toEqual(["PullLever","PushSlider"]);
  await page.goto("/?view=explore#tasks");
  await page.locator(".task-group > summary").nth(2).click();
  for (const item of manifest) {
    const task=item.task.replace(/([a-z])([A-Z])/g,"$1 $2");
    const card=page.locator(".task-card").filter({has:page.getByRole("heading",{name:task,exact:true})});
    const video=card.locator("video");
    await card.scrollIntoViewIfNeeded();
    await expect(video).not.toHaveAttribute("controls");
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThan(0);
    expect(await video.evaluate((v:HTMLVideoElement)=>v.duration)).toBeCloseTo(item.duration_s,1);
    await video.evaluate((v:HTMLVideoElement)=>{v.pause();v.currentTime=16;});
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.seeking)).toBe(false);
    await card.screenshot({path:testInfo.outputPath(`${item.task}-expert.png`)});
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
