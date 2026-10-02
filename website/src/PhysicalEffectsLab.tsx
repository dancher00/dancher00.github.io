import { useState } from "react";
import data from "../fixtures/physical_effects_sensitivity.json";

function Curve({ series, xmin, xmax, ymin, ymax, xlabel, ylabel }: {
  series: { label: string; values: number[][]; color: string }[];
  xmin: number; xmax: number; ymin: number; ymax: number; xlabel: string; ylabel: string;
}) {
  const x = (v: number) => 62 + (v - xmin) / (xmax - xmin) * 650;
  const y = (v: number) => 210 - (v - ymin) / (ymax - ymin) * 165;
  return <div className="effect-chart">
    <svg viewBox="0 0 750 255" role="img" aria-label={`${ylabel} versus ${xlabel}, measured numerical model response`}>
      <text x="62" y="22">{ylabel}</text>
      {[ymin, 0, ymax].map((v, i) => <g key={i}><line x1="62" x2="712" y1={y(v)} y2={y(v)} className="chart-grid" /><text x="50" y={y(v) + 4} textAnchor="end">{v}</text></g>)}
      {[xmin, (xmin + xmax) / 2, xmax].map((v) => <text key={v} x={x(v)} y="232" textAnchor="middle">{v}</text>)}
      <text x="712" y="252" textAnchor="end">{xlabel}</text>
      {series.map((s) => <polyline key={s.label} points={s.values.map(([vx, vy]) => `${x(vx)},${y(vy)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2.5" />)}
    </svg>
    <div className="effect-legend">{series.map((s) => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}</div>
  </div>;
}

export function PhysicalEffectsLab({ effect }: { effect: string }) {
  const [clearance, setClearance] = useState(0.16);
  const [reverse, setReverse] = useState(false);
  const boundary = effect === "Seabed proximity" || effect === "Near-wall effect";
  if (!boundary && effect !== "Currents" && effect !== "Actuator response") return null;
  const kind = effect === "Seabed proximity" ? "seabed" : "wall";
  const scenario = data.boundary_scenarios.find((s) => s.kind === kind && s.clearance_m === clearance && s.reverse === reverse)!;
  return <article className="effects-lab" aria-label="Physical effects numerical experiment">
    <div className="variation-heading"><h3>Inspect the model response.</h3><span>CPU sensitivity · not a rollout</span></div>
    {boundary ? <>
      <div className="optics-options" role="group" aria-label="Boundary clearance">
        {[0.08, 0.16, 0.32, 0.64, 1].map((v) => <button key={v} aria-pressed={clearance === v} onClick={() => setClearance(v)}>{v.toFixed(2)} m</button>)}
      </div>
      <div className="optics-options" role="group" aria-label="Thrust direction">
        <button aria-pressed={!reverse} onClick={() => setReverse(false)}>Reference thrust</button>
        <button aria-pressed={reverse} onClick={() => setReverse(true)}>Reverse all motors</button>
      </div>
      <p>Retained axial thrust at each native T200 mount. 10 N per motor; reference vertical thrust is upward. Clearance is measured from the nearest rotor centre to the {kind === "seabed" ? "seabed" : "finite panel face"}.</p>
      <div className="motor-gains" aria-label="Per-motor retained thrust">
        {scenario.motor_gain.map((gain, i) => <div key={i}><span>T{i + 1} / {i < 4 ? "angled" : "vertical"}</span><meter min="0" max="1" value={gain} aria-label={`Motor ${i + 1} retained thrust`} /><strong>{(gain * 100).toFixed(1)}%</strong></div>)}
      </div>
      <p className="effect-measured">Force change [X Y Z]: {scenario.after_wrench.slice(0, 3).map((v, i) => (v - scenario.before_wrench[i]).toFixed(2)).join(" / ")} N<br />Moment change [roll pitch yaw]: {scenario.after_wrench.slice(3).map((v, i) => (v - scenario.before_wrench[i + 3]).toFixed(3)).join(" / ")} N·m</p>
      <p className="variation-note">A downstream-jet loss hypothesis, not aerial lift augmentation. Exhaust follows actual signed thrust, including reverse. Finite panel bounds and orientation are respected; the nearest downstream surface is used once. No inlet blockage, hull suction, sediment resuspension or CFD. Seabed transfer is an additional unvalidated assumption.</p>
    </> : effect === "Currents" ? <>
      <Curve xmin={-0.3} xmax={0.3} ymin={-3} ymax={3} xlabel="Current X velocity / m·s⁻¹" ylabel="Stationary base drag / N" series={[{ label: "Native base surge damping", color: "#0a7185", values: data.current.map((p) => [p.velocity_m_s, p.stationary_base_surge_n]) }]} />
      <p className="variation-note">Existing BlueROV base coefficients, stationary body; this plot isolates surge drag, not whole-robot load or policy tracking. Moving with the water gives zero relative drag. Uniform flow and bounded disturbances feed the existing per-link 6-DOF model.</p>
    </> : <>
      <Curve xmin={0} xmax={1.5} ymin={-50} ymax={100} xlabel="Time / s" ylabel="Heave force / N" series={[
        { label: "After allocation / limits", color: "#719299", values: data.actuator_response.map((p) => [p.time_s, p.limited_heave_n]) },
        { label: "After delay + RPM lag", color: "#0a7185", values: data.actuator_response.map((p) => [p.time_s, p.realized_heave_n]) },
        { label: "Then seabed model", color: "#9a681a", values: data.actuator_response.map((p) => [p.time_s, p.boundary_heave_n]) },
      ]} />
      <p className="variation-note">Requested heave: +40 N, −40 N at 0.5 s, +1000 N at 1 s to expose saturation. Eight real mount directions, asymmetric 16 V static data and PWM deadband. The assumed 80 ms RPM time constant and two physics-step delay (16.7 ms here at 120 Hz) are <strong>not hardware-identified</strong>. Boundary loss acts after motor dynamics and does not change the RPM state.</p>
    </>}
    <p className="variation-note">Boundary effects are opt-in and absent from previously validated runs. Only the native panel / sand scene is supported; Hatch cutouts, ship geometry and scaled scenes are rejected. These numerical curves are reproducible model checks, not measured water-tank data, robot videos or policy success rates. <a href="./static/physical_effects_sensitivity.json" download>Raw samples and source hashes ↓</a> · <a href="./static/boundary_effects_integration.json">4-environment finite simulation check ↗</a></p>
    <p className="effect-sources">Primary sources: <a href="https://www.fossen.biz/html/marineCraftModel.html">relative-current dynamics</a> · <a href="https://html.rhhz.net/yykj/html/202212002.htm">ducted-thruster rear-wall study</a> · <a href="https://bluerobotics.com/store/thrusters/t100-t200-thrusters/t200-thruster-r2-rp/">T200 manufacturer data</a> · <a href="https://arxiv.org/html/2609.00641v1#A1.SS5">AMB aerodynamic reference</a></p>
  </article>;
}
