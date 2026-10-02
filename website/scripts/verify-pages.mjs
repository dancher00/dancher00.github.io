import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const publication = JSON.parse(readFileSync(new URL("../publication.json", import.meta.url), "utf8"));
const overview = JSON.parse(readFileSync(new URL("../src/overviewVideo.json", import.meta.url), "utf8"));
const prefix = new URL(publication.site_url).pathname;
const server = await preview({ configFile: false, root, base: "/", build: { outDir: ".publication/pages" }, preview: { host: "127.0.0.1", port: 0 } });
let browser;
try {
  const base = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(base + "/");
  await page.waitForURL(base + prefix);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), publication.site_url);
  assert.equal(await page.locator("#tasks").count(), 1);
  for (const asset of ["social-preview.png", "media-manifest.json", overview.src.replace(/^\.\//, "")]) {
    const response = await page.request.head(base + prefix + asset);
    assert.equal(response.status(), 200, "Missing nested publication asset: " + asset);
  }
  await page.goto(base + prefix + "docs/installation/");
  assert.match(await page.locator("article h1").innerText(), /Installation/);
  assert.equal(await page.locator('img').evaluateAll(images => images.filter(image => image.complete && !image.naturalWidth).length), 0);
  assert.deepEqual(errors, []);
  console.log("Account Pages redirect, /wasserman/, documentation and media passed");
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()));
}
