import { useEffect, useState } from "react";
import { ExpertDemo } from "./ExpertDemo";
import films from "../public/static/held-arm/manifest.json";
import articulated from "../../benchmarks/articulated-embodiments-v3/summary.json";
import { ArticulatedEmbodimentStudy, type ArticulatedReport } from "./ArticulatedEmbodimentStudy";
import { BimanualValveStudy, type BimanualReport } from "./BimanualValveStudy";

type Sample = { time_s: number; error_mean_mm: number; error_low_mm: number; error_high_mm: number; travel_mean_mm: number };
type Robot = { robot: string; label: string; successes: number; episodes: number; tool_tracking_rmse_mm: number; series: Sample[] };
type Report = { complete: boolean; robots: Robot[]; note: string; numerical_limit: string };
export function useEmbodimentStudy() {
  const [data,setData]=useState<Report|null>(null);
  useEffect(()=>{
    let live=true;
    async function read(){try{const r=await fetch("./static/embodiment-study.json",{cache:"no-store"});if(r.ok){const d=await r.json();if(live&&d.complete&&d.robots?.length===2)setData(d);}}catch{/* Await measured results. */}}
    void read();const timer=setInterval(read,30000);return()=>{live=false;clearInterval(timer);};
  },[]);
  return data;
}
export function EmbodimentStudy({report,bimanual,showDemos=true}:{report:Report;bimanual?:BimanualReport|null;showDemos?:boolean}) {
  const [version,setVersion]=useState("v3");
  return <><div className="research-switches" role="group" aria-label="Embodiment study version">
    <button aria-pressed={version==="v3"} onClick={()=>setVersion("v3")}>Moving arm (v3)</button>
    {bimanual && <button aria-pressed={version==="bimanual"} onClick={()=>setVersion("bimanual")}>Two-arm manipulation</button>}
    <button aria-pressed={version==="v1"} onClick={()=>setVersion("v1")}>Held arm (v1)</button>
  </div>{version==="bimanual" && bimanual ? <BimanualValveStudy report={bimanual} showDemos={showDemos}/> : version==="v3" ? <ArticulatedEmbodimentStudy report={articulated as ArticulatedReport} showDemos={showDemos}/> : <HeldArmStudy report={report} showDemos={showDemos}/>}</>;
}
function HeldArmStudy({report,showDemos}:{report:Report;showDemos:boolean}) {
  const [robot, setRobot] = useState("rex");
  const movie = films.find(f=>f.robot===robot);
  const colors=["var(--chart-first, #163e52)","var(--chart-second, #087fbd)"];
  return <>
    <p className="research-insight">The same tool trajectory produces different contact on two native robot/controller configurations.</p>
    <p className="research-context">PressButton · 30 paired reset seeds · free-floating bases · held arm-joint targets. Native dimensions, mass, motor limits and PID gains are retained. These are scripted-control results.</p>
    <div className="research-comparison embodiment-comparison"><div>
    <div className="research-legend">{report.robots.map((r,i)=><span key={r.robot}><i style={{background:colors[i]}}/>{r.label} · {r.successes}/{r.episodes}</span>)}</div>
    <div className="research-plots">{(["travel_mean_mm","error_mean_mm"] as const).map(metric=>{
      const travel=metric==="travel_mean_mm";
      const max=travel?10:Math.max(10,Math.ceil(Math.max(...report.robots.flatMap(r=>r.series.map(p=>p.error_high_mm)))/10)*10);
      return <svg key={metric} className="research-plot" viewBox="0 0 430 300" role="img" aria-label={travel?"Measured button travel by robot":"Tool tracking error by robot"}>
        <text x="48" y="22" className="plot-title">{travel?"Button travel (mm)":"Tool tracking error (mm)"}</text>
        {[0,.25,.5,.75,1].map(t=><g key={t}><line x1="48" x2="410" y1={238-t*180} y2={238-t*180} stroke="#dfe4e7"/><text x="38" y={242-t*180} textAnchor="end" className="plot-tick">{(t*max).toFixed(travel?1:0)}</text></g>)}
        {travel&&<><line x1="48" x2="410" y1={238-4/max*180} y2={238-4/max*180} stroke="#747e86" strokeDasharray="5 4"/><text x="402" y={230-4/max*180} textAnchor="end" className="plot-tick">4 mm threshold</text></>}
        {report.robots.map((r,i)=><g key={r.robot} data-robot={r.robot} data-successes={r.successes}>
          {!travel&&<polygon points={[...r.series.map(p=>`${48+p.time_s*18},${238-p.error_low_mm/max*180}`),...r.series.slice().reverse().map(p=>`${48+p.time_s*18},${238-p.error_high_mm/max*180}`)].join(" ")} fill={colors[i]} opacity=".1"/>}
          <polyline points={r.series.map(p=>`${48+p.time_s*18},${238-p[metric]/max*180}`).join(" ")} fill="none" stroke={colors[i]} strokeWidth="2.5"/>
        </g>)}
        {[0,5,10,15,20].map(t=><text key={t} x={48+t*18} y="263" textAnchor="middle" className="plot-tick">{t}</text>)}
        <text x="230" y="289" textAnchor="middle" className="plot-tick">Time (s)</text>
      </svg>;
    })}</div>
    <p className="research-context">Lines: mean over 30 paired initial displacements. Tracking bands: 10th–90th percentiles. The success contract also requires tool alignment, distance, base stability and sustained pressing. Native PID gains differ, so this is a system comparison, not an isolated ranking of robot designs.</p>
    </div><div>{showDemos && movie && <>
      {films.length > 1 && <div className="research-switches" role="group" aria-label="Robot demonstration">{films.map(f=><button key={f.robot} aria-pressed={robot===f.robot} onClick={()=>setRobot(f.robot)}>{f.robot==="rex"?"RexROV2 + Oberon7":"BlueROV2 + Reach Alpha"}</button>)}</div>}
      <div className="research-film external-view"><ExpertDemo key={movie.video_sha256} src={`${movie.video}?v=${movie.video_sha256.slice(0,12)}`} poster={`${movie.poster}?v=${movie.video_sha256.slice(0,12)}`} label={`${robot} scripted held-arm PressButton, seed42`} /><div className="research-film-caption"><strong>{robot==="rex"?"RexROV2 + Oberon7":"BlueROV2 + Reach Alpha"}</strong><span>{movie.success?"Success":"Failure"}</span></div></div>
      <p className="research-context">Uncut external-camera demonstration · scripted held-arm control · separate seed42 take, not a learned policy or the 30-seed score.</p>
    </>}</div></div>
    <details><summary>Physical model and verification</summary><p>{report.numerical_limit}</p><p>Rex propellers follow realized motor forces; displayed rotation is slowed for video readability. Vehicle motion plays in real time.</p><p>Both motors-disabled controls fail to press. Rex physical feasibility retains the same outcomes at 240 and 480 Hz; this does not establish moving-arm or hardware validity.</p><a href="./static/embodiment-study.json">Download verified traces summary ↗</a></details>
    <p className="research-context">Historical v1 result, retained unchanged. The independently validated moving-arm study is available under Moving arm (v3); its model and controller changes are disclosed separately.</p>
  </>;
}
