import { docsHref } from "./publicationLinks";
import report from "./hotstabStudy.json";
const colors = { ACT: "var(--chart-first, #163e52)", DP: "var(--chart-second, #087fbd)" };
export function HotStabStudy() {
  return <div className="hotstab-study">
    <p className="research-insight">Insertion is not completion. ACT often seats the connector but does not release it; DP usually fails to establish a verified grasp.</p>
    <p className="research-context">Separate frozen study · 59 successful training demonstrations · 8 development states · 30 test resets · two fixed robot cameras · 100 s horizon. Excluded from the six-task macro-average.</p>
    <div className="research-comparison">
      <div className="research-charts"><h3>HotStab policy completion</h3>
        <svg className="research-plot" viewBox="0 0 460 310" role="img" aria-label="HotStab: ACT 2 of 30, DP 0 of 30">
          <text x="40" y="20" className="plot-title">Success (%)</text>
          {[0,25,50,75,100].map(v=><g key={v}><line x1="40" x2="435" y1={240-v*1.8} y2={240-v*1.8} stroke="#dfe4e7"/><text x="30" y={244-v*1.8} textAnchor="end" className="plot-tick">{v}</text></g>)}
          {(["ACT","DP"] as const).map((m,i)=>{const r=report.methods[m];const v=100*r.successes/r.episodes;return <g key={m} data-model={m} data-successes={r.successes}><rect x={125+i*170} y={240-v*1.8} width="52" height={v*1.8} fill={colors[m]}/><text x={151+i*170} y={228-v*1.8} textAnchor="middle" fill={colors[m]}>{r.successes}/{r.episodes}</text><text x={151+i*170} y="270" textAnchor="middle" className="plot-tick">{m}</text></g>;})}
        </svg>
        <p className="research-context">Physical expert reference: {report.methods.expert.successes}/{report.methods.expert.episodes}, using privileged state. All 90 expert/model episodes passed the declared sampled geometric audit. One training seed per model.</p>
      </div>
    </div>
    <details className="study-evidence"><summary>Protocol and failure evidence</summary><p>ACT: 17/30 finger-contact release failures. DP: 27/30 without verified grasp. These categories describe outcomes; they do not isolate a unique cause. Audit coverage is sampled at 30 Hz with a fixed 0.5 mm tolerance, not every substep or all self-collisions.</p><p><a href={docsHref("reproduction#hotstab")}>Reproduce the recorded study ↗</a> · <a href="https://github.com/dancher00/wasserman/tree/main/benchmarks/hotstab-v1">Reports and per-state outcomes ↗</a> · <a href="./static/hotstab-benchmark-v1/index.html">Expert reference and both camera streams ↗</a></p></details>
  </div>;
}
