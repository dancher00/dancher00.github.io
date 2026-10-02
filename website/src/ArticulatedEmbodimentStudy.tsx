import { useRef, useState } from "react";
import "./articulated-study.css";

type Sample = {time_s:number;error_mean_mm:number;error_low_mm:number;error_high_mm:number;travel_mean_mm:number;attitude_mean_deg:number;motor_utilization_mean:number};
type Robot = {robot:string;label:string;successes:number;episodes:number;series:Sample[];phases:{contact:{tcp_rmse_mm:number;base_attitude_rms_deg:number;motor_utilization_peak:number}}};
export type ArticulatedReport = {complete:boolean;evaluation_split:string;robots:Robot[];note:string;numerical_limit:string;media?:{video:string;poster:string}};
const colors=["var(--chart-first, #163e52)","var(--chart-second, #087fbd)"];
const metrics=[
 {key:"travel_mean_mm",title:"Button travel",unit:"mm",fixedMax:10,scale:1},
 {key:"error_mean_mm",title:"TCP goal error",unit:"mm",fixedMax:0,scale:1},
 {key:"attitude_mean_deg",title:"Base attitude error",unit:"°",fixedMax:0,scale:1},
 {key:"motor_utilization_mean",title:"Motor force / native limit",unit:"%",fixedMax:0,scale:100},
] as const;

export function ArticulatedEmbodimentStudy({report,showDemos=true}:{report:ArticulatedReport;showDemos?:boolean}) {
 const video=useRef<HTMLVideoElement>(null);
 const [time,setTime]=useState(0);
 if(!report.complete||report.evaluation_split!=="final"||report.robots.some(r=>r.episodes!==30))return null;
 const seek=(value:number)=>{if(video.current){video.current.currentTime=Math.max(0,Math.min(19.99,value));setTime(video.current.currentTime);}};
 return <section className="articulated-study" aria-label="Moving-arm embodiment comparison">
  <p className="research-insight">One pressing objective, two floating robot systems.</p>
  <p className="research-context">PressButton · 30 paired resets · scripted EE control with moving arms. Native masses, joint drives and motor limits are retained. These are system-control results, separate from ACT and DP.</p>
  <div className="research-legend">{report.robots.map((r,i)=><span key={r.robot}><i style={{background:colors[i]}}/>{r.label} · {r.successes}/{r.episodes}</span>)}</div>
  {showDemos&&report.media&&<figure className="articulated-film">
   <video ref={video} src={report.media.video} poster={report.media.poster} controls muted playsInline preload="metadata" onTimeUpdate={()=>setTime(video.current?.currentTime??0)} aria-label="Synchronized scripted PressButton demonstration, BlueROV2 on the left and RexROV2 on the right"/>
   <figcaption><span>BlueROV2 + Reach Alpha</span><span>RexROV2 + Oberon7</span></figcaption>
   <p className="research-context">Uncut, real-time demonstration · preselected development reset 85000 · no audio or overlays. This take is separate from the 30-reset score.</p>
  </figure>}
  <div className="articulated-plots">{metrics.map(metric=>{
   const rows=report.robots.map(r=>r.series.filter(p=>p.time_s>=5));
   const extent=Math.max(...rows.flatMap(points=>points.map(p=>(metric.key==="error_mean_mm"?p.error_high_mm:p[metric.key])*metric.scale)));
   const unit=metric.key==="attitude_mean_deg" ? 0.5 : 10;
   const maximum=metric.fixedMax||Math.max(unit,Math.ceil(extent/unit)*unit);
   const y=(value:number)=>238-value/maximum*178;
   const x=(seconds:number)=>54+(seconds-5)/15*346;
   return <svg key={metric.key} className="research-plot" viewBox="0 0 430 292" role="img" tabIndex={showDemos&&report.media?0:undefined} aria-label={`${metric.title} in ${metric.unit}, means over 30 paired resets.${showDemos ? " Arrow keys seek the demonstration." : ""}`} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();seek(time+(event.key==="ArrowRight"?0.5:-0.5));}}} onClick={event=>{const rect=event.currentTarget.getBoundingClientRect();const local=(event.clientX-rect.left)/rect.width*430;seek(5+(local-54)/346*15);}}>
    <text x="54" y="23" className="plot-title">{metric.title} ({metric.unit})</text>
    {[0,.25,.5,.75,1].map(f=><g key={f}><line x1="54" x2="400" y1={y(maximum*f)} y2={y(maximum*f)} stroke="#dfe4e7"/><text x="44" y={y(maximum*f)+4} textAnchor="end" className="plot-tick">{Number((maximum*f).toFixed(1))}</text></g>)}
    {metric.key==="travel_mean_mm"&&<><line x1="54" x2="400" y1={y(4)} y2={y(4)} stroke="#697e89" strokeDasharray="4 4"/><text x="398" y={y(4)-7} textAnchor="end" className="plot-tick">4 mm success threshold</text></>}
    {rows.map((points,i)=><g key={report.robots[i].robot}>
     {metric.key==="error_mean_mm"&&<polygon points={[...points.map(p=>`${x(p.time_s)},${y(p.error_low_mm)}`),...points.slice().reverse().map(p=>`${x(p.time_s)},${y(p.error_high_mm)}`)].join(" ")} fill={colors[i]} opacity=".1"/>}
     <polyline points={points.map(p=>`${x(p.time_s)},${y(p[metric.key]*metric.scale)}`).join(" ")} fill="none" stroke={colors[i]} strokeWidth="2.5"/>
    </g>)}
    {time>=5&&time<=20&&<line x1={x(time)} x2={x(time)} y1="48" y2="238" stroke="#9aaeb9" strokeDasharray="2 3"/>}
    {[5,10,15,20].map(t=><text key={t} x={x(t)} y="261" textAnchor="middle" className="plot-tick">{t}</text>)}
    <text x="227" y="286" textAnchor="middle" className="plot-tick">Time (s)</text>
   </svg>;
  })}</div>
  <p className="research-context">Plots show motion after 5 s settling. Lines: means over 30 paired resets; TCP bands: 10th–90th percentiles. Motor load is the most-loaded motor's fraction of its native force limit, averaged across resets. </p>
  <div className="articulated-metrics">{report.robots.map((r,i)=><div key={r.robot} style={{borderTopColor:colors[i]}}><strong>{r.label}</strong><dl><div><dt>Contact-phase goal error</dt><dd>{r.phases.contact.tcp_rmse_mm.toFixed(1)} mm RMS</dd></div><div><dt>Contact-phase base attitude</dt><dd>{r.phases.contact.base_attitude_rms_deg.toFixed(2)}° RMS</dd></div></dl></div>)}</div>
  <p className="research-context">{report.note}</p>
  <details><summary>Physical model, controls and evidence</summary><p>{report.numerical_limit}</p><p>The Blue articulated variant uses geometry-scaled arm-fluid coefficients. The historical held-arm v1 result retains its original model. The 6 mm controller hold target preserves the original 4 mm physical success threshold.</p><a href="https://github.com/dancher00/wasserman/blob/main/benchmarks/articulated-embodiments-v3/summary.json">Download results and provenance ↗</a></details>
 </section>;
}
