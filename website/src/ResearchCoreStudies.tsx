import { useEffect, useState } from "react";
import diagnosis from "../public/static/research-failure-diagnosis.json";
const sliderEE = diagnosis.records.find(r => r.task === "PushSlider" && r.model === "DP" && r.interface === "ee")!;

type Row = { study?: string; task: string; model?: string; interface?: string; num_demos?: number; training_seed?: number; condition?: string; success_percent: number; successes: number; test_episodes: number; ci95: number[] };
type Evidence = { complete: boolean; verified_completed_rows?: boolean; records: Row[]; scope: string };
const labels: Record<string,string> = { reference:"Reference",current_y_010:"Current +0.10",current_y_020:"Current +0.20",current_y_m020:"Current −0.20",motor_080:"Motors 80%",motor_060:"Motors 60%" };
function useEvidence(file:string) {
  const [value,setValue]=useState<Evidence|null>(null);
  useEffect(()=>{
    let live=true;
    async function refresh(){try{const r=await fetch(`./static/${file}`,{cache:"no-store"});if(r.ok){let v=await r.json();if(!v.complete && file === "research-core-studies.json"){const p=await fetch("./static/research-core-progress.json",{cache:"no-store"});if(p.ok)v=await p.json();}if(live&&(v.complete||v.verified_completed_rows))setValue(v);}}catch{/* Only completed, verified evaluations appear. */}}
    void refresh();const timer=setInterval(refresh,30000);return()=>{live=false;clearInterval(timer);};
  },[file]);return value;
}
function Chart({rows,kind}:{rows:Row[];kind:string}) {
  const tasks=[...new Set(rows.map(r=>r.task))];
  return <div className={`research-plots ${tasks.length === 1 ? "single-study-plot" : ""}`}>{tasks.map(task=>{
    const points=rows.filter(r=>r.task===task);
    const x=(i:number)=>60+(i+.5)*340/points.length;
    return <svg className="research-plot" viewBox="0 0 450 330" key={task} role="img" aria-label={`${task}: ${kind}`}>
      <text x="48" y="22" className="plot-title">{task} · success (%)</text>
      {[0,25,50,75,100].map(v=><g key={v}><line x1="48" x2="424" y1={235-v*1.8} y2={235-v*1.8} stroke="#dfe4e7"/><text x="38" y={239-v*1.8} className="plot-tick" textAnchor="end">{v}</text></g>)}
      {kind==="Demonstration budget"&&<polyline points={points.map((r,i)=>`${x(i)},${235-r.success_percent*1.8}`).join(" ")} fill="none" stroke="#087fbd" strokeWidth="2"/>}
      {points.map((r,i)=>{
        const label=kind==="Demonstration budget"?`${r.num_demos} demos`:kind==="Training repetitions"?`${r.model} · ${r.training_seed}`:r.condition?labels[r.condition]:`${r.model} · ${r.interface==="ee"?"EE":"Base/joints"}`;
        const labelParts=r.condition ? (r.condition === "reference" ? ["Reference"] : labels[r.condition].split(" ")) : kind === "Action interface" ? [r.model ?? "",r.interface === "ee" ? "EE targets" : "Base/joints"] : label.split(" ");
        const color=r.model==="ACT"?"#163e52":"#087fbd";
        return <g key={i} data-study={kind} data-task={task} data-successes={r.successes} data-value={r.success_percent}>
          <title>{label}: {r.successes}/{r.test_episodes}</title>
          <line x1={x(i)} x2={x(i)} y1={235-r.ci95[0]*1.8} y2={235-r.ci95[1]*1.8} stroke={color}/>
          {r.ci95.map((v,j)=><line key={j} x1={x(i)-4} x2={x(i)+4} y1={235-v*1.8} y2={235-v*1.8} stroke={color}/>)}
          <circle cx={x(i)} cy={235-r.success_percent*1.8} r="5" fill={color}/>
          <text x={x(i)} y={222-r.ci95[1]*1.8} textAnchor="middle" fill={color} fontSize="12">{r.successes}/{r.test_episodes}</text>
          <text x={x(i)} y="260" textAnchor="middle" className="plot-tick">{labelParts.map((part,j)=><tspan key={j} x={x(i)} dy={j ? 16 : 0}>{part}</tspan>)}</text>
        </g>;
      })}
    </svg>;
  })}</div>;
}
export function ResearchCoreStudies({kind,only,expanded=false}:{kind:"policies"|"control";only?:"interface"|"water";expanded?:boolean}) {
  const data=useEvidence("research-core-studies.json");
  const water=useEvidence("water-motor-study.json");
  const specs=kind==="policies"?[["scaling","Demonstration budget"],["repetitions","Training repetitions"]]:[["interface","Action interface"]];
  return <>
    {only!=="water"&&data&&specs.filter(([study])=>data.records.some(r=>r.study===study)).map(([study,title])=><details className="research-core-study" key={study} open={expanded}><summary>{title}</summary>
      <p className="research-context">{study==="scaling"?"Nested sets of 10, 20, 40 and 80 demonstrations · 40 epochs at each budget; update counts differ.":study==="repetitions"?"Three independent training seeds per architecture · common test resets · every run shown.":"Same demonstrations, observations and model budgets · end-effector targets versus base/joint targets."}</p>
      {!data.complete && <p className="wreck-caveat">Comparison in progress · only completed, physically verified evaluations are plotted. Missing configurations are pending, not zero success.</p>}
      <Chart rows={data.records.filter(r=>r.study===study)} kind={title}/>
      {data.complete && study === "interface" && <p className="research-context">EE targets produce a large DP deficit on PushSlider, but similar endpoint scores on PullLever. Of the 28 PushSlider EE-DP failures, {sliderEE.categories.no_bilateral_contact} never acquire bilateral finger contact and {sliderEE.categories.incomplete_constrained_motion} make contact without completing the constrained motion. <a href="./static/research-failure-diagnosis.json">Physical failure breakdown ↗</a></p>}
      {data.complete && study === "scaling" && <p className="research-context">Larger demonstration sets improve the observed DP outcomes overall on both tasks. Fixed epochs also increase the number of training updates; these results do not isolate data quantity from compute.</p>}
      <p className="research-context">Intervals: exact 95% binomial intervals over 30 resets, conditional on each trained model. {data.scope}</p>
      <a href={data.complete ? "./static/research-core-studies.json" : "./static/research-core-progress.json"}>Verified study data ↗</a>
    </details>)}
    {kind==="control"&&only!=="interface"&&water&&<details className="research-core-study" open={expanded}><summary>Current and motor capacity</summary>
      <p className="research-context">Two frozen diffusion policies · common initial states · one factor changes at a time. Current is in m/s; motor capacity is relative to the original limits.</p>
      <Chart rows={water.records} kind="Current and motor capacity"/>
      <p className="research-context">{water.scope} Intervals reflect reset variation for each fixed model.</p>
      <a href="./static/water-motor-study.json">Verified outcomes and contact/stability diagnostics ↗</a>
    </details>}
  </>;
}
