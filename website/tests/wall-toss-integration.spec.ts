import { expect, test } from "@playwright/test";

test("paired wall throw plays all cameras and retains its expert-only scope", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/?view=explore#wall-toss-study");
  const study = page.getByRole("region", {name:"Wall Toss paired current demonstration"});
  await expect(study).toContainText("no ACT/DP evaluation");
  for (const name of ["External", "Base", "Gripper"]) {
    await study.getByRole("button", {name,exact:true}).click();
    const films=study.locator("video");
    await expect(films).toHaveCount(2);
    for (const v of await films.all()) {
      await expect.poll(()=>v.evaluate((e:HTMLVideoElement)=>e.readyState)).toBeGreaterThan(0);
      expect(await v.evaluate((e:HTMLVideoElement)=>e.duration)).toBeCloseTo(10.8,1);
    }
    await study.locator('button[aria-label="Play recording"]').click();
    await expect.poll(()=>films.first().evaluate((e:HTMLVideoElement)=>e.currentTime)).toBeGreaterThan(.1);
    const times=await films.evaluateAll(vs=>vs.map(v=>(v as HTMLVideoElement).currentTime));
    expect(Math.abs(times[0]-times[1])).toBeLessThan(.15);
    await study.locator('button[aria-label="Pause recording"]').click();
  }
  await study.getByRole("button",{name:"External",exact:true}).click();
  await study.screenshot({path:info.outputPath("wall-toss.png")});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("selected expert cameras load while core experts and nine-task count remain", async ({page})=>{
  await page.goto("/?view=explore#tasks");
  for (const group of await page.locator(".task-group > summary").all()) await group.click();
  await expect(page.locator(".release-note")).toContainText("6 core + 3 extended benchmark tasks");
  for (const id of ["RecoverData","HotStab","TossBall"]) {
    const card=page.locator(`[data-selected-demo="${id}"]`);
    await card.scrollIntoViewIfNeeded();
    for (const camera of ["External","Base","Gripper"]) {
      await card.getByRole("button",{name:camera,exact:true}).click();
      await expect.poll(()=>card.locator("video").evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThan(0);
    }
  }
  for (const task of ["Push Slider","Pull Lever"]) {
    const card=page.locator(".task-card").filter({has:page.getByRole("heading",{name:task,exact:true})});
    await expect(card.locator("video")).toHaveAttribute("src", /marine-mechanisms/);
    await expect(card).not.toContainText("zero actions");
  }
});
