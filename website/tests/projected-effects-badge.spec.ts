import { expect, test } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";

let server: ViteDevServer;
test.afterEach(async () => { await server?.close(); });

test("delta badge retains tracking default and distinguishes explicit measured pair differences", async ({ page }, testInfo) => {
  // Synthetic geometry is confined to the intercepted test page; no media or
  // production trace is modified to manufacture a tracking/replay result.
  const segment = { start_px: [100, 200], end_px: [1250, 200], valid: true };
  const annotations = { schema_version: 2, viewport_px: [1280, 720], rotor_rays: [], commanded_line: [], measured_line: [segment], current_arrows: [], commanded_distance: { ...segment, value_m: .65 }, measured_distance: { ...segment, value_m: .6 } };
  const source = `
    import React from 'react';
    import {createRoot} from 'react-dom/client';
    import {ProjectedEffects} from '/src/ProjectedEffects.tsx';
    const annotations=${JSON.stringify(annotations)};
    const cases=[['tracking',{}],['pair',{deltaMm:12.3,deltaLabel:'Δ ON−OFF',deltaBadgeAtTop:true}],['zero',{deltaMm:0,deltaLabel:'Δ ON−OFF',deltaBadgeAtTop:true}],['missing',{deltaMm:null}],['invalid',{deltaMm:NaN}]];
    createRoot(document.getElementById('root')).render(React.createElement('div',null,...cases.map(([id,props])=>React.createElement('div',{id,style:{position:'relative',width:'100%',aspectRatio:'16/9',background:'#063e50'}},React.createElement(ProjectedEffects,{annotations,time:4,...props})))));
  `;
  server = await createServer({ server: { host: "127.0.0.1", port: 0, strictPort: false }, plugins: [{
    name: "test-only-projected-badge",
    resolveId(id) { if (id === "/__badge_test_entry__.js") return id; },
    load(id) { if (id === "/__badge_test_entry__.js") return source; },
  }] });
  await server.listen();
  const address = server.httpServer!.address();
  if (!address || typeof address === "string") throw new Error("Missing test server port");
  const html = await server.transformIndexHtml("/__badge_test__", `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/src/styles.css"></head><body><div id="root"></div><script type="module" src="/__badge_test_entry__.js"></script></body></html>`);
  await page.route("**/__badge_test__", (route) => route.fulfill({ contentType: "text/html", body: html }));
  await page.goto(`http://127.0.0.1:${address.port}/__badge_test__`);
  await expect(page.locator("#tracking .projected-error-badge text")).toHaveText("Δ -50.0 mm");
  await expect(page.locator("#tracking .projected-error-badge rect")).toHaveAttribute("width", "212");
  await expect(page.locator("#pair .projected-error-badge text")).toHaveText("Δ ON−OFF +12.3 mm");
  await expect(page.locator("#zero .projected-error-badge text")).toHaveText("Δ ON−OFF +0.0 mm");
  await expect(page.locator("#missing .projected-error-badge")).toHaveCount(0);
  await expect(page.locator("#invalid .projected-error-badge")).toHaveCount(0);
  const badge = page.locator("#pair .projected-error-badge");
  const box = await badge.evaluate((element: SVGGraphicsElement) => {
    const text = element.querySelector("text")!.getBBox();
    const rect = element.querySelector("rect")!.getBBox();
    return { textRight: text.x + text.width, width: rect.width };
  });
  expect(box.width).toBeGreaterThan(212);
  expect(box.textRight).toBeLessThan(box.width);
  await expect(badge).toHaveAttribute("transform", "translate(947 100)");
  await expect(page.locator("#tracking .projected-error-badge")).toHaveAttribute("transform", "translate(1052 184)");
  await page.locator("#pair").screenshot({ path: testInfo.outputPath("pair-delta-badge.png") });
});
