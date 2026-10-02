import smolButton from "../../research/button-lever-smolvla-5090/PressButton/summary.json";
import smolLever from "../../research/button-lever-smolvla-5090/PullLever/summary.json";
import smolSlider from "../../research/pushslider-smolvla-5090/summary.json";
import { CurrentStudy } from "./CurrentStudy";
import { HotStabStudy } from "./HotStabStudy";
import { CorrectedWreckStudy } from "./CorrectedWreckStudy";
import { useState } from "react";
import primary from "../../research/revision-v2-primary-results.json";
import control from "../../research/revision-v2-controller-results.json";
import interfaces from "../../research/revision-v2-interface-results.json";

import { docsHref } from "./publicationLinks";
import { EmbodimentStudy, useEmbodimentStudy } from "./EmbodimentStudy";
import { useBimanualStudy } from "./BimanualValveStudy";

const names: Record<string, string> = { PressButton: "Press button", RotateValve: "Rotate valve", OpenHatch: "Open hatch", CollectShell: "Collect shell", PushSlider: "Push slider", PullLever: "Pull lever" };
const colors = ["var(--chart-first, #163e70)", "var(--chart-second, #1686d9)", "var(--chart-third, #6b8599)"];
const tabs = [
  ["High-level policies", "ACT · DP · BC"],
  ["VLA / SmolVLA", "3 tasks · 3 training seeds"],
  ["Policy × control", "DP · control, interfaces & currents"],
  ["Embodiments", "2 platforms · two-arm manipulation"],
];
type Series = { label: string; counts: number[] };

function RunChart({ title, series }: { title: string; series: Series[] }) {
  const height = series.length * 49 + 48;
  return <svg viewBox={`0 0 400 ${height}`} role="img" aria-label={`${title}. ${series.map(s => `${s.label}: ${s.counts.join(", ")} successes out of 30`).join(". ")}`}>
    {[0, 25, 50, 75, 100].map(t => <g key={t}><line x1={91 + t * 2.4} x2={91 + t * 2.4} y1="8" y2={height - 28} stroke="#e2eaf0" /><text x={91 + t * 2.4} y={height - 8} textAnchor="middle" fill="#20384c" fontSize="12">{t}%</text></g>)}
    {series.map((s, i) => {
      const mean = s.counts.reduce((a, b) => a + b, 0) / s.counts.length / 30 * 100;
      const y = i * 49 + 27;
      return <g key={s.label}>
        <text x="0" y={y + 4} fontSize="13" fontWeight="600" fill="#20384c">{s.label}</text>
        <rect x="91" y={y - 12} width={mean * 2.4} height="24" rx="3" fill={colors[i]} opacity=".18" />
        <line x1={91 + mean * 2.4} x2={91 + mean * 2.4} y1={y - 14} y2={y + 14} stroke={colors[i]} strokeWidth="2" />
        {s.counts.map((n, j) => <circle key={j} cx={91 + n / 30 * 240} cy={y + (j - 1) * 7} r="3.8" fill={colors[i]} stroke="white" strokeWidth="1"><title>Training seed {primary.training_seeds[j]}: {n}/30</title></circle>)}
        <text x="396" y={y + 4} textAnchor="end" fontSize="13" fontWeight="650" fill="#20384c">{mean.toFixed(1)}</text>
      </g>;
    })}
  </svg>;
}

