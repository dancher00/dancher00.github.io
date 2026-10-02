import { docsHref } from "./publicationLinks";
import { useEffect, useRef, useState } from "react";
import "./articulated-study.css";
import "./bimanual-study.css";

type Mode = "free" | "support" | "two-hands";
type Sample = { time_s: number; angle_mean_deg: number; angle_low_deg: number; angle_high_deg: number; base_attitude_mean_deg: number; base_displacement_mean_mm: number; motor_utilization_mean: number };
type Film = { video: string; poster: string; duration_s: number; contact_intervals: { side: "left" | "right"; start_s: number; end_s: number }[] };
type Phase = { samples: number; base_attitude_rms_deg: number };
export type BimanualReport = { complete: boolean; evaluation_split: string; note: string; contact_note: string; modes: { mode: Mode; label: string; successes: number; episodes: number; series: Sample[]; per_seed: { phases: Partial<Record<"turn1" | "turn2", Phase>> }[] }[]; media?: Partial<Record<Mode, Film>> };
export function useBimanualStudy() {
  const [report, setReport] = useState<BimanualReport | null>(null);
  useEffect(() => {
    const abort = new AbortController();
    async function read() {
      try {
        const response = await fetch("./static/bimanual-valve/summary.json", { signal: abort.signal });
        if (!response.ok) return;
        const data: BimanualReport = await response.json();
        const modes: Mode[] = ["free", "support", "two-hands"];
        if (data.complete && data.evaluation_split === "final" && data.modes?.length === 3 && modes.every(mode => {
          const row = data.modes.find(m => m.mode === mode);
          return row?.episodes === 30 && row.series.length > 1 && data.media?.[mode]?.video;
        })) setReport(data);
      } catch { /* Incomplete or unavailable evidence is not a published result. */ }
    }
    void read();
    return () => abort.abort();
  }, []);
  return report;
}
const modeStyles: Record<Mode, { color: string; dash?: string; border: "solid" | "dashed" | "dotted"; label: string; description: string }> = {
  free: { color: "var(--chart-first, #163e52)", border: "solid", label: "One hand", description: "Right turns the valve; left stays clear." },
  support: { color: "var(--chart-second, #087fbd)", dash: "9 5", border: "dashed", label: "One hand + support", description: "Right turns; left holds the fixed rail." },
  "two-hands": { color: "#188b9b", dash: "2 4", border: "dotted", label: "Two hands on valve", description: "Both hands turn the wheel." },
};
function ModeLegend({ detailed = false }: { detailed?: boolean }) {
  return <ul className={`bimanual-legend${detailed ? " bimanual-legend-detailed" : ""}`} aria-label="Line styles and hand roles">
    {(Object.keys(modeStyles) as Mode[]).map(mode => { const style = modeStyles[mode]; return <li key={mode}>
      <span className="bimanual-line-key" aria-hidden="true" style={{ borderTopColor: style.color, borderTopStyle: style.border }} />
      <span><strong>{style.label}</strong>{detailed && <small>{style.description}</small>}</span>
    </li>; })}
  </ul>;
}
const metrics = [
  { key: "angle_mean_deg", label: "Valve rotation", unit: "°", scale: 1, step: 45, explanation: "How far the wheel turns. The task succeeds at 170°. Shading spans the 10th–90th percentiles." },
  { key: "base_attitude_mean_deg", label: "Robot orientation error", unit: "°", scale: 1, step: 0, explanation: "Rotation away from the commanded base attitude. Lower values mean steadier orientation." },
  { key: "base_displacement_mean_mm", label: "Robot position error", unit: "mm", scale: 1, step: 0, explanation: "Distance from the commanded base position. Lower values mean less drift." },
  { key: "motor_utilization_mean", label: "Thruster load", unit: "%", scale: 100, step: 20, explanation: "The most-loaded thruster in each reset, averaged. 100% is its 1540 N force limit." },
] as const;

