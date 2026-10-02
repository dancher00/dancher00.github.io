import { useEffect, useState } from "react";

type Point = { update: number; successes: number; episodes: number };
type Result = { label: string; successes: number; episodes: number; success_percent: number; ci95: number[]; closed_near_handle: number; failed_seeds: number[] };
type Report = { complete: boolean; selected_update: number; validation: Point[]; final: Result[]; protocol: string; limits: string; paired: { gained_successes: number; lost_successes: number; median_time_change_shared_success_s: number }; standalone_seed42: { completion_time_s: number } };

export function HatchCorrection() {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    let live = true;
    async function read() {
      try {
        const response = await fetch("./static/hatch-act-correction.json", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (live && data.complete) setReport(data);
        }
      } catch { /* Results appear only after independent verification. */ }
    }
    void read();
    const timer = setInterval(read, 30000);
    return () => { live = false; clearInterval(timer); };
  }, []);
  if (!report) return null;
  const colors = ["#163e52", "#087fbd"];
  return <details className="act-correction" open>
    <summary>OpenHatch ACT correction · {report.final.length > 1 ? `${report.final[0].successes}/30 → ${report.final[1].successes}/30 on the fresh test` : "no validation gain from recovery fine-tuning"}</summary>
    <p className="research-context">The original ACT benchmark in Task suite is retained. This separate study freezes FP32 inference, adds expert recovery continuations and selects a checkpoint using eight whole validation episodes. No expert acts during policy evaluation.</p>
    <div className="research-plots">
      <svg className="research-plot" viewBox="0 0 430 300" role="img" aria-label="ACT correction validation success">
        <text x="48" y="22" className="plot-title">Validation success (%)</text>
        {[0, 25, 50, 75, 100].map(v => <g key={v}><line x1="48" x2="405" y1={238-v*1.8} y2={238-v*1.8} stroke="#dfe4e7"/><text x="38" y={242-v*1.8} textAnchor="end" className="plot-tick">{v}</text></g>)}
        <polyline points={report.validation.map(p => `${72+p.update/4000*300},${238-p.successes/p.episodes*180}`).join(" ")} fill="none" stroke={colors[1]} strokeWidth="2.5"/>
        {report.validation.map(p => <g key={p.update} data-correction-update={p.update} data-successes={p.successes}>
          <circle cx={72+p.update/4000*300} cy={238-p.successes/p.episodes*180} r={p.update===report.selected_update?6:4} fill={colors[1]}/>
          <text x={72+p.update/4000*300} y={223-p.successes/p.episodes*180} textAnchor="middle" className="plot-tick">{p.successes}/{p.episodes}</text>
          <text x={72+p.update/4000*300} y="263" textAnchor="middle" className="plot-tick">{p.update/1000}k</text>
        </g>)}
        <text x="225" y="289" textAnchor="middle" className="plot-tick">Additional updates</text>
      </svg>
      <svg className="research-plot" viewBox="0 0 430 300" role="img" aria-label="ACT fresh paired test success">
        <text x="48" y="22" className="plot-title">Fresh test success (%)</text>
        {[0, 25, 50, 75, 100].map(v => <g key={v}><line x1="48" x2="405" y1={238-v*1.8} y2={238-v*1.8} stroke="#dfe4e7"/><text x="38" y={242-v*1.8} textAnchor="end" className="plot-tick">{v}</text></g>)}
        {report.final.map((r,i) => <g key={r.label} data-correction-model={i} data-successes={r.successes}>
          <rect x={95+i*160} y={238-r.success_percent*1.8} width="65" height={r.success_percent*1.8} fill={colors[i]}/>
          <line x1={127.5+i*160} x2={127.5+i*160} y1={238-r.ci95[0]*1.8} y2={238-r.ci95[1]*1.8} stroke="#68767d"/>
          {r.ci95.map((v,j)=><line key={j} x1={120+i*160} x2={135+i*160} y1={238-v*1.8} y2={238-v*1.8} stroke="#68767d"/>)}
          <text x={127.5+i*160} y={224-Math.max(r.success_percent,r.ci95[1])*1.8} textAnchor="middle" className="plot-tick">{r.successes}/{r.episodes}</text>
          <text x={127.5+i*160} y="267" textAnchor="middle" className="plot-tick">{i===0?"Original 20k":"Recovery"}</text>
        </g>)}
      </svg>
    </div>
    <p className="research-context">Selected: {report.selected_update.toLocaleString()} additional updates. {report.selected_update===0?"Neither fine-tuned checkpoint improved validation success; the original weights were retained. ":""}{report.protocol} Test whiskers: exact 95% binomial intervals over reset seeds. {report.limits}</p>
    <p className="research-context">The paired test retains all original successes: {report.paired.gained_successes} gained, {report.paired.lost_successes} lost. On jointly successful episodes, median completion slows by {report.paired.median_time_change_shared_success_s.toFixed(1)} s. Remaining grasp failures: seeds {report.final[1].failed_seeds.join(" and ")}. Standalone seed42 also succeeds in {report.standalone_seed42.completion_time_s.toFixed(1)} s.</p>
    <a href="./static/hatch-act-correction.json">Download the verified correction study ↗</a>
  </details>;
}
