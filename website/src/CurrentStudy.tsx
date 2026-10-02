import { useState } from "react";
import data from "./currentStudy.json";
import { docsHref } from "./publicationLinks";

const seeds = [17, 43, 101];
const colors = ["var(--chart-first, #163e70)", "var(--chart-second, #1686d9)", "var(--chart-third, #6b8599)"];
const tasks = ["OpenHatch", "RotateValve"];
const names: Record<string,string> = { OpenHatch: "Open hatch", RotateValve: "Rotate valve" };
const metrics = {
  success_rate: { title: "Success (%)", scale: 100, max: 100 },
  motor_force_rms_N: { title: "Motor-force RMS (N)", scale: 1, max: 3.5 },
  contact_lost: { title: "Contact-loss incidence (%)", scale: 100, max: 100 },
};
export function CurrentStudy() {
  const [metric, setMetric] = useState<keyof typeof metrics>("success_rate");
  const definition = metrics[metric];
  const y = (v: number) => 173 - v * definition.scale / definition.max * 140;
  return <div className="current-study">
    <div className="study-intro"><span className="study-kicker">540 episodes · 2 tasks · 3 DP checkpoints · paired resets</span><h3>Currents change completion and actuator effort.</h3><p>At 0.10 m/s, RotateValve success falls from 87.8% to 64.4%. OpenHatch retains full observed success at 0.20 m/s while motor-force RMS increases by 9.4%.</p></div>
    <div className="research-switches" aria-label="Current metric">{Object.entries(metrics).map(([key,value])=><button key={key} aria-pressed={metric===key} onClick={()=>setMetric(key as keyof typeof metrics)}>{value.title}</button>)}</div>
    <div className="current-legend">{seeds.map((seed,i)=><span key={seed}><svg width="26" height="12" aria-hidden="true"><line x1="0" x2="26" y1="6" y2="6" stroke={colors[i]} strokeWidth="2" strokeDasharray={[undefined,"6 3","2 3"][i]}/></svg>Training seed {seed}</span>)}</div>
    <div className="study-charts">{tasks.map(t=><article className="study-chart" key={t}><h4>{names[t]}</h4><svg viewBox="0 0 340 220" role="img" aria-label={`${names[t]}: ${definition.title} across current speeds, all three training seeds`}>
      {[0,.5,1].map(v=><g key={v}><line x1="43" x2="315" y1={173-v*140} y2={173-v*140} stroke="#dce5ed"/><text x="34" y={177-v*140} textAnchor="end" fontSize="12" fill="#20384c">{(v*definition.max).toFixed(metric === "motor_force_rms_N" ? 1 : 0)}</text></g>)}
      <text x="43" y="17" fontSize="12" fill="#20384c">{definition.title}</text>
      {seeds.map((seed,i)=>{const rows=data.rows.filter(r=>r.task===t&&r.training_seed===seed).sort((a,b)=>a.speed_m_s-b.speed_m_s);return <g key={seed}><polyline points={rows.map(r=>`${55+r.speed_m_s*1200},${y(r[metric])}`).join(" ")} fill="none" stroke={colors[i]} strokeWidth="2" strokeDasharray={[undefined,"6 3","2 3"][i]}/>{rows.map(r=><circle key={r.speed_m_s} cx={55+r.speed_m_s*1200} cy={y(r[metric])} r={4-i*.6} fill={colors[i]}><title>Seed {seed}, {r.speed_m_s.toFixed(2)} m/s: {(r[metric]*definition.scale).toFixed(2)}</title></circle>)}</g>;})}
      {[0,.1,.2].map(v=><text key={v} x={55+v*1200} y="193" textAnchor="middle" fontSize="12" fill="#20384c">{v.toFixed(2)}</text>)}<text x="178" y="216" textAnchor="middle" fontSize="12" fill="#20384c">Transverse current (m/s)</text>
    </svg></article>)}</div>
    <p className="landing-note">Thirty matched resets per checkpoint and condition, with a fresh zero-current baseline. Success uses the full horizon; effort and contact loss use the first 20 seconds. Contact loss requires prior contact. Lines connect tested levels only; the success response is not monotonic. <a href={docsHref("current-contact-study")}>Protocol, all counts and paired uncertainty ↗</a></p>
  </div>;
}
