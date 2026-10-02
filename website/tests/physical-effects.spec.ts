import { expect, test } from "@playwright/test";

test("underwater effects expose real model curves and uncalibrated boundary assumptions", async ({ page, request }, testInfo) => {
  const data = await (await request.get("/static/physical_effects_sensitivity.json")).json();
  expect(data.default_enabled).toBe(false);
  expect(data.boundary_calibrated).toBe(false);
  expect(data.actuator_response_identified).toBe(false);
  await page.goto("/?view=explore#physical-effects");
  await page.getByText("Model equations and numerical sensitivity", { exact: true }).click();
  const section = page.locator("#physical-effects");
  const tabs = section.getByRole("group", { name: "Physical effect", exact: true });
  const lab = section.getByRole("article", { name: "Physical effects numerical experiment" });
  await tabs.getByRole("button", { name: "Currents", exact: true }).click();
  await expect(lab.getByRole("img")).toHaveCount(1);
  await expect(lab).toContainText("Moving with the water gives zero relative drag");
  for (const [name, kind] of [["Seabed proximity", "seabed"], ["Near-wall effect", "wall"]]) {
    await tabs.getByRole("button", { name, exact: true }).click();
    await expect(section.locator(".effect-panel")).toContainText("default OFF");
    await lab.getByRole("button", { name: "0.16 m", exact: true }).click();
    for (const reverse of [false, true]) {
      await lab.getByRole("button", { name: reverse ? "Reverse all motors" : "Reference thrust", exact: true }).click();
      const scenario = data.boundary_scenarios.find((s: { kind: string; clearance_m: number; reverse: boolean }) => s.kind === kind && s.clearance_m === 0.16 && s.reverse === reverse);
      for (let i = 0; i < 8; i++)
        await expect(lab.getByRole("meter", { name: `Motor ${i + 1} retained thrust`, exact: true })).toHaveAttribute("value", String(scenario.motor_gain[i]));
    }
    await lab.getByRole("button", { name: "1.00 m", exact: true }).click();
    for (const meter of await lab.getByRole("meter").all()) await expect(meter).toHaveAttribute("value", "1");
  }
  await tabs.getByRole("button", { name: "Actuator response", exact: true }).click();
  await expect(lab).toContainText("not hardware-identified");
  await expect(lab.getByRole("img")).toHaveCount(1);
  await expect(lab.locator("polyline")).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await lab.screenshot({ path: testInfo.outputPath("actuator-response.png"), style: "header, .skip-link { visibility:hidden !important; }" });
  await tabs.getByRole("button", { name: "Near-wall effect", exact: true }).click();
  await lab.getByRole("button", { name: "0.16 m", exact: true }).click();
  await lab.screenshot({ path: testInfo.outputPath("wall-response.png"), style: "header, .skip-link { visibility:hidden !important; }" });
});
