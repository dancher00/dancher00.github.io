import { expect, test } from "@playwright/test";

test("corrected shipwreck results use all 30 states and current four policy films", async ({ page }, info) => {
  await page.goto("/?view=explore#results");
  await page.locator("#results .model-study > summary").click();
  await page.getByRole("button", { name: "Shipwreck tasks", exact: true }).click();
  const study=page.getByRole("region", { name: "Corrected shipwreck policy comparison" });
  await expect(study).toBeVisible();
  for (const [task, expected, duration] of [["Cargo release",[3,1],89.9],["Cabin recovery",[0,0],149.9333333]] as const) {
    await study.getByRole("button",{name:task,exact:true}).click();
    for (const [i,name] of ["ACT","Diffusion Policy"].entries()) {
      await expect(study.locator(`[data-wreck-corrected-model="${i===0?"ACT":"DP"}"]`)).toHaveAttribute("data-successes",String(expected[i]));
      await study.getByRole("button",{name,exact:true}).click();
      const video=study.locator("video");
      await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.readyState)).toBeGreaterThan(0);
      expect(await video.evaluate((v:HTMLVideoElement)=>v.duration)).toBeCloseTo(duration,1);
      await expect(study).toContainText("First test reset · 8000");
    }
    if (task==="Cabin recovery") { await expect(study).toContainText("27/30 ACT and 30/30 DP"); await expect(study).toContainText("Failed audits remain"); }
    await study.screenshot({path:info.outputPath(task.replace(" ","-")+".png")});
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
