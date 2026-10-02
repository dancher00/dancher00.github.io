import { useEffect, useState } from "react";
import { CinemaPlayer } from "./CinemaPlayer";
import { ProjectedEffects, type EffectAnnotations } from "./ProjectedEffects";

type ModeId = "current" | "seabed" | "wall" | "actuator";
type Variant = { id: string; label: string; video: string; poster: string; trace: string; duration_s: number; fps: number; sha256: string; caption: string; telemetry_offset_s?: number; scene?: Scene; inset_video?: string; inset_sha256?: string; inset_label?: string; annotations_schema_version?: number; hemisphere_radius_m?: number; delta_semantics?: string; disabled?: { video: string; poster: string; trace: string; sha256: string } };
type Mode = { id: ModeId; variants: Variant[] };
type Scene = { kind: string; dimensions?: { length_m: number; width_m: number; water_depth_m: number }; water_density_kg_m3: number; free_surface_dynamics?: boolean; fluid?: string };
type Frame = {
  t_s: number;
  base_position_w_m: number[];
  target_position_w_m: number[];
  boundary_gain: number[];
  current_w_m_s: number[];
  panel_pose_xyzw?: number[];
  annotations?: EffectAnnotations;
  inset_annotations?: EffectAnnotations;
  allocator_saturation_scale?: number;
  controller_force_at_limit?: boolean[];
  boundary_displacement_m?: number;
};
const descriptions: Record<ModeId, { label: string; axis: string; explanation: string; guide: string }> = {
  current: { label: "Current", axis: "Water velocity", explanation: "Same controller above sand, from still water to a current it cannot hold. Flow changes relative-water drag; available thrust and controller limits bound station keeping.", guide: "The inset is a synchronized external camera. Coral follows the measured gripper; yellow marks its initial position, not a commanded target. Water arrows span one second, not a force or enlarged displacement." },
  seabed: { label: "Pool-floor effect", axis: "Commanded base height", explanation: "Two height holds with optional rear-jet loss. Jets directed towards the pool floor can lose thrust near it; this is not drone ground-effect lift.", guide: "Coral dashed: target base height. White dashed: actual. Yellow: normal floor clearances of the four vertical motors, not exhaust rays or forces. Tracking error is in millimetres." },
  wall: { label: "Near-wall effect", axis: "Wall standoff", explanation: "Two holds beside the actual pool wall, with no manipulation panel. Only exhaust jets intersecting a nearby surface receive the optional thrust-loss correction.", guide: "Coral dashed: target base standoff. White dashed: actual. Yellow: normal wall clearances of the four horizontal motors, not exhaust rays. Standoff uses the base-link reference point; no wall-attraction force is added." },
  actuator: { label: "Actuator response", axis: "Motor model", explanation: "Same height step, two T200 response settings. Static limits and deadband stay the same; only command delay and RPM lag change.", guide: "Both actual height traces follow the recording clock. The 80 ms lag is an assumption, not a hardware-identified response." },
};
const order: ModeId[] = ["current", "seabed", "wall", "actuator"];
const media = (url: string, hash: string) => `${url}?v=${hash.slice(0, 12)}`;

// Last measured sample not later than this video frame; never interpolate a
// made-up robot trajectory, and never present a future sample as current.
function atTime(frames: Frame[], time: number) {
  let low = 0, high = frames.length;
  while (low < high) { const mid = (low + high) >> 1; if (frames[mid].t_s <= time + 1e-6) low = mid + 1; else high = mid; }
  return frames[Math.max(0, low - 1)];
}
function wallDistance(frame: Frame, position: number[]) {
  const panel = frame.panel_pose_xyzw;
  if (!panel || panel.length < 7) return null;
  const [x, y, z, w] = panel.slice(3);
  // Rotated panel-local +X normal, XYZW (native half-thickness .04m).
  const axis = [1 - 2 * (y * y + z * z), 2 * (x * y + w * z), 2 * (x * z - w * y)];
  return panel.slice(0, 3).reduce((sum, value, i) => sum + (value - position[i]) * axis[i], 0) - 0.04;
}

