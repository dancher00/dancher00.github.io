import { docsHref } from "./publicationLinks";
import { useState } from "react";
import report from "../../benchmarks/wreck-corrected-v3/results.json";
const colors = { ACT: "var(--chart-first, #163e52)", DP: "var(--chart-second, #087fbd)" };
export function CorrectedWreckStudy() {
  const [task, setTask] = useState("CargoRelease");
  const rows = report.results.filter(r => r.task === task);
  return <section className="wreck-corrected-study" aria-label="Corrected shipwreck policy comparison">
    <p className="research-insight">Reliable expert replay does not ensure learned task completion.</p>
    <p className="research-context">Corrected scenes · wrist RGB and measured robot state · robot flashlights only · calm water · ACT and DP on the same 30 reserved states per task, 8000–8029. Separate protocols; excluded from the shared six-task protocol macro-average.</p>
    <div className="research-switches" role="group" aria-label="Corrected shipwreck task">{["CargoRelease", "CabinRecovery"].map(t => <button key={t} aria-pressed={task === t} onClick={() => setTask(t)}>{t === "CargoRelease" ? "Cargo release" : "Cabin recovery"}</button>)}</div>
    <div className="research-comparison">
      <div className="research-charts"><h3>{task === "CargoRelease" ? "Cargo release" : "Cabin recovery"} · complete task</h3>
        <svg className="research-plot" viewBox="0 0 460 310" role="img" aria-label={`${task}: ${rows.map(r => `${r.model} ${r.successes}/30`).join(", ")}`}>
          <text x="40" y="20" className="plot-title">Success (%)</text>
          {[0,25,50,75,100].map(v => <g key={v}><line x1="40" x2="435" y1={240-v*1.8} y2={240-v*1.8} stroke="#dfe4e7"/><text x="30" y={244-v*1.8} textAnchor="end" className="plot-tick">{v}</text></g>)}
          {rows.map((r,i) => { const x=150+i*170, value=r.successes/r.attempts; const color=colors[r.model as "ACT"|"DP"]; return <g key={r.model} data-wreck-corrected-model={r.model} data-successes={r.successes}>
            <title>{r.model}: {r.successes}/{r.attempts}</title>
            <rect x={x-25} y={240-value*180} width="50" height={value*180} fill={color}/>
            <line x1={x} x2={x} y1={240-r.exact_binomial_95[0]*180} y2={240-r.exact_binomial_95[1]*180} stroke={color} strokeWidth="2"/>
            {r.exact_binomial_95.map((v,k) => <line key={k} x1={x-6} x2={x+6} y1={240-v*180} y2={240-v*180} stroke={color} strokeWidth="2"/>)}
            <circle cx={x} cy={240-value*180} r="3" fill={color}/>
            <text x={x} y={230-r.exact_binomial_95[1]*180} textAnchor="middle" fill={color} fontSize="15">{r.successes}/{r.attempts}</text>
            <text x={x} y="271" textAnchor="middle" className="plot-tick">{r.model}</text>
          </g>; })}
        </svg>
        <p className="research-context">Exact 95% binomial intervals over reset episodes, conditional on one trained model. Training RNG seed 42. Expert-command replay succeeds 12/12 on development states for each task; that is a separate check.</p>
      </div>
    </div>
    <p className="research-context">Water-appearance films are expert replays, not policy robustness tests. These results do not include π₀ or the unfinished Toss Ball variant.</p>
    <details className="study-evidence"><summary>Protocol, failure diagnosis and evidence</summary><p>{task === "CabinRecovery" ? "The corrected expert clears the hinge before extracting the disk. Learned policies still diverge from demonstrated manipulation. Fresh data exclude every historical collision-defective Cabin episode." : "Matched development replays succeed, while learned approach targets diverge before reliable cutting contact. An expert-prefix diagnostic did not remove subsequent alignment failures; it is not counted as autonomous success."}</p><a href="https://github.com/dancher00/wasserman/tree/main/benchmarks/wreck-corrected-v3">Per-state outcomes and sampled audits ↗</a> · <a href={docsHref("extended-studies")}>Study scope and reproduction ↗</a></details>
  </section>;
}
