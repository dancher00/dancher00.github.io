import { readFile, readdir, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const publication = JSON.parse(await readFile(path.join(root, "publication.json"), "utf8"));
const navigation = JSON.parse(await readFile(path.join(root, "src/docsNavigation.json"), "utf8"));
const html = await readFile(path.join(dist, "index.html"), "utf8");
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(name => name.startsWith("./assets/") || name === "./theme-init.js");
if (!references.length || html.includes("__SITE_")) throw new Error("Missing built assets or unresolved metadata");
const totals = { html: Buffer.byteLength(html), css: 0, javascript: 0, initialGzip: gzipSync(html).byteLength };
for (const reference of references) {
  const data = await readFile(path.join(dist, reference));
  if (reference.endsWith(".css")) totals.css += data.byteLength;
  if (reference.endsWith(".js")) totals.javascript += data.byteLength;
  totals.initialGzip += gzipSync(data).byteLength;
}
const budgets = { html: 20_000, css: 80_000, javascript: 300_000, initialGzip: 115_000 };
for (const [name, limit] of Object.entries(budgets)) {
  if (totals[name] > limit) throw new Error(`${name} budget exceeded: ${totals[name]} > ${limit}`);
}
for (const guide of navigation) {
  const target = path.join(dist, "docs", guide.id === "index" ? "" : guide.id, "index.html");
  const content = await readFile(target, "utf8");
  if (!content.includes("<h1")) throw new Error(`Static guide has no heading: ${guide.id}`);
}
const files = await readdir(dist, { recursive: true });
if (files.some(name => name.endsWith(".pdf"))) throw new Error("Unpublished manuscript must not be distributed");
let bytes = 0;
for (const name of files) {
  const file = path.join(dist, name);
  if ((await stat(file)).isFile()) bytes += (await stat(file)).size;
}
if (bytes >= 950_000_000) throw new Error(`Pages budget exceeded: ${bytes} bytes`);
const required = [".nojekyll", "robots.txt", "sitemap.xml", "social-preview.png", "theme-init.js", "static/wasserman-logo.png", "static/wasserman-logo-dark.svg",
  "media-manifest.json"];
for (const name of required) if (!(await stat(path.join(dist, name))).size && name !== ".nojekyll") throw new Error(`Empty publication asset: ${name}`);
if (!html.includes(`href="${publication.site_url}"`)) throw new Error("Incorrect canonical project URL");
console.log(JSON.stringify({ initial: totals, budgets, staticGuides: navigation.length, pagesBytes: bytes }, null, 2));
