import { useEffect, useState } from "react";

type Point = { t_s: number; position_delta_mm: number; removed_motor_thrust_n: number };
type Case = { seed: number; base_to_surface_m: number; max_position_delta_mm: number; max_net_force_delta_n: number; points: Point[] };
type Evidence = { calibrated: boolean; duration_s: number; step_onset_s: number; step_distance_m: number; modes: Record<"floor" | "wall", Case[]> };
const source = "./static/boundary_comparison_v1.json";
const range = (values: number[], digits: number) => `${Math.min(...values).toFixed(digits)}–${Math.max(...values).toFixed(digits)}`;

function DifferencePlot({ cases, field, title, step }: { cases: Case[]; field: "position_delta_mm" | "removed_motor_thrust_n"; title: string; step: number }) {
  const maximum = Math.max(1, Math.ceil(Math.max(...cases.flatMap((entry) => entry.points.map((point) => point[field])))));
  const x = (time: number) => 46 + time / 8 * 302;
  const y = (value: number) => 154 - value / maximum * 104;
  return <svg viewBox="0 0 370 199" role="img" aria-label={title} className={`boundary-difference-plot ${field}`}>
    <text x="46" y="18" className="boundary-plot-title">{title}</text>
    {[0, maximum / 2, maximum].map((value) => <g key={value}>
      <line className="boundary-plot-grid" x1="46" x2="348" y1={y(value)} y2={y(value)} />
      <text x="37" y={y(value) + 3} textAnchor="end">{value.toFixed(value % 1 ? 1 : 0)}</text>
    </g>)}
    <line className="boundary-step-guide" x1={x(step)} x2={x(step)} y1="42" y2="154" />
    <text x={x(step) + 5} y="38">12 cm step away</text>
    <line className="boundary-off-reference" x1="46" x2="348" y1="154" y2="154" />
    {cases.map((entry, index) => <polyline key={entry.seed} className="boundary-on-curve" data-seed={entry.seed} opacity={.4 + index * .3} vectorEffect="non-scaling-stroke" points={entry.points.map((point) => `${x(point.t_s)},${y(point[field])}`).join(" ")} />)}
    {[0, 4, 8].map((time) => <text key={time} x={x(time)} y="172" textAnchor="middle">{time} s</text>)}
    <text x="46" y="193">Independent experiment clock · full 8 s</text>
  </svg>;
}

export function MatchedBoundaryEvidence({ mode }: { mode: "seabed" | "wall" }) {
  const [data, setData] = useState<Evidence>();
  useEffect(() => {
    let active = true;
    fetch(source).then((response) => response.ok ? response.json() : null).then((value) => {
      if (active && value?.schema_version === 1 && value.calibrated === false) setData(value);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const cases = data?.modes[mode === "seabed" ? "floor" : "wall"];
  if (!data || !cases?.length) return null;
  return <section className="matched-boundary-evidence" aria-label="Independent matched boundary ON/OFF evidence" data-synchronized-with-video="false">
    <div className="boundary-evidence-intro">
      <div><span className="boundary-evidence-kicker">Independent ON / OFF experiment</span><h4>What does the correction change?</h4></div>
      <p>Same start, controller and 12 cm command. Only the boundary-loss model changes. These archived traces are <strong>not the video above</strong> and do not move with its player.</p>
    </div>
    <div className="boundary-evidence-metrics">
      <p><strong>{range(cases.map((entry) => entry.max_position_delta_mm), 1)} mm</strong><span>Peak ON–OFF position separation</span></p>
      <p><strong>{range(cases.map((entry) => entry.max_net_force_delta_n), 2)} N</strong><span>Peak net thrust correction · 120 Hz</span></p>
      <p><strong>{cases[0].base_to_surface_m.toFixed(2)} m</strong><span>Initial commanded base {mode === "wall" ? "standoff" : "height"} · not collider gap</span></p>
    </div>
    <div className="boundary-evidence-plots">
      <DifferencePlot cases={cases} field="position_delta_mm" title="ON–OFF position separation / mm" step={data.step_onset_s} />
      <DifferencePlot cases={cases} field="removed_motor_thrust_n" title="Removed motor thrust / N" step={data.step_onset_s} />
    </div>
    <p className="boundary-evidence-legend"><span>Solid: three measured seeds, 2058 / 2059 / 2060.</span><span>Dashed zero: no correction.</span></p>
    <p className="boundary-evidence-note">Curves use 30 Hz samples. Removed thrust is the sum of individual motor-force reductions, not a net vehicle force. Feedback largely compensates, so position changes stay small. Uncalibrated sensitivity test, not CFD or a hardware result. <a href={source} download>Data and source hashes ↓</a></p>
  </section>;
}
