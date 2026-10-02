import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

test("active expert and model films use physics-audited grounded presentation", async ({ page, request }, testInfo) => {
  await page.goto("/?view=explore");
  await page.locator(".task-group > summary").nth(2).click();
  for (const task of ["open-hatch", "rotate-valve", "press-button"]) {
    const report=await (await request.get(`/static/recordings/${task}/registered-grounded-v1/report.json`)).json();
    expect(report.presentation.physics_unchanged).toBe(true);
    expect(report.presentation.physics_before_sha256).toBe(report.presentation.physics_after_sha256);
    expect(report.presentation.changes).not.toHaveLength(0);
    const video=task==="press-button" ? page.locator("#press-button-overview .cinema-player video").first() : page.locator(`#${task} video`);
    await video.scrollIntoViewIfNeeded();
    await expect(video).toHaveAttribute("src",/registered-grounded-v1/);
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThan(0);
    await video.evaluate((v:HTMLVideoElement)=>{v.pause();v.currentTime=1;});
    await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.seeking)).toBe(false);
    await video.screenshot({path:testInfo.outputPath(`${task}-grounded-start.png`)});
    const response=await request.get(report.video_url.replace(/^\.\//,"/"));
    expect(createHash("sha256").update(await response.body()).digest("hex")).toBe(report.video_sha256);
  }
  const movies=await (await request.get("/static/policy-rollouts/manifest.json")).json();
  for (const task of ["RotateValve","OpenHatch"]) {
    for (const model of ["ACT","DP"]) {
      const item=movies.find((m:{task:string;model:string})=>m.task===task && m.model===model);
      expect(item.presentation.physics_unchanged).toBe(true);
      expect(item.presentation.physics_before_sha256).toBe(item.presentation.physics_after_sha256);
    }
  }
  await page.locator("#results .model-study > summary").click();
  const result=page.locator("#results");
  await expect(result.locator("video")).toHaveAttribute("src",/openhatch-dp.mp4\?v=/);
  for (const task of ["OpenHatch","RotateValve"]) {
    await result.getByLabel("Policy demonstration",{exact:true}).selectOption(task);
    for (const model of ["ACT","DP"]) {
      await result.getByRole("group",{name:"Policy demonstration model"}).getByRole("button",{name:model==="DP"?"Diffusion Policy":model,exact:true}).click();
      const item=movies.find((m:{task:string;model:string})=>m.task===task && m.model===model);
      const video=result.locator("video");
      await expect(video).toHaveAttribute("src",`${item.video}?v=${item.video_sha256.slice(0,12)}`);
      await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThan(0);
    }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
