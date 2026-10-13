import { expect, test } from "@playwright/test";

test("visual transfer controls and downloads agree with every paired episode", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/#new-experiments");
  const section = page.locator("#visual-transfer");
  await expect(section.getByRole("heading", { name: "Transfer across visual conditions", exact: true })).toBeVisible();
  const csvHref = await section.getByRole("link", { name: /Results & per-training-seed rates/ }).getAttribute("href");
  const auditHref = await section.getByRole("link", { name: /Paired episode outcomes/ }).getAttribute("href");
  const csvResponse = await page.request.get(csvHref!);
  const auditResponse = await page.request.get(auditHref!);
  expect(csvResponse.ok()).toBe(true);
  expect(auditResponse.ok()).toBe(true);
  const lines = (await csvResponse.text()).trim().split(/\r?\n/);
  const keys = lines.shift()!.split(",");
  const csv = lines.map(line => Object.fromEntries(line.split(",").map((value, index) => [keys[index], value])));
  const audit = await auditResponse.json();
  expect(csv).toHaveLength(24);
  expect(audit.rows).toHaveLength(72);
  expect(audit.rows.reduce((sum: number, row: { episodes: number }) => sum + row.episodes, 0)).toBe(2160);
  const conditionNames: Record<string, string> = {
    "native-light1.0": "Native", "clear-light1.0": "Clear", "coastal-light1.0": "Coastal",
    "harbor-light1.0": "Harbor", "native-light0.5": "Dim · 0.5×", "native-light1.5": "Bright · 1.5×",
  };
  await section.locator(".study-numbers > summary").click();
  for (const [task, name] of [["RotateValve", "Rotate valve"], ["OpenHatch", "Open hatch"]]) {
    await section.getByRole("button", { name, exact: true }).click();
    for (const implementation of ["ACT", "DP"]) {
      await section.getByRole("button", { name: implementation, exact: true }).click();
      await expect(section.getByRole("heading", { name: `${name} · ${implementation}`, exact: true })).toBeVisible();
      const rows = csv.filter(row => row.task === task && row.implementation === implementation);
      await expect(section.locator("tbody tr")).toHaveCount(6);
      for (const row of rows) {
        const outcomes = audit.rows.filter((r: { task: string; variant: string; condition: string }) => r.task === task && r.variant === implementation && r.condition === row.condition);
        expect(outcomes).toHaveLength(3);
        const successes = outcomes.reduce((sum: number, r: { success_per_seed: boolean[] }) => sum + r.success_per_seed.filter(Boolean).length, 0);
        expect(Number(row.completion_percent)).toBeCloseTo(successes / 90 * 100, 10);
        let pairedChange = 0;
        for (const r of outcomes) {
          const native = audit.rows.find((n: { task: string; variant: string; training_seed: number; condition: string }) => n.task === task && n.variant === implementation && n.training_seed === r.training_seed && n.condition === "native-light1.0");
          expect(r.reset_seeds).toEqual(native.reset_seeds);
          expect(r.physical_evidence.physical_contract_replayed).toBe(true);
          expect(r.episodes).toBe(30);
          pairedChange += r.successes - native.successes;
        }
        expect(Number(row.paired_change_pp)).toBeCloseTo(pairedChange / 90 * 100, 10);
        const displayed = section.getByRole("row", { name: new RegExp(`^${conditionNames[row.condition].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} `) });
        await expect(displayed.locator("td").first()).toHaveText(Number(row.completion_percent).toFixed(1));
      }
    }
  }
  await expect(section.getByRole("link", { name: /OpenHatch demonstrations/ })).toHaveAttribute("href", /WasserMan-Review-v3\/tree\/main\/diverse-demonstrations\/OpenHatch$/);
  await expect(section.getByRole("link", { name: /Observation history & demonstration mixture/ })).toHaveAttribute("href", /WasserMan-Review-v3\/tree\/main\/models$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator("#visual-transfer")).toHaveCount(1);
  await expect(page.locator("#visual-transfer-title")).toHaveCount(1);
  await section.screenshot({ path: testInfo.outputPath("visual-transfer.png") });
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await section.screenshot({ path: testInfo.outputPath("visual-transfer-dark.png") });
  expect(errors).toEqual([]);
});
