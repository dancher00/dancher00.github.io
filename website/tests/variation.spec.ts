import { expect, test } from "@playwright/test";

test("task variation includes three floor environments and two cabin tasks and wrapping navigation", async ({ page }, testInfo) => {
  await page.goto("/?view=explore#task-variation");
  const gallery = page.locator("#task-variation");
  await expect(gallery.getByRole("heading", { name: "Task-level variation" })).toBeVisible();
  for (const [index, name] of ["Appearance", "Geometry", "Placement", "Environment", "Cabins"].entries()) {
    await expect(gallery.getByRole("group", { name: `${name}, ${index + 1} of 5` })).toBeVisible();
    const images = gallery.locator("img");
    await expect(images).toHaveCount(name === "Environment" ? 3 : name === "Cabins" ? 2 : 4);
    if (name === "Environment") {
      for (const caption of ["Pool · manipulation walls", "Sandy seabed · submarine hatch", "Sunken ship interior · chest"])
        await expect(gallery.locator("figcaption").filter({ hasText: caption })).toBeVisible();
      await expect(gallery).toContainText("normal scenes and training retain their default floors");
      await expect(gallery).toContainText("BlueROV2 + Alpha 5 at standoff");
      for (const img of await images.all())
        await expect(img).toHaveAttribute("alt", /BlueROV2 with folded Alpha 5/);
    }
    if (name === "Cabins") {
      for (const caption of ["Sunken cabin · recover the HDD", "Cargo hold · cut the retaining rope"]) await expect(gallery.getByText(caption, {exact: true})).toBeVisible();
    }
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBe(name === "Cabins" ? 1280 : 960);
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.naturalHeight)).toBe(name === "Cabins" ? 720 : 960);
    }
    await gallery.screenshot({ path: testInfo.outputPath(`${name.toLowerCase()}.png`) });
    await gallery.getByRole("button", { name: "Next variation panel" }).click();
  }
  await expect(gallery.getByText("Press Button · 1 / 5")).toBeVisible();
  await gallery.getByRole("button", { name: "Previous variation panel" }).click();
  await expect(gallery.getByText("HDD recovery · rope cutting · 5 / 5")).toBeVisible();
  await gallery.getByRole("button", { name: "Next variation panel" }).focus();
  await page.keyboard.press("Enter");
  await expect(gallery.getByText("Press Button · 1 / 5")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("pool overview explains the existing environment without adding a fourth setting", async ({ page }, testInfo) => {
  await page.goto("/?view=explore#task-variation");
  const gallery = page.locator("#task-variation");
  await gallery.getByRole("button", { name: "Previous variation panel" }).click();
  await gallery.getByRole("button", { name: "Previous variation panel" }).click();
  await expect(gallery.locator(".variation-row > figure")).toHaveCount(3);
  await expect(gallery.locator("img")).toHaveCount(3);
  await gallery.locator(".pool-overview summary").click();
  const overview = gallery.locator(".pool-overview");
  await expect(overview).toHaveAttribute("open", "");
  await expect(overview).toContainText("25 × 25 m interior · 2.5 m water depth");
  await expect(overview).toContainText("not a certified competition facility");
  await expect(overview).toContainText("not a free-surface fluid solver");
  await expect(overview.getByRole("link", { name: "World Aquatics · February 2026 ↗" })).toHaveAttribute("href", /2026-02-18_World-Aquatics_CR-Final\.pdf$/);
  await expect.poll(() => overview.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(960);
  await expect(gallery.locator(".variation-row > figure")).toHaveCount(3);
  await overview.screenshot({ path: testInfo.outputPath("pool-overview.png") });
  await overview.locator("summary").click();
  await expect(gallery.locator("img")).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
