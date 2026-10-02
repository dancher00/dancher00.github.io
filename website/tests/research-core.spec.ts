import { expect, test } from "@playwright/test";

test("new studies appear only after verification and plot recorded outcomes", async ({ page, request }) => {
  let core=await (await request.get("/static/research-core-studies.json")).json();
  if(!core.complete)core=await (await request.get("/static/research-core-progress.json")).json();
  const water=await (await request.get("/static/water-motor-study.json")).json();
  await page.goto("/?view=explore#results");
  const results=page.locator("#results");
  await results.locator(".model-study > summary").click();
  await results.getByRole("button",{name:"Data budget",exact:true}).click();
  if(core.complete || core.verified_completed_rows){
    for(const [study,title] of [["scaling","Demonstration budget"],["repetitions","Training repetitions"]]){
      if(!core.records.some((r:{study:string})=>r.study===study)) continue;
      const panel=results.locator(".research-core-study").filter({has:page.locator("summary",{hasText:title})});

      const rows=core.records.filter((r:{study:string})=>r.study===study);
      for(const task of new Set<string>(rows.map((r:{task:string})=>r.task))){
        const marks=panel.locator(`[data-task="${task}"]`);
        const group=rows.filter((r:{task:string})=>r.task===task);
        await expect(marks).toHaveCount(group.length);
        for(let i=0;i<group.length;i++)await expect(marks.nth(i)).toHaveAttribute("data-successes",String(group[i].successes));
      }
    }
  }else await expect(results.locator(".research-core-study")).toHaveCount(0);
  await results.getByRole("tab",{name:/Policy × control/}).click();
  if(water.complete){
    await results.getByRole("button",{name:"Current & motor limits",exact:true}).click();
    const panel=results.locator(".research-core-study").filter({has:page.locator("summary",{hasText:"Current and motor capacity"})});

    await expect(panel.locator("svg")).toHaveCount(2);
    await expect(panel.locator("[data-study]")).toHaveCount(12);
    await expect(panel).toContainText("one factor changes at a time");
  }
  if(core.complete || core.verified_completed_rows){
    await results.getByRole("button",{name:"Action interface",exact:true}).click();
    const panel=results.locator(".research-core-study").filter({has:page.locator("summary",{hasText:"Action interface"})});

    await expect(panel.locator("[data-study]")).toHaveCount(core.records.filter((r:{study:string})=>r.study === "interface").length);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("completed-study graph layout works before real jobs finish (isolated fixtures)", async ({ page }, testInfo) => {
  const tasks=["PushSlider","PullLever"];
  const rows: Record<string,unknown>[]=[];
  for(const task of tasks){
    for(const num_demos of [10,20,40,80]) rows.push({study:"scaling",task,model:"DP",num_demos,training_seed:42});
    for(const model of ["ACT","DP"]){
      for(const training_seed of [42,43,44]) rows.push({study:"repetitions",task,model,training_seed});
      for(const control of ["actuator","ee"]) rows.push({study:"interface",task,model,interface:control});
    }
  }
  const scored=rows.map((r,i)=>({...r,successes:i%31,test_episodes:30,success_percent:(i%31)/30*100,ci95:[0,100]}));
  const water=["RotateValve","OpenHatch"].flatMap(task=>["reference","current_y_010","current_y_020","current_y_m020","motor_080","motor_060"].map(condition=>({task,condition,successes:15,test_episodes:30,success_percent:50,ci95:[30,70]})));
  await page.route("**/static/research-core-studies.json",route=>route.fulfill({json:{complete:true,records:scored,scope:"Synthetic browser fixture only"}}));
  await page.route("**/static/water-motor-study.json",route=>route.fulfill({json:{complete:true,records:water,scope:"Synthetic browser fixture only"}}));
  await page.goto("/?view=explore#results");
  const results=page.locator("#results");
  await results.locator(".model-study > summary").click();
  await results.getByRole("button",{name:"Data budget",exact:true}).click();
  for(const title of ["Demonstration budget","Training repetitions"]){
    const panel=results.locator(".research-core-study").filter({has:page.locator("summary",{hasText:title})});

    await expect(panel.locator("svg")).toHaveCount(2);
    await expect(panel.locator("[data-study]")).toHaveCount(title==="Demonstration budget"?8:12);
  }
  await results.getByRole("tab",{name:/Policy × control/}).click();
  for(const title of ["Action interface","Current and motor capacity"]){
    await results.getByRole("button",{name:title === "Action interface" ? title : "Current & motor limits",exact:true}).click();
    const panel=results.locator(".research-core-study").filter({has:page.locator("summary",{hasText:title})});

    await expect(panel.locator("[data-study]")).toHaveCount(title==="Action interface"?8:12);
    await panel.screenshot({path:testInfo.outputPath(`${title.replaceAll(" ","-")}.png`)});
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("PullLever recovery reports failed validation without inventing a final test", async ({ page, request }) => {
  const report = await (await request.get("/static/pulllever-act-correction.json")).json();
  await page.goto("/?view=appendix#diagnostics");
  const results = page.locator("#research-appendix");
  const panel = results.getByTestId("pulllever-correction");
  await panel.locator("summary").click();
  const points = panel.locator('[data-recovery-phase="validation"]');
  await expect(points).toHaveCount(report.validation.length);
  for (let i=0; i<report.validation.length; i++) await expect(points.nth(i)).toHaveAttribute("data-successes", String(report.validation[i].successes));
  await expect(panel.locator('[data-recovery-phase="test"]')).toHaveCount(report.final.length);
  if (report.selected_update === 0) await expect(panel).toContainText("final test was not opened");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("XYZ position correction keeps selection and final results separate", async ({ page, request }) => {
  const response = await request.get("/static/pushslider-position-correction.json");
  expect(response.ok()).toBe(true);
  const report = await response.json();
  await page.goto("/?view=appendix#diagnostics");
  const results = page.locator("#research-appendix");
  const panel = results.getByTestId("position-correction");
  await panel.locator("summary").click();
  for (const group of report.display_groups) {
    const marks = panel.locator(`[data-position-group="${group.key}"]`);
    await expect(marks).toHaveCount(group.points.length);
    for (let i=0;i<group.points.length;i++) await expect(marks.nth(i)).toHaveAttribute("data-successes",String(group.points[i].successes));
  }
  if (!report.completion.final_test_opened) {
    await expect(panel.locator('[data-position-group="test"]')).toHaveCount(0);
    await expect(panel).toContainText("final test was not opened");
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("smooth demonstration pilot plots measured outcomes and respects its selection gate", async ({ page, request }, testInfo) => {
  const response = await request.get("/static/pushslider-smooth-teacher.json");
  expect(response.ok()).toBe(true);
  const report = await response.json();
  await page.goto("/?view=appendix#diagnostics");
  const results = page.locator("#research-appendix");
  const panel = results.getByTestId("smooth-teacher-study");
  await panel.locator("summary").click();
  for (const group of report.display_groups) {
    const marks = panel.locator(`[data-smooth-group="${group.key}"]`);
    await expect(marks).toHaveCount(3);
    for (let i=0;i<group.points.length;i++) await expect(marks.nth(i)).toHaveAttribute("data-successes", String(group.points[i].successes));
  }
  if (!report.completion.final_test_opened) {
    await expect(panel.locator('[data-smooth-group="test"]')).toHaveCount(0);
    await expect(panel).toContainText("final test was not opened");
  }
  await panel.screenshot({path:testInfo.outputPath("smooth-teacher.png")});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
