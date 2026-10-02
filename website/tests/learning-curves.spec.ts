import { test, expect } from "@playwright/test";

test("verified curve data replaces endpoint charts with budget and milestone curves", async ({ page }) => {
  // Browser-only synthetic fixture: never written to the public benchmark data.
  const points=["ACT","DP"].flatMap((model,m)=>[25,50,100].map((budget_percent,i)=>({model,budget_percent,success_percent:(i+m)*25,subtask_percent:(i+m)*25+10,successes:0,episodes:30,success_ci95:[0,100]})));
  await page.route("**/static/hatch-learning-curve.json",route=>route.fulfill({json:{complete:true,points,note:"Test fixture"}}));
  await page.goto("/?view=explore#results");
  await page.locator("#results .model-study > summary").click();
  await page.getByRole("button",{name:"Learning progress",exact:true}).click();
  await expect(page.locator("#results")).toContainText("Learning progress on OpenHatch");
  await expect(page.locator(".learning-curve-point")).toHaveCount(12);
  for(const p of points) {
    const mark=page.locator(`.learning-curve-point[data-model="${p.model}"][data-budget="${p.budget_percent}"][data-metric="success_percent"]`);
    await expect(mark).toHaveAttribute("data-value",String(p.success_percent));
    await expect(mark.locator("circle")).toHaveAttribute("cx",String(40+p.budget_percent*2.6));
  }
  await expect(page.locator("#results")).toContainText("Relative budgets are not equal compute");
});
