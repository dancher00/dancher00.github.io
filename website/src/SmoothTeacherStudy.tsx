import { useEffect, useState } from "react";
type Point={name:string;label:string;successes:number;episodes:number;ci95:number[]};
type Report={complete:boolean;assessment:string;display_groups:{key:string;label:string;points:Point[]}[]};
export function SmoothTeacherStudy(){
  const [report,setReport]=useState<Report|null>(null);
  useEffect(()=>{let live=true;fetch("./static/pushslider-smooth-teacher.json").then(r=>r.ok?r.json():null).then(r=>{if(live&&r?.complete)setReport(r);}).catch(()=>{});return()=>{live=false;};},[]);
  if(!report)return null;
  return <details className="act-correction" data-testid="smooth-teacher-study">
    <summary>PushSlider EE-DP · smooth recorded trajectories</summary>
    <p className="research-context">Same pretrained policy; two matched continuations on eight demonstration states, using either original or smooth expert trajectories. Each continuation receives 1,000 updates. Fixed normalization and observations; no expert at policy evaluation.</p>
    <div className={`research-plots ${report.display_groups.length===1?"single-study-plot":""}`}>{report.display_groups.map(group=><svg key={group.key} className="research-plot" viewBox="0 0 460 310" role="img" aria-label={`Smooth expert pilot ${group.key}`}>
      <text x="48" y="22" className="plot-title">{group.label} · success (%)</text>
      {[0,25,50,75,100].map(v=><g key={v}><line x1="48" x2="438" y1={230-v*1.65} y2={230-v*1.65} stroke="#dfe4e7"/><text x="38" y={234-v*1.65} textAnchor="end" className="plot-tick">{v}</text></g>)}
      {group.points.map((p,i)=>{const x=110+i*130,pct=100*p.successes/p.episodes,color=["#627b88","#163e52","#087fbd"][i];return <g key={p.name} data-smooth-group={group.key} data-successes={p.successes}>
        <title>{p.label}: {p.successes}/{p.episodes}</title>
        {group.key==="test"&&<><line x1={x} x2={x} y1={230-p.ci95[0]*1.65} y2={230-p.ci95[1]*1.65} stroke={color}/>{p.ci95.map((v,j)=><line key={j} x1={x-4} x2={x+4} y1={230-v*1.65} y2={230-v*1.65} stroke={color}/>)}</>}
        <circle cx={x} cy={230-pct*1.65} r="5" fill={color}/><text x={x} y={216-(group.key==="test"?p.ci95[1]:pct)*1.65} textAnchor="middle" className="plot-tick">{p.successes}/{p.episodes}</text>
        <text x={x} y="256" textAnchor="middle" className="plot-tick">{p.label.split(" ").map((part,j)=><tspan key={j} x={x} dy={j?16:0}>{part}</tspan>)}</text>
      </g>;})}
    </svg>)}</div>
    <p className="research-context">{report.assessment}</p>
    <p className="research-context">One training seed per continuation. Changed trajectories also change the distribution of frames across stages. Validation is used for selection; test whiskers, when shown, are exact 95% binomial intervals over reset states.</p>
    <a href="./static/pushslider-smooth-teacher.json">Verified pilot data and expert replay checks ↗</a>
  </details>;
}
