import { useEffect, useState } from "react";

type Point = { label: string; successes: number; episodes: number; ci95: number[] };
type Report = { assessment: string; results: { test_paired?: { gained: number; lost: number } }; complete: boolean; completion: { final_test_opened: boolean }; display_groups: { label: string; key: string; points: Point[] }[] };
export function PositionCorrection() {
  const [report,setReport] = useState<Report|null>(null);
  useEffect(() => {
    let live=true;
    fetch("./static/pushslider-position-correction.json").then(r=>r.ok?r.json():null).then(r=>{if(live&&r?.complete)setReport(r);}).catch(()=>{});
    return ()=>{live=false;};
  },[]);
  if (!report) return null;
  return <details className="act-correction" data-testid="position-correction">
    <summary>PushSlider EE-DP · temporal averaging of XYZ targets</summary>
    <p className="research-context">One inference correction: average two overlapping predictions for the same timestep. Same frozen model and observation channels; no expert commands or additional training. The original interface benchmark is retained above.</p>
    <div className={`research-plots ${report.display_groups.length===1?"single-study-plot":""}`}>{report.display_groups.map(group=><svg className="research-plot" viewBox="0 0 430 300" role="img" aria-label={`PushSlider XYZ averaging ${group.key}`} key={group.key}>
      <text x="48" y="22" className="plot-title">{group.label} · success (%)</text>
      {[0,25,50,75,100].map(v=><g key={v}><line x1="48" x2="405" y1={230-v*1.65} y2={230-v*1.65} stroke="#dfe4e7"/><text x="38" y={234-v*1.65} className="plot-tick" textAnchor="end">{v}</text></g>)}
      {group.points.map((p,i)=>{
        const x=135+i*165, pct=100*p.successes/p.episodes, color=i?"#087fbd":"#163e52";
        return <g key={p.label} data-position-group={group.key} data-successes={p.successes}>
          <title>{p.label}: {p.successes}/{p.episodes}</title>
          {group.key==="test"&&<><line x1={x} x2={x} y1={230-p.ci95[0]*1.65} y2={230-p.ci95[1]*1.65} stroke={color}/>{p.ci95.map((v,j)=><line key={j} x1={x-4} x2={x+4} y1={230-v*1.65} y2={230-v*1.65} stroke={color}/>)}</>}
          <circle cx={x} cy={230-pct*1.65} r="5" fill={color}/>
          <text x={x} y={216-(group.key==="test"?p.ci95[1]:pct)*1.65} textAnchor="middle" className="plot-tick">{p.successes}/{p.episodes}</text>
          <text x={x} y="258" textAnchor="middle" className="plot-tick">{p.label}</text>
        </g>;
      })}
    </svg>)}</div>
    <p className="research-context">Eight fresh validation states select whether the correction advances. {report.completion.final_test_opened?"Final results use 30 separate, paired states. Whiskers: exact 95% binomial intervals for this frozen policy over reset variation.":"Validation did not improve; the correction was rejected and the reserved 30-state final test was not opened."}</p>
    <p className="research-context">{report.assessment}</p>
    {report.results.test_paired && <p className="research-context">Paired final outcomes: {report.results.test_paired.gained} successes gained, {report.results.test_paired.lost} lost.</p>}
    <a href="./static/pushslider-position-correction.json">Verified correction and positional diagnosis ↗</a>
  </details>;
}
