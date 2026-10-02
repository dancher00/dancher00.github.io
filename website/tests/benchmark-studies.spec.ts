import { expect, test } from "@playwright/test";

test("research disclosure and plots follow verified evidence", async ({ page, request }, testInfo) => {
  await page.goto("/?view=explore#results");
  const results = page.locator("#results");
  await expect(results.locator(".model-study")).not.toHaveAttribute("open");
  await results.locator(".model-study > summary").click();
  const data = await (await request.get("/static/model-benchmarks.json")).json();
  await expect(results.getByRole("tab", { name: /High-level policies/ })).toHaveAttribute("aria-selected", "true");
  for (const metric of ["Task success", "Completion time"]) {
    await results.getByRole("button", {name:metric,exact:true}).click();
    for (const row of data.rows.filter((r: {model: string})=>r.model!=="PPO")) {
      const marks=results.locator(`.research-data-point[data-task="${row.task}"][data-model="${row.model}"]`);
      const value=metric === "Task success" ? 100*row.successes/row.episodes : row.median_success_time_s;
      if(value === null)await expect(marks).toHaveCount(0);
      else expect(Number(await marks.getAttribute("data-value"))).toBeCloseTo(value,5);
    }
  }
  await results.getByRole("button", {name:"ACT fine-tuning",exact:true}).click();
  const correction = await (await request.get("/static/hatch-act-correction.json")).json();
  if (correction.complete) {
    if (await results.locator(".act-correction").getAttribute("open") === null) await results.locator(".act-correction > summary").click();
    for (const [i, row] of correction.final.entries()) {
      await expect(results.locator(`[data-correction-model="${i}"]`)).toHaveAttribute("data-successes", String(row.successes));
    }
    await expect(results.locator(".act-correction")).toContainText("No expert acts during policy evaluation");
  }
  await results.getByRole("button", {name:"Task suite",exact:true}).click();
  await expect(results.locator("video")).toHaveCount(0);
  await results.screenshot({path:testInfo.outputPath("results-amb-layout.png"),style:"#root > header, .site-header, .skip-link {visibility:hidden !important}"});
  await results.getByRole("tab",{name:/Policy × control/}).click();
  const control = await (await request.get("/static/policy-control-study.json")).json();
  if (control.complete) {
    await expect(results.getByRole("tabpanel")).toContainText("One frozen diffusion policy");
    for (const c of control.configurations) {
      const point = results.locator(`[data-controller="${c.controller}"][data-metric="success"]`);
      expect(Number(await point.getAttribute("data-value"))).toBeCloseTo(c.success_percent);
    }
  } else await expect(results.getByRole("tabpanel")).toContainText("has not been completed");
  await results.getByRole("tab",{name:/Embodiments/}).click();
  const embodiment = await (await request.get("/static/embodiment-study.json")).json();
  if (embodiment.complete) {
    await expect(results.getByRole("tabpanel")).toContainText("scripted EE control with moving arms");
    await expect(results.locator(".articulated-plots svg")).toHaveCount(4);
    await expect(results.locator(".articulated-study .research-legend")).toContainText("30/30");
    await expect(results.locator("video")).toHaveCount(0);
    await results.getByRole("button", {name:"Held arm (v1)", exact:true}).click();
    await expect(results.getByRole("tabpanel")).toContainText("held arm-joint targets");
    for (const r of embodiment.robots) await expect(results.locator(`[data-robot="${r.robot}"]`).first()).toHaveAttribute("data-successes",String(r.successes));
  } else {
    await expect(results.getByRole("tabpanel")).toContainText("has not been run yet");
    await expect(results.getByRole("tabpanel").locator("svg")).toHaveCount(0);
  }
  await results.getByRole("tab",{name:/Embodiments/}).press("Home");
  await expect(results.getByRole("tab",{name:/High-level policies/})).toBeFocused();
  await expect(results.getByRole("group", {name:"Policy study"}).getByRole("button")).toHaveCount(6);
  await expect(results.getByTestId("pulllever-correction")).toHaveCount(0);
  await expect(results.getByTestId("position-correction")).toHaveCount(0);
  await expect(results.getByTestId("smooth-teacher-study")).toHaveCount(0);
  await results.getByRole("link", {name:"Additional studies and diagnostics ↗"}).click();
  await expect(page.getByRole("heading", {name:"Research appendix",exact:true})).toBeVisible();
  await expect(page.locator("#state-ppo")).toContainText("959 of 1,024");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
