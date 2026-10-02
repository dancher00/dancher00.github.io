import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
const navigation = JSON.parse(readFileSync(new URL("../src/docsNavigation.json", import.meta.url), "utf8"));
const hotstab = JSON.parse(readFileSync(new URL("../src/hotstabStudy.json", import.meta.url), "utf8"));

test("open-core evidence precedes clearly marked historical results", async ({ page }, testInfo) => {
  await page.goto("/?view=explore");
  await expect(page.locator("h1")).toContainText("Underwater Manipulation");
  await expect(page.locator(".hero")).toContainText("experiments complete");
  const core = page.locator("#open-core");
  await expect(core).toContainText("182 differed");
  await expect(core).toContainText("All 42 controller and 12 interface cohorts are complete");
  await expect(core.locator("tbody tr")).toHaveCount(6);
  await expect(core.getByRole("row", { name: /^CollectShell / })).toContainText("33.3 ± 12.0");
  await expect(core.getByRole("row", { name: /^PullLever / })).toContainText("40.0 ± 38.4");
  await expect(page.locator("#results h2")).toHaveText("Historical results");
  expect(await core.evaluate(el => Boolean(el.compareDocumentPosition(document.querySelector("#press-button-overview")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path: testInfo.outputPath("open-core-home.png")});
  await core.screenshot({path: testInfo.outputPath("open-core-evidence.png")});
});

test("documentation is navigable, searchable and uses portable commands", async ({ page, isMobile }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto("/?view=docs");
  await expect(page.getByRole("heading", {name:"WasserMan documentation",exact:true})).toBeVisible();
  if(isMobile)await page.getByRole("button",{name:"Browse documentation"}).click();
  await expect(page.getByRole("navigation",{name:"Documentation guides"}).getByRole("link")).toHaveCount(navigation.length);
  await page.getByRole("searchbox",{name:"Find a guide"}).fill("station-keeping");
  await expect(page.getByRole("navigation",{name:"Documentation guides"}).getByRole("link",{name:"Add a robot or controller"})).toBeVisible();
  await page.getByRole("navigation",{name:"Documentation guides"}).getByRole("link",{name:"Add a robot or controller"}).click();
  await expect(page.getByRole("heading",{name:"Add a robot or controller",exact:true})).toBeVisible();
  await page.goto("/?view=docs&page=installation");
  await expect(page.locator("#docs-content")).toContainText("git clone https://github.com/dancher00/wasserman.git");
  await expect(page.locator("#docs-content")).not.toContainText("/home/aida");
  await expect(page.getByRole("button",{name:"Copy command"}).first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("every documentation page renders with valid in-page links",async({page})=>{
  for(const guide of navigation){
    await page.goto(`/?view=docs&page=${guide.id}`);
    await expect(page.locator("#docs-content h1")).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
    expect(await page.locator('a[href^="#"]').evaluateAll(xs=>xs.map(a=>a.getAttribute('href')!.slice(1)).filter(id=>!document.getElementById(id)))).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test("HotStab stays separate and its chart counts match the frozen study",async({page})=>{
 await page.goto('/?view=explore#results');const r=page.locator('#results');await r.locator('.model-study > summary').click();await r.getByRole('button',{name:'HotStab',exact:true}).click();
 await expect(r).toContainText('Excluded from the six-task macro-average');
 for(const m of ['ACT','DP'] as const)await expect(r.locator(`.hotstab-study [data-model="${m}"]`)).toHaveAttribute('data-successes',String(hotstab.methods[m].successes));
 await expect(r.locator('video')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