export function BimanualValveStudy({ report, showDemos = true }: { report: BimanualReport; showDemos?: boolean }) {
  const [mode, setMode] = useState<Mode>("two-hands");
  const [time, setTime] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  if (!report.complete || report.evaluation_split !== "final") return null;
  const film = showDemos ? report.media?.[mode] : undefined;
  const turning = report.modes.map(m => {
    const values = m.per_seed.flatMap(episode => {
      const phases = [episode.phases.turn1, episode.phases.turn2].filter((phase): phase is Phase => !!phase);
      const samples = phases.reduce((total, phase) => total + phase.samples, 0);
      return samples ? [Math.sqrt(phases.reduce((total, phase) => total + phase.samples * phase.base_attitude_rms_deg ** 2, 0) / samples)] : [];
    });
    return { ...m, turningRms: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null, observed: values.length };
  });
  const duration = Math.max(...report.modes.flatMap(m => m.series.map(p => p.time_s)));
  const seek = (seconds: number) => {
    if (video.current && film) {
      const next = Math.max(0, Math.min(film.duration_s - .05, seconds));
      video.current.currentTime = next; setTime(next);
    }
  };
  return <section className="bimanual-study" aria-label="Bimanual valve comparison">
    <p className="research-insight">Two-handed turning reduces mean base motion.</p>
    <p className="research-context">Custom twin-Oberon Rex · calm water · paired initial base offsets · physical contact with a passive 506 mm wheel. Scripted experts compare a parked arm, a support grasp and cooperative turning.</p>
    <ModeLegend detailed />
    <p className="research-context">Task success: {report.modes.map(m => `${modeStyles[m.mode].label} ${m.successes}/${m.episodes}`).join(" · ")}</p>
    {film && <figure className="bimanual-film">
      <div className="research-switches" role="group" aria-label="Bimanual demonstration">{report.modes.filter(m => report.media?.[m.mode]).map(m => <button key={m.mode} aria-pressed={mode === m.mode} onClick={() => { setMode(m.mode); setTime(0); }}>{modeStyles[m.mode].label}</button>)}</div>
      <p className="bimanual-hand-role">{modeStyles[mode].description}</p>
      <video key={mode} ref={video} src={film.video} poster={film.poster} controls muted playsInline preload="metadata" onTimeUpdate={() => setTime(video.current?.currentTime ?? 0)} aria-label={`${report.modes.find(m => m.mode === mode)?.label}: real-time physical recording`} />
      <svg className="bimanual-contact" viewBox="0 0 860 140" role="img" tabIndex={0} aria-label="Measured opposing-finger contact in the demonstration: left and right hands. Select a time or use arrow keys to seek." onKeyDown={e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); seek(time + (e.key === "ArrowRight" ? 1 : -1)); } }} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width * 860 - 74) / 770 * film.duration_s); }}>
        {(["left", "right"] as const).map((side, row) => <g key={side}>
          <text x="68" y={32 + row * 40} textAnchor="end" className="plot-tick">{side === "left" ? "Left" : "Right"}</text>
          <rect x="74" y={14 + row * 40} width="770" height="22" fill="#edf2f5" />
          {film.contact_intervals.filter(i => i.side === side).map((i, index) => <rect key={index} x={74 + i.start_s / film.duration_s * 770} y={14 + row * 40} width={(i.end_s - i.start_s) / film.duration_s * 770} height="22" fill={row ? "var(--chart-second, #087fbd)" : "var(--chart-first, #163e52)"} />)}
        </g>)}
        <line x1={74 + time / film.duration_s * 770} x2={74 + time / film.duration_s * 770} y1="9" y2="84" stroke="#26a4b8" strokeWidth="2" />
        <text x="74" y="119" className="plot-tick">Opposing-finger contact</text>
        <text x="844" y="119" textAnchor="end" className="plot-tick">{time.toFixed(1)} s</text>
      </svg>
      <figcaption className="research-context">Complete trajectory · separate reset 91003 · rendered in the standard pool, in real time, without audio or overlays. Contact lanes use this trajectory; gaps indicate no opposing-finger contact. The plots aggregate the benchmark resets.</figcaption>
    </figure>}
    <div className="bimanual-turning" aria-label="Base orientation during turning">{turning.map(m => <div key={m.mode} style={{ borderColor: modeStyles[m.mode].color, borderTopStyle: modeStyles[m.mode].border }} data-turning-mode={m.mode} data-turning-rms={m.turningRms ?? undefined}>
      <span>{modeStyles[m.mode].label}</span><strong>{m.turningRms === null ? "—" : `${m.turningRms.toFixed(3)}°`}</strong><small>Mean episode RMS · {m.observed} resets</small>
    </div>)}</div>
    <p className="research-context">Base orientation error during the two turning phases. RMS is computed within each episode, then averaged across resets. The full trajectories below include initial settling, regrasp and release.</p>
    <div className="articulated-plots">{metrics.map(metric => {
      const values = report.modes.flatMap(m => m.series.flatMap(p => metric.key === "angle_mean_deg" ? [p.angle_low_deg, p.angle_high_deg] : [p[metric.key] * metric.scale]));
      const maximum = Math.max(...values, 1e-6);
      const order = 10 ** Math.floor(Math.log10(maximum / 4));
      const step = metric.step || ([1, 2, 5, 10].find(n => n * order >= maximum / 4)! * order);
      const angle = metric.key === "angle_mean_deg";
      const lo = angle ? Math.min(0, Math.floor(Math.min(...values))) - 2 : Math.min(0, Math.floor(Math.min(...values) / step) * step);
      const hi = angle ? Math.max(180, Math.ceil(maximum)) + 5 : Math.max(step, Math.ceil(maximum / step) * step);
      const ticks = angle ? [0, 45, 90, 135, 180] : Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
      const x = (t: number) => 54 + t / duration * 346;
      const y = (v: number) => 238 - (v - lo) / (hi - lo) * 178;
      return <figure key={metric.key} className="bimanual-chart">
        <figcaption><h3>{metric.label} <span>({metric.unit})</span></h3><p>{metric.explanation}</p></figcaption>
        <ModeLegend />
        <svg className="research-plot" viewBox="0 38 430 260" role="img" aria-label={`${metric.label}, ${metric.unit}; means over paired resets`} tabIndex={film ? 0 : undefined} onKeyDown={e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); seek(time + (e.key === "ArrowRight" ? 1 : -1)); } }} onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width * 430 - 54) / 346 * duration); }}>
        {ticks.map(value => <g key={value}><line x1="54" x2="400" y1={y(value)} y2={y(value)} stroke="#dfe4e7" /><text x="44" y={y(value) + 4} textAnchor="end" className="plot-tick">{Number(value.toPrecision(3))}</text></g>)}
        {metric.key === "angle_mean_deg" && <><line x1="54" x2="400" y1={y(170)} y2={y(170)} stroke="#697e89" strokeDasharray="4 4" /><text x="58" y={y(170) - 7} className="plot-tick">170° success threshold</text></>}
        {report.modes.map(m => <g key={m.mode}>
          {metric.key === "angle_mean_deg" && <polygon points={[...m.series.map(p => `${x(p.time_s)},${y(p.angle_low_deg)}`), ...m.series.slice().reverse().map(p => `${x(p.time_s)},${y(p.angle_high_deg)}`)].join(" ")} fill={modeStyles[m.mode].color} opacity=".08" />}
          <polyline points={m.series.map(p => `${x(p.time_s)},${y(p[metric.key] * metric.scale)}`).join(" ")} fill="none" stroke={modeStyles[m.mode].color} strokeWidth="3" strokeLinecap="round" strokeDasharray={modeStyles[m.mode].dash} />
        </g>)}
        {film && <line x1={x(time)} x2={x(time)} y1="48" y2="238" stroke="#9aaeb9" strokeDasharray="2 3" />}
        {[0, .25, .5, .75, 1].map(f => <text key={f} x={x(duration * f)} y="261" textAnchor="middle" className="plot-tick">{Math.round(duration * f)}</text>)}
        <text x="227" y="286" textAnchor="middle" className="plot-tick">Time (s)</text>
      </svg></figure>;
    })}</div>
    <p className="research-context">{report.contact_note} Shading shows the 10th–90th percentiles across paired resets. Motor utilization uses the most-loaded native motor in each episode. Select a curve or use arrow keys to inspect the corresponding time in the demonstration.</p>
    <FastTurnStudy showDemos={showDemos} />
    <details><summary>Fixture, controller and evidence</summary><p>{report.note}</p><p>The pool and textured wall are presentation geometry. Videos reconstruct recorded physical states; adding the pool does not rerun dynamics or change success. Rotor animation follows motor forces at a reduced visual speed; physical RPM is not represented. The textured steel support preserves the recorded grasp surface; its mounting hardware is cosmetic.</p><p><a href={docsHref("studies/bimanual-valve-v1-reproduction")}>Reproduction guide</a> · <a href={docsHref("studies/bimanual-coordinate-audit")}>Coordinate-precision audit amendment</a></p><a href="https://github.com/dancher00/wasserman/blob/main/benchmarks/bimanual-valve-v1/summary.json">Results and provenance ↗</a></details>
  </section>;
}