function XYInset({ frames, time }: { frames: Frame[]; time: number }) {
  const origin = frames[0].target_position_w_m;
  const relative = frames.map((f) => [f.base_position_w_m[0] - origin[0], f.base_position_w_m[1] - origin[1]]);
  const extent = Math.max(0.03, ...relative.flat().map(Math.abs)) * 1.2;
  const x = (v: number) => 95 + v / extent * 68;
  const y = (v: number) => 89 - v / extent * 48;
  const visible = frames.filter((f) => f.t_s <= time + 1e-6);
  const current = atTime(frames, time).base_position_w_m;
  return <div className="effects-xy-inset">
    <svg viewBox="0 0 190 155" role="img" aria-label="Measured XY trajectory, not a camera">
      <text x="10" y="17">XY TRACE · NOT A CAMERA</text>
      <path d="M27 89H163 M95 41V137" className="xy-grid" />
      <text x="157" y="84">X</text><text x="100" y="46">Y</text>
      <polyline points={visible.map((f) => `${x(f.base_position_w_m[0] - origin[0])},${y(f.base_position_w_m[1] - origin[1])}`).join(" ")} className="xy-path" />
      <path d="M90 84L100 94 M100 84L90 94" className="xy-target" />
      <circle cx={x(current[0] - origin[0])} cy={y(current[1] - origin[1])} r="3" className="xy-position" />
      <text x="10" y="149">±{(extent * 100).toFixed(1)} cm / target origin</text>
    </svg>
  </div>;
}

function HeightChart({ mode, traces, time, duration }: { mode: Mode; traces: Record<string, Frame[]>; time: number; duration: number }) {
  const all = mode.variants.flatMap((v) => traces[v.id] ?? []);
  if (!all.length) return null;
  const heights = all.flatMap((f) => [f.base_position_w_m[2], f.target_position_w_m[2]]);
  const min = Math.floor((Math.min(...heights) - 0.025) * 100) / 100;
  const max = Math.ceil((Math.max(...heights) + 0.025) * 100) / 100;
  const x = (t: number) => 58 + Math.min(t, duration) / duration * 410;
  const y = (h: number) => 215 - (h - min) / (max - min) * 160;
  const reference = traces[mode.variants[0].id] ?? [];
  return <div className="effects-height-chart">
    <svg viewBox="0 0 500 281" role="img" aria-label="Measured height tracking, synchronized with robot recording">
      <text x="58" y="24" className="chart-heading">RECORDED HEIGHT TRACKING</text>
      <text x="58" y="44">Base height / m</text>
      {[min, (min + max) / 2, max].map((v) => <g key={v}><line x1="58" x2="468" y1={y(v)} y2={y(v)} className="height-grid" /><text x="48" y={y(v) + 4} textAnchor="end">{v.toFixed(2)}</text></g>)}
      {[0, duration / 2, duration].map((v) => <text x={x(v)} y="236" key={v} textAnchor="middle">{v.toFixed(0)} s</text>)}
      <polyline className="height-reference" points={reference.filter((f) => f.t_s <= time + 1e-6).map((f) => `${x(f.t_s)},${y(f.target_position_w_m[2])}`).join(" ")} />
      {mode.variants.map((variant, i) => <polyline key={variant.id} className={`height-actual curve-${i}`} points={(traces[variant.id] ?? []).filter((f) => f.t_s <= time + 1e-6).map((f) => `${x(f.t_s)},${y(f.base_position_w_m[2])}`).join(" ")} />)}
      <line x1={x(time)} x2={x(time)} y1="55" y2="215" className="height-playhead" />
      <text x="58" y="262">Dashed: commanded height · t={time.toFixed(2)} s</text>
    </svg>
    <div className="height-legend">{mode.variants.map((v, i) => <span key={v.id} className={`curve-${i}`}>{v.label}</span>)}</div>
  </div>;
}