function PolicyOverview() {
  const tasks = primary.rows.filter(r => r.model === "ACT").map(r => r.task);
  return <div className="policy-overview"><h4>Success across the task suite</h4>
    <div className="overview-legend">{["ACT", "DP", "BC"].map((m,i)=><span key={m}><i style={{background:colors[i]}}/>{m}</span>)}</div>
    <div className="overview-chart-scroll"><svg viewBox="0 0 620 345" role="img" aria-label="Success across six tasks: bars show mean and dots show each of three training seeds">
      {[0,25,50,75,100].map(n=><g key={n}><line x1="42" x2="610" y1={270-n*2.25} y2={270-n*2.25} stroke="#e0e6eb"/><text x="32" y={274-n*2.25} textAnchor="end" fontSize="12" fill="#20384c">{n}</text></g>)}
      <text x="42" y="20" fontSize="13" fill="#20384c">Success (%)</text>
      {tasks.map((task,i)=><g key={task}>{["ACT","DP","BC"].map((model,j)=>{
        const r=primary.rows.find(v=>v.task===task&&v.model===model)!;
        const x=56+i*94+j*22;
        return <g key={model}><title>{task}, {model}: {r.successes.join(", ")} / 30</title><rect x={x} y={270-r.mean*225} width="17" height={r.mean*225} fill={colors[j]} opacity=".8"/>{r.successes.map((n,k)=><circle key={k} cx={x+4+k*4.5} cy={270-n/30*225} r="3" fill={colors[j]} stroke="white" strokeWidth="1"><title>Training seed {primary.training_seeds[k]}: {n}/30</title></circle>)}</g>;
      })}<text x={85+i*94} y="295" textAnchor="middle" fontSize="12" fill="#20384c">{names[task].split(" ")[0]}</text><text x={85+i*94} y="313" textAnchor="middle" fontSize="12" fill="#20384c">{names[task].split(" ").slice(1).join(" ")}</text></g>)}
    </svg></div><p className="landing-note">Bars: mean success. Dots from left to right: training seeds 17, 43, 101; 30 resets each.</p>
  </div>;
}
function VLAResults() {
  return <section className="vla-results" aria-labelledby="vla-heading"><span className="study-kicker">3 tasks · 3 training seeds · 270 test episodes</span><h3 id="vla-heading">Vision–language–action policies</h3><p className="landing-note">SmolVLA fine-tuning on PressButton, PushSlider and PullLever. Each dot represents one training run evaluated on 30 test resets.</p><div className="study-charts">{[smolButton, smolSlider, smolLever].map(result => <article className="study-chart" key={result.task}><h4>{names[result.task]}</h4><RunChart title={names[result.task]} series={[{label:"SmolVLA", counts:result.training_seeds.map(seed => result.runs.find(r => r.training_seed === seed && r.purpose === "test")!.successes)}, {label:"DP", counts:primary.rows.find(r => r.task === result.task && r.model === "DP")!.successes}]} /></article>)}</div><p className="landing-note"><a href="https://github.com/dancher00/wasserman/tree/main/research/button-lever-smolvla-5090">Training configuration and episode outcomes ↗</a></p></section>;
}

