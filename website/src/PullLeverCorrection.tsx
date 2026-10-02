import { useEffect, useState } from "react";

type Point = { label: string; successes: number; episodes: number; success_percent: number; ci95: number[]; update?: number };
type Report = { complete: boolean; selected_update: number; validation: Point[]; final: Point[]; paired: { gained: number; lost: number } | null; protocol: string; limits: string };

export function PullLeverCorrection() {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    let live = true;
    fetch("./static/pulllever-act-correction.json").then(r => r.ok ? r.json() : null).then(r => { if (live && r?.complete) setReport(r); }).catch(() => {});
    return () => { live = false; };
  }, []);
  if (!report) return null;
  const groups = [{ title: "Validation · 8 fresh states", rows: report.validation, validation: true }, ...(report.final.length ? [{ title: "Test · 30 paired states", rows: report.final, validation: false }] : [])];
  return <details className="act-correction" data-testid="pulllever-correction">
    <summary>PullLever ACT recovery · {report.final.length ? `${report.final[0].successes}/30 → ${report.final[1].successes}/30 on the fresh test` : "no validation improvement"}</summary>
    <p className="research-context">{report.protocol}</p>
    <div className={`research-plots ${groups.length === 1 ? "single-study-plot" : ""}`}>{groups.map(group => <svg key={group.title} className="research-plot" viewBox="0 0 430 300" role="img" aria-label={`PullLever ACT ${group.title}`}>
      <text x="48" y="22" className="plot-title">{group.title} · success (%)</text>
      {[0,25,50,75,100].map(v => <g key={v}><line x1="48" x2="405" y1={230-v*1.65} y2={230-v*1.65} stroke="#dfe4e7"/><text x="38" y={234-v*1.65} textAnchor="end" className="plot-tick">{v}</text></g>)}
      {group.rows.map((r,i) => {
        const x = 65 + (i+.5)*325/group.rows.length;
        const y = 230-r.success_percent*1.65;
        const color = i === 0 ? "#163e52" : "#087fbd";
        return <g key={r.label} data-recovery-phase={group.validation ? "validation" : "test"} data-successes={r.successes}>
          <title>{r.label}: {r.successes}/{r.episodes}</title>
          {!group.validation && <><line x1={x} x2={x} y1={230-r.ci95[0]*1.65} y2={230-r.ci95[1]*1.65} stroke={color}/>{r.ci95.map((v,j)=><line key={j} x1={x-4} x2={x+4} y1={230-v*1.65} y2={230-v*1.65} stroke={color}/>)}</>}
          <circle cx={x} cy={y} r="5" fill={color}/>
          <text x={x} y={group.validation ? y-14 : 216-r.ci95[1]*1.65} textAnchor="middle" className="plot-tick">{r.successes}/{r.episodes}</text>
          <text x={x} y="255" textAnchor="middle" className="plot-tick">{group.validation ? `${r.update} updates` : r.label}</text>
        </g>;
      })}
      <text x="225" y="284" textAnchor="middle" className="plot-tick">{group.validation ? "Additional training updates" : "Policy"}</text>
    </svg>)}</div>
    <p className="research-context">{report.selected_update === 0 ? "Neither fine-tuned checkpoint improved validation; the original model was retained and the final test was not opened." : `Selected checkpoint: ${report.selected_update} additional updates. Paired final outcomes: ${report.paired?.gained} successes gained, ${report.paired?.lost} lost. Test whiskers show exact 95% binomial intervals over reset states.`} {report.limits}</p>
    <a href="./static/pulllever-act-correction.json">Verified recovery study ↗</a>
  </details>;
}
