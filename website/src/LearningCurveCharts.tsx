import { useEffect, useState } from "react";
export type CurvePoint = { model: string; budget_percent: number; success_percent: number; subtask_percent: number; successes: number; episodes: number; success_ci95: number[] };
export type CurveReport = { complete: boolean; points: CurvePoint[]; note: string };
export function useLearningCurve() {
  const [report, setReport] = useState<CurveReport | null>(null);
  useEffect(() => {
    let active = true;
    const update = () => fetch("./static/hatch-learning-curve.json", { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(r => { if (active && r?.complete) setReport(r); }).catch(() => {});
    void update(); const timer = window.setInterval(update, 30000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return report;
}
export function LearningCurveCharts({ report }: { report: CurveReport }) {
  return <div className="research-plots">{(["success_percent", "subtask_percent"] as const).map(metric => <svg key={metric} className="research-plot" viewBox="0 0 330 310" role="img" aria-label={`OpenHatch ${metric === "success_percent" ? "success" : "physical milestone completion"} by training budget`}>
    <text x="40" y="20" className="plot-title">{metric === "success_percent" ? "Success (%)" : "Subtask completion (%)"}</text>
    {[0,25,50,75,100].map(v=><g key={v}><line x1="40" x2="310" y1={235-v*1.7} y2={235-v*1.7} stroke="#dfe4e7"/><text x="32" y={239-v*1.7} textAnchor="end" className="plot-tick">{v}</text></g>)}
    {["ACT","DP"].map(model=>{const points=report.points.filter(p=>p.model===model).sort((a,b)=>a.budget_percent-b.budget_percent);const color=model==="ACT"?"#163e52":"#087fbd";return <g key={model}>
      <polyline points={points.map(p=>`${40+p.budget_percent*2.6},${235-p[metric]*1.7}`).join(" ")} fill="none" stroke={color} strokeWidth="2.5"/>
      {points.map(p=><g key={p.budget_percent} className="learning-curve-point" data-model={model} data-budget={p.budget_percent} data-metric={metric} data-value={p[metric]}><title>{`${model}, ${p.budget_percent}% budget: ${p[metric].toFixed(1)}%${metric === "success_percent" ? ` (${p.successes}/${p.episodes})` : ""}`}</title>{metric === "success_percent" && <line x1={40+p.budget_percent*2.6} x2={40+p.budget_percent*2.6} y1={235-p.success_ci95[0]*1.7} y2={235-p.success_ci95[1]*1.7} stroke={color} opacity=".35"/>}<circle cx={40+p.budget_percent*2.6} cy={235-p[metric]*1.7} r="4" fill={color}/><text x={40+p.budget_percent*2.6} y={235-p[metric]*1.7-10} textAnchor="middle" fill={color} fontSize="12">{p[metric].toFixed(1)}</text></g>)}
    </g>})}
    {[25,50,100].map(v=><text key={v} x={40+v*2.6} y="263" textAnchor="middle" className="plot-tick">{v}%</text>)}<text x="175" y="289" textAnchor="middle" className="plot-tick">Original training budget</text>
  </svg>)}</div>;
}