export function CurrentResults() {
  const [tab, setTab] = useState(0);
  const [controlView, setControlView] = useState(0);
  const embodiment = useEmbodimentStudy();
  const bimanual = useBimanualStudy();
  const study = tab === 2 ? controlView + 1 : 0;
  const tasks = primary.rows.filter(r => r.model === "ACT").map(r => r.task);
  return <section className="landing-band"><div className="landing-width">
    <div className="landing-heading"><h2>Results</h2><p>Integral control sustains completion; action interfaces shape learning; currents reveal effort hidden by success.</p></div>
    <details className="landing-results" open>
      <summary><div><h3>Benchmark results</h3><p>Policies, control and robot embodiments</p></div><b aria-hidden="true" /></summary>
      <div className="study-tabs" role="tablist" aria-label="Benchmark studies">{tabs.map(([title, scope], i) => <button key={title} role="tab" id={`study-tab-${i}`} aria-selected={tab === i} aria-controls="study-panel" tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)} onKeyDown={event => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (i + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
        setTab(next); document.getElementById(`study-tab-${next}`)?.focus();
      }}><strong>{title}</strong><span>{scope}</span></button>)}</div>
      <div id="study-panel" role="tabpanel" aria-labelledby={`study-tab-${tab}`} tabIndex={0} className="study-panel">
        {tab === 1 ? <VLAResults/> : tab === 3 ? <><p className="study-kicker">Companion studies · scripted control · earlier asset version</p>{embodiment ? <EmbodimentStudy report={embodiment} bimanual={bimanual} showDemos={false}/> : <p>Loading robot comparisons…</p>}</> : <>
        {tab === 2 && <div className="research-switches" aria-label="Control comparison"><button aria-pressed={controlView===0} onClick={()=>setControlView(0)}>Low-level control</button><button aria-pressed={controlView===1} onClick={()=>setControlView(1)}>Action interfaces</button><button aria-pressed={controlView===2} onClick={()=>setControlView(2)}>Water current</button></div>}
        {study === 3 ? <CurrentStudy/> : <><div className="study-intro"><span className="study-kicker">{["54 independent trainings · 1,620 evaluation episodes", "Frozen policy · matched research resets", "Same demonstrations · matched training exposure"][study]}</span>
          <h3>{["Policy learning across six tasks.", "Integral control changes task completion.", "The action interface changes what DP learns."][study]}</h3>
          <p>{["All three training runs are shown, including failed policies. ACT varies from 0 to 23 successes out of 30 on PullLever. DP completes all three OpenHatch cohorts.", "Removing integral action reduces completion on both tasks. Early opposing grasp increases on OpenHatch and decreases on RotateValve: contact alone does not explain the outcome.", "Both interfaces pass eight paired expert-replay states per task. End-effector targets reduce DP success on PushSlider; the difference on PullLever remains unresolved."][study]}</p>
        </div>
        {tab === 0 && <PolicyOverview/>}
        <details key={`breakdown-${study}`} open={tab !== 0} className="study-breakdown"><summary hidden={tab !== 0}>Per-task results · all training runs</summary>
        <p className="study-legend"><span aria-hidden="true">●</span> Dots from top to bottom: seeds 17, 43, 101, each on 30 resets. Bars and vertical marks: mean success. Right-hand numbers: %.</p>
        <div className={`study-charts ${tab === 0 ? "study-charts-core" : ""}`}>
          {tab === 0 && tasks.map(task => <article key={task} className="study-chart"><h4>{names[task]}</h4><RunChart title={task} series={["ACT", "DP", "BC"].map(model => ({ label: model, counts: primary.rows.find(r => r.task === task && r.model === model)!.successes }))} /></article>)}
          {study === 1 && ["OpenHatch", "RotateValve"].map(task => {
            const zero = control.contrasts.find(r => r.task === task && r.contrast === "ki0-nominal minus ki1-nominal")!;
            const half = control.contrasts.find(r => r.task === task && r.contrast === "ki0.5-nominal minus ki1-nominal")!;
            const contact = zero.measurements.opposing_grasp_fraction;
            return <article key={task} className="study-chart"><h4>{names[task]}</h4><RunChart title={task} series={[{ label: "Full I", counts: zero.success.reference_per_run }, { label: "Half I", counts: half.success.variant_per_run }, { label: "No I", counts: zero.success.variant_per_run }]} /><p>Early opposing grasp: <strong>{(contact.reference.mean * 100).toFixed(1)}% → {(contact.variant.mean * 100).toFixed(1)}%</strong> when integral action is removed.</p></article>;
          })}
          {study === 2 && interfaces.rows.map(row => <article key={row.task} className="study-chart"><h4>{names[row.task]}</h4><RunChart title={row.task} series={[{ label: "Base/joint", counts: row.interfaces.actuator.runs.map(r => r.successes) }, { label: "EE", counts: row.interfaces.ee.runs.map(r => r.successes) }]} /><p>EE − base/joint: <strong>{row.difference > 0 ? "+" : ""}{(row.difference * 100).toFixed(1)} pp</strong><br />Descriptive 95% interval: [{row.descriptive_crossed_95.map(n => `${n > 0 ? "+" : ""}${(n * 100).toFixed(1)}`).join(", ")}] pp.</p></article>)}
        </div>
        </details>
        {tab === 0 && <details className="study-numbers"><summary>All numerical results · mean ± SD</summary><div className="landing-table"><table><caption>Success (%) · mean ± SD across 3 training seeds · 30 evaluation episodes per seed</caption><thead><tr><th scope="col">Task</th>{["ACT", "DP", "BC"].map(m => <th scope="col" key={m}>{m}</th>)}</tr></thead><tbody>{tasks.map(task => <tr key={task}><th scope="row">{names[task]}</th>{["ACT", "DP", "BC"].map(model => { const r = primary.rows.find(v => v.task === task && v.model === model)!; return <td key={model}>{(r.mean * 100).toFixed(1)} ± {(r.training_run_sd * 100).toFixed(1)}</td>; })}</tr>)}</tbody></table></div></details>}
        <p className="landing-note">{["Shared demonstration splits and sampled-window budgets. Final-budget checkpoints; three independent training runs per policy and task.", "Graphs show the three nominal gain conditions. The paper includes four additional coefficient conditions. Contact uses the first 20 seconds; success uses the full task horizon. The coefficient conditions measure model sensitivity.", "Representation, decoding and normalization change together. Research resets differ from the primary table. An unresolved difference is not evidence of equivalence."][study]} <a href={docsHref("revision-v2-analysis")}>Full analysis ↗</a></p></>}{tab === 0 && <details className="study-numbers"><summary>HotStab, CabinRecovery and CargoRelease · task-specific policy studies</summary><p className="landing-note">The same task catalogue, with separately versioned observation, data and evaluation contracts.</p><HotStabStudy/><CorrectedWreckStudy/></details>}</>}
      </div>
    </details>
    <p className="landing-note">Shared training protocol: open-procedural-v1. <a href="./?view=explore#results">Historical studies and evidence ↗</a></p>
  </div></section>;
}
