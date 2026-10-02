import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(website, "..");
const python = process.env.WM_SITE_PYTHON ?? "python3";
const zensical = process.env.WM_SITE_ZENSICAL ?? "zensical";
const env = { ...process.env, WM_SITE_STATIC_DOCS: "1" };
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run("npm", ["run", "build"], website);
run(python, ["scripts/prepare_website.py", "docs"]);
run(zensical, ["build", "--strict", "-f", "website/mkdocs.yml"]);
run(python, ["scripts/prepare_website.py", "finalize"]);
run("node", ["scripts/verify-build.mjs"], website);
