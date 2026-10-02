import { useState } from "react";
import raw from "../public/static/marine-mechanisms/curves.json";

type Curve = {task:string; model:string; time_s:number[]; success_pct:number[]; progress_median:number[]; progress_q25:number[]; progress_q75:number[]};
const curves = raw as Curve[];
const colors: Record<string,string> = {ACT:"#163e52", DP:"#087fbd"};
const label = (s:string) => s.replace(/([a-z])([A-Z])/g,"$1 $2");
export function MarineMechanismStudy() {
  const tasks = [...new Set(curves.map(c=>c.task))];
  const [selected,setSelected]=useState(tasks[0] ?? "PushSlider");
  if (!tasks.length) return null;
  const task=tasks.includes(selected)?selected:tasks[0];
  const series=curves.filter(c=>c.task===task);
  return <section className="marine-study" aria-label="Constrained mechanism evaluation">
    <h3>Following a constrained trajectory</h3>
    <p className="research-context">Wrist RGB policies operate passive mechanisms while the vehicle holds position. Thirty fresh, paired reset seeds per task; checkpoints selected on separate validation scenes.</p>
    <div className="research-switches" role="group" aria-label="Mechanism results task">{tasks.map(t=><button key={t} aria-pressed={task===t} onClick={()=>setSelected(t)}>{label(t)}</button>)}</div>
    <div className="research-plots">{[false,true].map(progress=>{
      const max=progress?1.2:100;
      const min=progress && task==="PullLever" ? -1.2 : 0;
      const x=(v:number)=>45+v/60*390;
      const y=(v:number)=>235-(Math.min(max,Math.max(min,v))-min)/(max-min)*175;
      const points=(times:number[],values:number[])=>times.map((t,i)=>`${x(t)},${y(values[i])}`).join(" ");
      return <svg key={String(progress)} className="research-chart" viewBox="0 0 465 290" role="img" aria-label={`${label(task)} ${progress?"mechanism progress":"cumulative success"} over time`}>
        <text x="45" y="25" className="plot-title">{progress?"Mechanism travel / goal":"Completed episodes (%)"}</text>
        {(progress?(min<0?[-1,-.5,0,.5,1]:[0,.4,.8,1.2]):[0,25,50,75,100]).map(v=><g key={v}><line x1="45" x2="435" y1={y(v)} y2={y(v)} stroke="#dfe4e7"/><text x="36" y={y(v)+4} textAnchor="end" className="plot-tick">{v}</text></g>)}
        {progress&&<line x1="45" x2="435" y1={y(1)} y2={y(1)} stroke="#829298" strokeDasharray="4 4"/>}
        {series.map(c=><g key={c.model}><title>{label(task)}, {c.model}; {progress?"median with interquartile range":"all 30 trials"}</title>
          {progress&&<polygon points={`${points(c.time_s,c.progress_q25)} ${points([...c.time_s].reverse(),[...c.progress_q75].reverse())}`} fill={colors[c.model]} opacity=".12"/>}
          <polyline points={points(c.time_s,progress?c.progress_median:c.success_pct)} fill="none" stroke={colors[c.model]} strokeWidth="2.5"/>
        </g>)}
        {[0,15,30,45,60].map(t=><text key={t} x={x(t)} y="255" textAnchor="middle" className="plot-tick">{t}</text>)}
        <text x="240" y="282" textAnchor="middle" className="plot-tick">Simulation time (s)</text>
        {series.map((c,i)=><g key={c.model}><line x1={300+i*70} x2={320+i*70} y1="23" y2="23" stroke={colors[c.model]} strokeWidth="3"/><text x={325+i*70} y="27" className="plot-tick">{c.model}</text></g>)}
      </svg>;
    })}</div>
    <p className="research-context">Travel shows the median and interquartile range; the dashed line is the mechanical goal. Completion also requires tool engagement and base stability. Traces hold their last active value after completion or termination. One training seed per model.</p>
  </section>;
}