function Recording({ mode, variant }: { mode: Mode; variant: Variant }) {
  const [time, setTime] = useState(0);
  const [traces, setTraces] = useState<Record<string, Frame[]>>({});
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    // Only the actuator chart compares two complete recordings. Projected
    // camera histories can be large: don't download hidden current variants.
    const needed = mode.id === "actuator" ? mode.variants : [variant];
    Promise.all(needed.map(async (v) => {
      const response = await fetch(media(v.trace, v.sha256));
      if (!response.ok) throw new Error("Missing recorded telemetry");
      const data = await response.json();
      const frames = Array.isArray(data) ? data : data.frames ?? data.trace;
      if (!Array.isArray(frames) || !frames.length) throw new Error("Empty recorded telemetry");
      return [v.id, frames] as const;
    })).then((entries) => { if (active) setTraces(Object.fromEntries(entries)); }).catch(() => { if (active) setError("Recorded measurements are unavailable; no live annotations are inferred."); });
    return () => { active = false; };
  }, [mode, variant]);
  const frames = traces[variant.id];
  const clock = Math.min(time + (variant.telemetry_offset_s ?? 0), frames?.at(-1)?.t_s ?? Infinity);
  const frame = frames ? atTime(frames, clock) : undefined;
  const cameraStreams = variant.inset_video ? [{ id: "flow-external", label: variant.inset_label ?? "External top view", src: variant.inset_video, sha256: variant.inset_sha256, kind: "external" as const, aspectRatio: 4 / 3, overlay: frame?.inset_annotations ? <ProjectedEffects annotations={frame.inset_annotations} time={frame.t_s} showToolTrajectory /> : undefined }] : [];
  const actual = frame && (frame.annotations?.measured_distance?.value_m ?? (mode.id === "wall" ? wallDistance(frame, frame.base_position_w_m) : frame.base_position_w_m[2]));
  const target = frame && (frame.annotations?.commanded_distance?.value_m ?? (mode.id === "wall" ? wallDistance(frame, frame.target_position_w_m) : frame.target_position_w_m[2]));
  return <div className={`effects-film-stage mode-${mode.id} ${mode.id === "actuator" ? "with-height-chart" : ""}`}>
    <div className="effects-robot-film">
      <CinemaPlayer compact src={media(variant.video, variant.sha256)} poster={media(variant.poster, variant.sha256)} label={`${descriptions[mode.id].label}: ${variant.label} simulation demo`} caption="WasserMan · RECORDED SIMULATION" onTimeChange={setTime} cameraStreams={cameraStreams} overlay={<>
      {frame?.annotations && <ProjectedEffects annotations={frame.annotations} time={frame.t_s} deltaBadgeAtTop={mode.id === "wall"} showToolTrajectory={mode.id === "current"} motorIndices={mode.id === "seabed" ? [4, 5, 6, 7] : mode.id === "wall" ? [0, 1, 2, 3] : undefined} />}
      {frame && <div className={`effects-live-hud${mode.id === "current" ? " current-measurements" : ""}`} aria-label="Recorded measurements" data-recorded-time={frame.t_s}>
        {mode.id === "current" ? <><span>WATER X / {frame.current_w_m_s[0].toFixed(2)} m/s</span><strong>XY error / {(Math.hypot(frame.base_position_w_m[0] - frame.target_position_w_m[0], frame.base_position_w_m[1] - frame.target_position_w_m[1]) * 1000).toFixed(1)} mm</strong>{frame.allocator_saturation_scale != null && <span className={frame.allocator_saturation_scale < .999 ? "effects-authority-limited" : ""}>Allocator scale / {(frame.allocator_saturation_scale * 100).toFixed(1)}%{frame.allocator_saturation_scale < .999 ? " · thrust limited" : ""}{frame.controller_force_at_limit?.some(Boolean) ? " · controller capped" : ""}</span>}</> : <>
          <span>{mode.id === "wall" ? (frame.annotations ? "POOL-WALL STANDOFF" : "FRONT-FACE STANDOFF") : "BASE HEIGHT"} / m</span>
          <strong>Target {target?.toFixed(3)} · actual {actual?.toFixed(3)}</strong>
          <span>Δ {actual != null && target != null ? ((actual - target) * 1000).toFixed(1) : "—"} mm</span>
        </>}
      </div>}
      {mode.id === "current" && !variant.inset_video && frames && <XYInset frames={frames} time={clock} />}
      </>} />
    </div>
    {mode.id === "actuator" && <HeightChart mode={mode} traces={traces} time={clock} duration={variant.duration_s} />}
    {error && <p className="effects-trace-error" role="status">{error}</p>}
  </div>;
}

