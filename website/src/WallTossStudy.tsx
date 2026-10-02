import { docsHref } from "./publicationLinks";
import { useState } from "react";
import { CinemaPlayer } from "./CinemaPlayer";
import evidence from "../public/static/wall-toss-v2/comparison.json";

const cameras = { overview: "External", base: "Base", wrist: "Gripper" };
export function WallTossStudy() {
  const [camera, setCamera] = useState<keyof typeof cameras>("overview");
  const [time, setTime] = useState(0);
  const x = (t: number) => 55 + t / 10.8 * 475;
  const y = (v: number) => 200 - (v + 0.05) / 0.55 * 155;
  return <section className="wall-toss-study" id="wall-toss-study" aria-label="Wall Toss paired current demonstration">
    <p className="eyebrow">Dynamic delivery · one matched initial state</p>
    <h3>The same throw, a different landing</h3>
    <p>A capsule passes through the wall in still water. A 0.2 m/s cross-current carries it into the aperture edge. All 324 high-level commands match; low-level station keeping stays active.</p>
    <div className="selected-camera-controls" aria-label="Wall Toss comparison camera">
      {Object.entries(cameras).map(([id, name]) => <button key={id} aria-pressed={camera === id} onClick={() => { setCamera(id as keyof typeof cameras); setTime(0); }}>{name}</button>)}
    </div>
    <div className="wall-toss-layout">
      <div>
        <CinemaPlayer key={camera} compact src={`./static/wall-toss-v2/calm/${camera}.mp4`}
          poster={`./static/wall-toss-v2/calm/${camera}.png`} label={`Wall Toss still water · ${cameras[camera]}`}
          onTimeChange={setTime} cameraStreams={[{id:"current", label:"Cross-current · 0.2 m/s", kind:"comparison", aspectRatio:camera === "overview" ? 1.5 : 1, src:`./static/wall-toss-v2/current/${camera}.mp4`}]} />
        <p className="media-note">Main: still water · inset: cross-current. Full 10.8 s recordings, synchronized, real time and silent.</p>
      </div>
      <div className="wall-toss-measurements">
        <div className="wall-toss-outcomes"><p><strong>Passage</strong><span>Still water · success at 7.80 s</span></p><p><strong>Rim strike</strong><span>Cross-current · no complete crossing</span></p></div>
        <svg viewBox="0 0 560 255" role="img" aria-label="Measured capsule lateral position over episode time: still water and cross-current">
          <text x="55" y="22">Capsule lateral position / cm</text>
          {[0, .2, .4].map(v => <g key={v}><line x1="55" x2="530" y1={y(v)} y2={y(v)} stroke="#d8e5ec"/><text x="43" y={y(v)+4} textAnchor="end">{v*100}</text></g>)}
          {[0, 3, 6, 9, 10.8].map(t => <text key={t} x={x(t)} y="221" textAnchor="middle">{t}</text>)}
          {(["calm", "current"] as const).map((id, i) => <polyline key={id} fill="none" stroke={i ? "#64b5d8" : "#075b99"} strokeWidth="3" strokeDasharray={i ? "8 5" : undefined} points={evidence.cases[id].trace.map(f => `${x(f.t)},${y(f.p[1])}`).join(" ")}/>)}
          <line x1={x(time)} x2={x(time)} y1="40" y2="200" stroke="#657c89" strokeDasharray="2 3"/>
          <text x="295" y="246" textAnchor="middle">Episode time / s</text>
        </svg>
        <div className="wall-toss-legend"><span>━ Still water</span><span>┄ Cross-current · +Y 0.2 m/s</span></div>
        <p>Measured simulator trajectories; one pair, no estimated success rate. This task has no ACT/DP evaluation.</p>
      </div>
    </div>
    <details><summary>Task contract, physical model and evidence</summary>
      <p>The 50 mm, 100 g capsule starts between the fingers. Success requires intentional release above 0.25 m/s, over 10 cm of free travel, full passage and 10 contact-free control frames beyond the wall. Base stand-off must be at least 0.70 m at release and first full crossing; full-trajectory minima are 0.671 / 0.670 m.</p>
      <p>Gravity, buoyancy, drag and 33.543 g sphere added mass are modeled at 480 Hz. The current affects both robot and capsule. No receiver or object attachment is present. Sphere/plate/sand checks pass the 0.5 mm penetration tolerance; this is not a complete robot collision audit or physical-water validation.</p>
      <p><a href="./static/wall-toss-v2/">Original paired viewer ↗</a>{" · "}<a href={docsHref("wall-toss")}>Protocol and reproduction ↗</a>{" · "}<a href="./static/wall-toss-v2/comparison.json" download>Recorded trajectories ↓</a></p>
    </details>
  </section>;
}
