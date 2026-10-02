/** Render the website's existing projected geometry into transparent video layers. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium } from '@playwright/test';

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(website, '..');
const destination = process.argv[2];
const ffmpeg = process.argv[3];
if (!destination || !ffmpeg) throw new Error('Usage: node scripts/render-overview-overlays.mjs OUTPUT_DIR FFMPEG');
const output = path.resolve(destination);
await mkdir(output, { recursive: true });
const bundle = path.join(website, '.publication/annotation-renderer');
await build({ configFile: false, plugins: [react()], build: { lib: { entry: path.join(website, 'src/ProjectedEffects.tsx'), formats: ['es'], fileName: 'geometry' }, outDir: bundle, rolldownOptions: { external: ['react', 'react/jsx-runtime'] } } });
const { ProjectedEffects } = await import(pathToFileURL(path.join(bundle, 'geometry.mjs')));
const css = await readFile(path.join(website, 'src/styles.css'), 'utf8');
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m => /\.(?:effects-projected-geometry|projected-|gripper-|water-arrow-head)/.test(m[1])).map(m => m[0]).join('\n');
const font = (await readFile(path.join(website, 'src/assets/fonts/dm-mono-400-latin.woff2'))).toString('base64');
const manifest = JSON.parse(await readFile(path.join(website, 'public/static/effects/manifest.json'), 'utf8'));
const storyboard = JSON.parse(await readFile(path.join(website, 'overview-storyboard.json'), 'utf8'));
const durations = Object.fromEntries(storyboard.clips.filter(c => ['current','proximity','actuators'].includes(c.layout)).map(c => [c.layout, c.duration]));
const rows = [];
const browser = await chromium.launch({ headless: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const modes = manifest.modes;
try {
 for (const mode of modes) {
  for (const variant of mode.variants) {
   const source = path.join(website, 'public', variant.video.replace(/^\.\//, ''));
   const trace = path.join(website, 'public', variant.trace.replace(/^\.\//, ''));
   const bytes = await readFile(trace);
   const frames = JSON.parse(bytes).frames;
   const duration = durations[mode.id === 'wall' || mode.id === 'seabed' ? 'proximity' : mode.id === 'actuator' ? 'actuators' : 'current'];
   const nativeViewport = frames[0].annotations.viewport_px;
   const [width, height] = mode.id === 'current' ? [576,324] : mode.id === 'actuator' ? [896,504] : [704,396];
   const folder = path.join(output, variant.id);
   await mkdir(folder, { recursive: true });
   const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
   await page.setContent(`<style>@font-face{font-family:'DM Mono';src:url(data:font/woff2;base64,${font}) format('woff2')} :root{--mono:'DM Mono',monospace} html,body{margin:0;width:100%;height:100%;background:transparent} ${rules}</style><div id="overlay"></div>`);
   await page.evaluate(() => document.fonts.load('24px "DM Mono"'));
   let cursor = 0;
   for (let index = 0; index < duration * 30; index++) {
    const time = index / 30 + (variant.telemetry_offset_s ?? 0);
    while (cursor + 1 < frames.length && frames[cursor + 1].t_s <= time + 1e-6) cursor++;
    const frame = frames[cursor];
    if (!frame.annotations || frame.t_s > time + 1e-6) throw new Error('Missing or future camera projection');
    const markup = renderToStaticMarkup(React.createElement(ProjectedEffects, {
     annotations: frame.annotations, time: frame.t_s, showToolTrajectory: mode.id === 'current',
     deltaBadgeAtTop: mode.id === 'wall', motorIndices: mode.id === 'wall' ? [0,1,2,3] : mode.id === 'seabed' ? [4,5,6,7] : undefined,
    }));
    await page.evaluate(markup => { document.getElementById('overlay').innerHTML = markup; }, markup);
    await page.screenshot({ path: path.join(folder, `${String(index).padStart(5, '0')}.png`), omitBackground: true, animations: 'disabled' });
   }
   await page.close();
   const movie = path.join(output, variant.id + '.mov');
   const result = spawnSync(ffmpeg, ['-y','-loglevel','error','-framerate','30','-i',path.join(folder,'%05d.png'),'-c:v','qtrle','-pix_fmt','argb',movie], { stdio:'inherit' });
   if (result.status !== 0) throw new Error('Overlay movie encoding failed');
   rows.push({ id: variant.id, mode: mode.id, source: variant.video, source_sha256: hash(await readFile(source)), trace: variant.trace, trace_sha256: hash(bytes), movie: path.basename(movie), movie_sha256: hash(await readFile(movie)), frames: duration * 30, width, height, native_viewport: nativeViewport, duration, telemetry_offset_s: variant.telemetry_offset_s ?? 0 });
   console.log('Rendered recorded website annotations:', variant.id);
  }
 }
} finally { await browser.close(); }
const report = { component: 'website/src/ProjectedEffects.tsx', component_sha256: hash(await readFile(path.join(website,'src/ProjectedEffects.tsx'))), stylesheet_sha256: hash(await readFile(path.join(website,'src/styles.css'))), scope: 'Unmodified website SVG geometry and styles, from measured camera projections. Each video frame uses the recorded post-step telemetry clock. No fabricated paths.', rows };
await writeFile(path.join(output,'annotations-manifest.json'), JSON.stringify(report,null,2)+'\n');
console.log('Completed', rows.length, 'measured geometry layers');
