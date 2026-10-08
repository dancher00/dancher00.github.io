import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const publication = JSON.parse(readFileSync(new URL("../publication.json", import.meta.url), "utf8"));
const navigation = JSON.parse(readFileSync(new URL("../src/docsNavigation.json", import.meta.url), "utf8"));
test.skip(process.env.WM_SITE_TEST_PUBLICATION !== "1", "Requires the complete publication build");

test("project metadata, citation and first-run links work in the prepared site", async ({ page, context, isMobile }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", publication.site_url);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", publication.site_url + "social-preview.png");
  expect(await page.request.get("/social-preview.png").then(response => response.ok())).toBe(true);
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "{}");
  expect(schema.codeRepository).toBe(publication.repository_url);
  expect(schema.author).toBeUndefined();
  const footer = page.locator("footer");
  await expect(footer.locator("img")).toHaveAttribute("src", "./static/wasserman-logo.png");
  await expect(footer.getByRole("link", {name:"WasserMan on GitHub ↗"})).toHaveAttribute("href", publication.repository_url);
  await expect(footer).toContainText("Explore and reproduce");
  await expect(footer).toContainText("© 2026 WasserMan contributors");
  await expect(footer.getByRole("link", {name:"Apache 2.0 ↗"})).toHaveAttribute("href", publication.repository_url + "/blob/main/LICENSE");
  expect(await footer.locator("nav").evaluate(el => { const nav = el.getBoundingClientRect(), footer = el.closest("footer")!.getBoundingClientRect(); return nav.top >= footer.top && nav.bottom <= footer.bottom; })).toBe(true);
  await expect(page.locator("h1 br")).toHaveCount(0);
  expect(await page.locator("h1").evaluate(el => Math.abs(el.getBoundingClientRect().width - el.parentElement!.getBoundingClientRect().width))).toBeLessThan(1);
  if (isMobile) await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Docs ↗" })).toHaveAttribute("href", "./docs/");
  await page.screenshot({ path: testInfo.outputPath("project-home.png") });
  await page.locator("#citation").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Copy BibTeX", exact: true }).click();
  await expect(page.locator("#citation [role=status]")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(publication.citation);
  await expect(page.locator("#citation code")).toContainText("author = {Belov, Danil and Erkhov, Artem and Parsegov, Sergei and Osinenko, Pavel}");
  await expect(page.locator("#citation code")).toContainText("eprint = {2610.04536}");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('.landing-links a', { hasText: 'Dataset (HF)' })).toHaveAttribute('href', publication.dataset_url);
  await expect(page.locator('#get-started a', { hasText: 'Download expert trajectories' })).toHaveAttribute('href', publication.dataset_url);
  const guideLinks = page.locator("#get-started a[href^='./docs/']");
  await expect(guideLinks).toHaveCount(2);
  for (const href of await guideLinks.evaluateAll(links => links.map(link => link.getAttribute("href")!))) {
    await page.goto(href);
    await expect(page.locator("article h1")).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});

test("all static guides render and documentation search works", async ({ page }, testInfo) => {
  for (const guide of navigation) {
    const response = await page.goto(`/docs/${guide.id === "index" ? "" : guide.id + "/"}`);
    expect(response?.ok()).toBe(true);
    await expect(page.locator("article h1")).toHaveCount(1);
    expect(await page.locator('article a[href^="#"]').evaluateAll(links => links
      .map(link => decodeURIComponent(link.getAttribute("href")!.slice(1)))
      .filter(id => id && !document.getElementById(id)))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator("article img").evaluateAll(images => images.filter(image => (image as HTMLImageElement).complete && !(image as HTMLImageElement).naturalWidth).map(image => image.getAttribute("src")))).toEqual([]);
  }
  await page.goto("/docs/");
  const searchButton = page.locator(".md-search__button");
  if (await searchButton.isVisible()) await searchButton.click();
  else await page.locator('label[for="__search"]').first().click();
  const search = page.getByRole("combobox");
  await search.fill("installation");
  const result = page.locator('a[href*="/installation/?h="]').first();
  await expect(result).toContainText("Installation");
  await page.screenshot({ path: testInfo.outputPath("documentation-search.png") });
  await result.click();
  await expect(page.locator("article h1")).toContainText("Installation");
});

test("publication copies disclose source hashes and expert streams retain their complete timelines", async ({ page }) => {
  const response = await page.request.get("/media-manifest.json");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.total_bytes).toBeLessThan(950_000_000);
  expect(manifest.files["static/task-demos/cabin/overview.mp4"].method).toContain("full timeline");
  const sourceHashes = Object.values(manifest.files) as { source_sha256: string; web_sha256: string; method: string }[];
  expect(sourceHashes.filter(row => row.method === "byte-identical copy").every(row => row.source_sha256 === row.web_sha256)).toBe(true);
  await page.goto("/#tasks");
  await page.locator(".landing-task-group").nth(1).locator("summary").click();
  const film = page.locator(".landing-task-card").filter({has:page.getByRole("heading", {name:"Cabin recovery",exact:true})}).locator(".demo-external video");
  await film.evaluate((video: HTMLVideoElement) => video.load());
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
  expect(await film.evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(128);
  expect(await film.evaluate((video: HTMLVideoElement) => video.error)).toBeNull();
});
