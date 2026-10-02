import { docsHref } from "./publicationLinks";
import { CorrectedWreckStudy } from "./CorrectedWreckStudy";
import { HotStabStudy } from "./HotStabStudy";
import { ResearchCoreStudies } from "./ResearchCoreStudies";
import { HatchCorrection } from "./HatchCorrection";
import { useState, type KeyboardEvent } from "react";
import { ControlStudyCharts, useControlStudy } from "./ControlStudyCharts";
import { EmbodimentStudy, useEmbodimentStudy } from "./EmbodimentStudy";
import { useBimanualStudy } from "./BimanualValveStudy";
import data from "./modelBenchmarks.json";
import valve from "../public/static/rotate-valve-model-benchmarks.json";
import shell from "../public/static/collect-shell-model-benchmarks.json";
import hatch from "../public/static/open-hatch-model-benchmarks.json";
import { LearningCurveCharts, useLearningCurve } from "./LearningCurveCharts";

const colors: Record<string, string> = { ACT: "var(--chart-first, #163e52)", DP: "var(--chart-second, #087fbd)", PPO: "#267d88" };
const visualTasks = [...new Set(data.rows.filter(r => r.model !== "PPO").map(r => r.task))];

const taskLabel = (task: string) => task.replace(/([a-z])([A-Z])/g, "$1 $2");
const tabs = [
  ["High-level policies", "9 tasks · separate protocols"],
  ["Policy × control", "Controllers · interfaces · disturbances"],
  ["Embodiments", "PressButton · 2 platforms"],
];
export function Plot({ time = false, state = false }: { time?: boolean; state?: boolean }) {
  const tasks = state ? ["PressButton"] : visualTasks;
  const compact = tasks.length > 3;
  const width = compact ? 20 : 32;
  const spacing = 405 / tasks.length;
  const max = time ? 100 : 100;
  return <svg className="research-plot" viewBox="0 0 460 310" role="img" aria-label={time ? "Median completion time on successful episodes" : "Task success rates"}>
    <text x="40" y="20" className="plot-title">{time ? "Completion time (s)" : "Success (%)"}</text>
    {[0, .25, .5, .75, 1].map(t => <g key={t}><line x1="40" x2="445" y1={240 - t * 180} y2={240 - t * 180} stroke="#dfe4e7" /><text x="31" y={244 - t * 180} textAnchor="end" className="plot-tick">{t * max}</text></g>)}
    {tasks.map((task, i) => {
      const rows = data.rows.filter(r => r.task === task && (state ? r.model === "PPO" : r.model !== "PPO"));
      return <g key={task}>{rows.map((r, j) => {
        const value = time ? r.median_success_time_s : 100 * r.successes / r.episodes;
        if (value === null) return null;
        const center = 40 + spacing * (i + .5);
        const x = state ? 148 : center - (compact ? 25 : 40) + j * (compact ? 30 : 48);
        const ci = (r as typeof r & { exact_binomial_95_ci?: number[] }).exact_binomial_95_ci ?? (task === "RotateValve" ? valve : task === "OpenHatch" ? hatch : task === "CollectShell" ? shell : undefined)?.methods.find(m => m.model === r.model)?.exact_binomial_95_ci;
        return <g key={r.model} className="research-data-point" data-task={task} data-model={r.model} data-value={value}>
          <title>{`${task}, ${r.model}: ${time ? `${value.toFixed(1)} s; successful episodes only` : `${r.successes}/${r.episodes} (${value.toFixed(1)}%)`}`}</title>
          <rect x={x} y={240 - value / max * 180} width={width} height={value / max * 180} fill={colors[r.model]} />
          {!time && !state && ci && <g stroke="#59626b"><line x1={x+width/2} x2={x+width/2} y1={240-ci[0]*180} y2={240-ci[1]*180} />{ci.map((v,k)=><line key={k} x1={x+width/2-5} x2={x+width/2+5} y1={240-v*180} y2={240-v*180} />)}</g>}
          <text x={x+width/2} y={230-(time || state || !ci ? value/max : Math.max(value/max,ci[1]))*180} textAnchor="middle" fill={colors[r.model]} fontSize="12">{time ? value.toFixed(1) : Number(value.toFixed(1))}</text>
        </g>;
      })}<text x={state ? 164 : 40+spacing*(i+.5)} y="267" textAnchor="middle" className="plot-tick">{compact ? taskLabel(task).split(" ").map((word,k)=><tspan key={k} x={40+spacing*(i+.5)} dy={k ? 15 : 0}>{word}</tspan>) : taskLabel(task)}</text></g>;
    })}
  </svg>;
}
const policyStudies = [["overview", "Task suite"], ["learning", "Learning progress"], ["correction", "ACT fine-tuning"], ["scaling", "Data budget"], ["hotstab", "HotStab"], ["wreck", "Shipwreck tasks"]];
const controlStudies = [["controller", "Low-level control"], ["interface", "Action interface"], ["water", "Current & motor limits"]];
export function BenchmarkStudies() {
  const curve = useLearningCurve();
  const control = useControlStudy();
  const embodiment = useEmbodimentStudy();
  const bimanual = useBimanualStudy();
  const [tab, setTab] = useState(0);
  const [study, setStudy] = useState("overview");
  const [controlStudy, setControlStudy] = useState("controller");
  const [metric, setMetric] = useState("success");
  const keyboard = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = e.key === "Home" ? 0 : e.key === "End" ? 2 : e.key === "ArrowRight" ? (i+1)%3 : e.key === "ArrowLeft" ? (i+2)%3 : null;
    if (next !== null) { e.preventDefault(); setTab(next); document.getElementById(`research-tab-${next}`)?.focus(); }
  };
  return <div className="results-explorer">
    <p className="research-context">Historical CAD-profile results · one training seed per configuration. <a href={docsHref("revision-v2-protocol")}>Open-core revision: fixed protocol and three training seeds per configuration.</a></p>
    <div className="research-tabs" role="tablist" aria-label="Results study">
      {tabs.map(([title], i) => <button key={title} id={`research-tab-${i}`} role="tab" aria-selected={tab===i} aria-controls="research-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)} onKeyDown={e=>keyboard(e,i)}><strong>{title}</strong><small>{i === 0 ? "9 tasks · separate protocols" : i === 1 ? "Controllers · interfaces · disturbances" : bimanual ? "2 platforms · two-arm extension" : "PressButton · 2 platforms"}</small></button>)}
    </div>
    <div className="research-panel" id="research-panel" role="tabpanel" aria-labelledby={`research-tab-${tab}`}>
      {tab < 2 && <div className="study-navigation" role="group" aria-label={tab===0 ? "Policy study" : "Control study"}>{(tab===0 ? policyStudies : controlStudies).map(([id,label])=><button key={id} aria-pressed={(tab===0?study:controlStudy)===id} onClick={()=>tab===0?setStudy(id):setControlStudy(id)}>{label}</button>)}</div>}
      {tab === 0 ? <>
        {(study === "overview" || study === "learning") && <>
          <p className="research-insight">{study === "overview" ? "The selected historical DP checkpoints score higher than ACT on five tasks and tie on RotateValve. These single-training-run results compare the recorded implementations and budgets." : "Training progress depends on the task and model. OpenHatch checkpoints reveal different paths from initial contact to stable completion."}</p>
          <p className="research-context">BlueROV2 + Reach Alpha · wrist RGB and robot state · 80 available demonstrations per task · ACT train 80; DP train 76 / holdout 4 · 30 test resets. Up to 20,000 ACT updates and 40 DP epochs; each task retains its own success criteria and horizon.</p>
          <div className="research-comparison">
            <div className="research-charts"><div className="research-chart-title"><h3>{study === "learning" ? "Learning progress on OpenHatch" : "Visual policy performance"}</h3><div className="research-legend"><span><i style={{background:colors.ACT}} />ACT</span><span><i style={{background:colors.DP}} />DP</span></div></div>
              {study === "learning" && curve ? <LearningCurveCharts report={curve} /> : <><div className="research-switches" role="group" aria-label="Performance metric"><button aria-pressed={metric==="success"} onClick={()=>setMetric("success")}>Task success</button><button aria-pressed={metric==="time"} onClick={()=>setMetric("time")}>Completion time</button></div><Plot time={metric==="time"}/></>}
              <p className="research-context">{study === "learning" ? "Retrospective checkpoint study · 30 paired seeds. ACT: 5k / 10k / 20k updates; DP: 10 / 20 / 40 epochs. Relative budgets are not equal compute." : "Whiskers: exact 95% binomial intervals. Completion time includes successful episodes only. One training seed per model; intervals describe reset variability."}</p>
            </div>
          </div>
        </>}
        {study === "correction" && <><p className="research-insight">Expert recovery continuations improve OpenHatch ACT from 12/30 to 28/30 on a fresh paired test.</p><HatchCorrection /></>}
        {study === "scaling" && <ResearchCoreStudies kind="policies" expanded/>}
        {study === "hotstab" && <HotStabStudy />}
        {study === "wreck" && <CorrectedWreckStudy />}
      </> : tab === 1 ? <>
        {controlStudy === "controller" && (control ? <ControlStudyCharts report={control} /> : <p>Loading controller comparison…</p>)}
        {controlStudy === "interface" && <ResearchCoreStudies kind="control" only="interface" expanded/>}
        {controlStudy === "water" && <ResearchCoreStudies kind="control" only="water" expanded/>}
      </> : embodiment ? <EmbodimentStudy report={embodiment} bimanual={bimanual} showDemos={false} /> : <p>Loading robot comparison…</p>}
    </div>
    <p className="research-appendix-link"><a href="./?view=appendix">Additional studies and diagnostics ↗</a></p>
  </div>;
}