type FastReport = { seed: number; modes: { mode: Mode; peak_orientation_error_deg: number; maximum_valve_rotation_deg: number; peak_thruster_load_percent: number; joint_limit_audit_passed: boolean; max_joint_limit_excess_rad: number; video: string; poster: string; series: { time_s: number; orientation_error_deg: number }[] }[] };
function FastTurnStudy({ showDemos }: { showDemos: boolean }) {
  const [report, setReport] = useState<FastReport | null>(null);
  const [mode, setMode] = useState<Mode>("free");
  useEffect(() => {
    const abort = new AbortController();
    void fetch("./static/bimanual-fast-turn/summary.json", { signal: abort.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.modes?.length === 3) setReport(data); }).catch(() => {});
    return () => abort.abort();
  }, []);
  const row = report?.modes.find(m => m.mode === mode);
  if (!report || !row) return null;
  return <section className="bimanual-fast" aria-label="Rapid valve command demonstration">
    <p className="research-kicker">Stress demonstration · one matched reset</p>
    <h3>A faster command exposes coordination limits.</h3>
    <p className="research-context">A 90° turn is requested at 1.4 rad/s, 20× the benchmark command speed. The robot, valve friction, arm limits and station keeper are unchanged. All three modes use reset {report.seed}. None overturns; holding the support produces the largest orientation error in this demonstration.</p>
    <div className="research-switches" role="group" aria-label="Rapid demonstration mode">{report.modes.map(m => <button key={m.mode} aria-pressed={mode === m.mode} onClick={() => setMode(m.mode)}>{modeStyles[m.mode].label}</button>)}</div>
    <p className="bimanual-hand-role">{modeStyles[mode].description}</p>
    {showDemos && <video key={mode} src={row.video} poster={row.poster} controls muted playsInline preload="metadata" aria-label={`${modeStyles[mode].label}: rapid command, complete 50-second recording`} />}
    <div className="bimanual-fast-metrics">
      <div><strong>{row.peak_orientation_error_deg.toFixed(2)}°</strong><span>Peak orientation error</span></div>
      <div><strong>{row.maximum_valve_rotation_deg.toFixed(1)}°</strong><span>Maximum wheel rotation</span></div>
      <div><strong>{row.peak_thruster_load_percent.toFixed(1)}%</strong><span>Peak thruster load</span></div>
    </div>
    <p className="research-context">Full 50-second recordings, real time, silent, without overlays. One illustrative state per mode; these are not success rates. The requested 90° turn is separate from the benchmark’s 170° task. The wide camera shows the entire robot in a 3 m deep presentation pool.</p>
    <p className="research-context bimanual-audit-note">Audit limitation: the two-hands run exceeds a joint limit by 0.135° (0.00236 rad), above the 0.002 rad tolerance. It is retained as a failure diagnostic, not a cleanly validated benchmark result. No self-collisions were detected in any mode.</p>
    <figure className="bimanual-chart bimanual-fast-chart">
      <figcaption><h3>Robot orientation error <span>(°)</span></h3><p>Actual rotation away from the commanded attitude. Same axes and initial state for all three modes.</p></figcaption>
      <ModeLegend />
      <svg viewBox="0 0 640 240" role="img" aria-label="Rapid command: robot orientation error over 50 seconds">
        {[0, 3, 6, 9, 12].map(value => <g key={value}><line x1="45" x2="618" y1={197-value/12*180} y2={197-value/12*180} stroke="#dfe4e7"/><text x="35" y={201-value/12*180} textAnchor="end" className="plot-tick">{value}</text></g>)}
        {report.modes.map(m => <polyline key={m.mode} points={m.series.map(p => `${45+p.time_s/50*573},${197-p.orientation_error_deg/12*180}`).join(" ")} fill="none" stroke={modeStyles[m.mode].color} strokeDasharray={modeStyles[m.mode].dash} strokeWidth="2.5"/>)}
        {[0,10,20,30,40,50].map(t => <text key={t} x={45+t/50*573} y="218" textAnchor="middle" className="plot-tick">{t}</text>)}
        <text x="332" y="239" textAnchor="middle" className="plot-tick">Time (s)</text>
      </svg>
    </figure>
    <a href="https://dancher00.github.io/wasserman/docs/studies/bimanual-valve-v1-reproduction/">Recordings, traces and audit ↗</a>
  </section>;
}