export function EffectsDemos() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [scene, setScene] = useState<Scene>();
  const [selected, setSelected] = useState<ModeId>("current");
  const [index, setIndex] = useState(0);
  const [boundaryEnabled, setBoundaryEnabled] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    fetch("./static/effects/manifest.json", { signal: abort.signal }).then(r => {
      if (!r.ok) throw new Error("Unavailable recordings");
      return r.json();
    }).then(data => { if (!data?.modes?.length) throw new Error("Missing recordings"); setModes(data.modes); setScene(data.scene); })
      .catch(() => { if (!abort.signal.aborted) setLoadError(true); });
    return () => abort.abort();
  }, []);
  const mode = modes.find((m) => m.id === selected);
  const variant = mode?.variants[index] ?? mode?.variants[0];
  const displayedVariant = variant?.disabled && !boundaryEnabled ? { ...variant, ...variant.disabled } : variant;
  const recordedScene = variant?.scene ?? scene;
  const legacy = !!variant && !variant.scene;
  const axialGuides = variant?.annotations_schema_version === 2;
  const matchedProximity = !!variant?.delta_semantics;
  const legacyGuides: Record<ModeId, string> = {
    current: "The inset is a measured XY path, not a camera. Cyan marks the robot; the cross marks its commanded hold.",
    seabed: "Target and actual are base heights, not motor clearances. This earlier recording has no projected distance guides.",
    wall: "Standoff uses the base-link reference point and the standalone panel's front face, not the pool wall.",
    actuator: descriptions.actuator.guide,
  };
  const copy = {
    ...descriptions[selected],
    ...(legacy ? { guide: legacyGuides[selected] } : {}),
    ...(selected === "current" && !variant?.inset_video ? { explanation: "Same controller, two water speeds above sand. Flow changes relative-water drag; eight mounted T200 thrusters hold the vehicle.", guide: "Arrows show water velocity over one second, not force. This earlier inset is a measured XY path, not a camera; the cross marks the commanded hold." } : {}),
    ...((selected === "seabed" || selected === "wall") && axialGuides ? { guide: `Coral dashed: target ${selected === "wall" ? "base standoff" : "base height"}. White dashed: actual. Yellow rays follow native motor axes to the ${selected === "wall" ? "pool wall" : "floor"}; hemispheres are 45 mm schematic markers, not a jet footprint or interaction radius. Axis guides are not signed exhaust or force.` } : {}),
    ...(matchedProximity ? { axis: selected === "seabed" ? "Initial base height" : "Initial base standoff", explanation: selected === "seabed" ? "Explore how proximity to the pool floor changes the robot’s thrust response. Enable the optional effect and choose a distance." : "Explore the robot’s response beside a pool wall. Enable the optional effect and choose a distance.", guide: "Yellow guides follow the propeller axes. Coral marks the commanded position; white follows the robot. Δ shows the measured position error." } : {}),
    ...(selected === "current" && recordedScene?.kind !== "sand" ? { explanation: "Same controller, two water speeds. Flow changes relative-water drag; eight mounted T200 thrusters hold the vehicle." } : {}),
    ...(selected === "wall" && legacy ? { axis: "Panel placement", explanation: "Earlier holds beside a standalone finite panel. Only exhaust jets intersecting a nearby face receive the optional thrust-loss correction." } : {}),
  };
  const select = (id: ModeId) => {
    setSelected(id);
    const nearIndex = modes.find((entry) => entry.id === id)?.variants.findIndex((entry) => entry.id.endsWith("-near")) ?? -1;
    setIndex(Math.max(0, nearIndex));
    setBoundaryEnabled(false);
  };
  return <div className="effects-demo-explorer" id="effects-robot-demos">
    <div className="effects-demo-tabs" role="tablist" aria-label="Robot physical-effect demonstrations">
      {order.map((id, i) => <button key={id} id={`effects-demo-tab-${id}`} role="tab" aria-selected={selected === id} aria-controls="effects-demo-panel" tabIndex={selected === id ? 0 : -1} onClick={() => select(id)} onKeyDown={(event) => {
        const movement = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
        if (!movement && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? 3 : (i + movement + 4) % 4;
        select(order[next]); document.getElementById(`effects-demo-tab-${order[next]}`)?.focus();
      }}><span>{String(i + 1).padStart(2, "0")}</span><strong>{descriptions[id].label}</strong></button>)}
    </div>
    <div id="effects-demo-panel" role="tabpanel" aria-labelledby={`effects-demo-tab-${selected}`} className={`effects-demo-workbench ${selected === "actuator" ? "actuator-demo-workbench" : ""}`}>
      {mode && displayedVariant ? <Recording key={`${displayedVariant.id}-${displayedVariant.sha256}`} mode={mode} variant={displayedVariant} /> : <p className="effects-capture-status" role="status">{loadError ? "Recordings could not load. Reload the page to try again." : "Loading simulation recordings…"}</p>}
      <div className="effects-demo-evidence">
        {legacy && <p className="effects-demo-legacy" role="status">Earlier recording. The scene metadata below describes this clip and its available annotations.</p>}
        <p>{copy.explanation}</p><p className="effects-demo-guide">{copy.guide}</p>
        {variant?.disabled && <div className="effects-optional-control"><button type="button" role="switch" aria-checked={boundaryEnabled} aria-label={`Enable ${selected === "seabed" ? "pool-floor" : "near-wall"} effect`} onClick={() => setBoundaryEnabled((value) => !value)}><span className="effect-switch-track" aria-hidden="true"><span /></span>Enable {selected === "seabed" ? "pool-floor" : "near-wall"} effect</button><small>Optional · disabled by default</small></div>}
        {!!mode?.variants.length && <div className="effects-demo-variants" role="group" aria-label={copy.axis}><span>{copy.axis}</span><div>{mode.variants.map((v, i) => <button key={v.id} aria-pressed={v.id === variant?.id} onClick={() => setIndex(i)}>{v.label}</button>)}</div></div>}
        <details className="effects-demo-technical"><summary>Model details & recorded data</summary>
          {variant && <p className="effects-demo-finding">{variant.caption}</p>}
          <p className="effects-demo-limit">Recorded simulator demonstrations, not a learned-policy result or hardware calibration. Floor and wall effects use an optional, uncalibrated thrust-loss approximation, disabled by default in the simulator. These proximity recordings replay motor commands without feedback compensation; at 3 s the command requests a 12 cm move away. The 18 mm hemispheres are schematic markers, not jet footprints.</p>
          {displayedVariant && <a href={media(displayedVariant.trace, displayedVariant.sha256)} download>Recorded telemetry ↓</a>}
        </details>
      </div>
    </div>
    {recordedScene && <div className="effects-scene-note" aria-label="Recorded simulation scene">
      <span>{recordedScene.kind === "pool" && recordedScene.dimensions ? `${recordedScene.dimensions.length_m} × ${recordedScene.dimensions.width_m} m pool · ${recordedScene.dimensions.water_depth_m} m water depth` : "Sandy seabed"} · ρ = {recordedScene.water_density_kg_m3} kg/m³</span>
      <small>{[recordedScene.fluid, recordedScene.free_surface_dynamics === false ? "No free-surface fluid solver." : undefined].filter(Boolean).join(". ")}</small>
    </div>}
  </div>;
}
