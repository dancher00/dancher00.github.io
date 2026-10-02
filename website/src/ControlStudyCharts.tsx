import { useEffect, useState } from "react";

type Configuration = {
  angle_series: {time_s: number; mean_deg: number; low_deg: number; high_deg: number}[];
  controller: string; successes: number; episodes: number; success_percent: number;
  success_ci95: number[]; position_error_rms_by_episode: number[];
  position_error_rms_mean: number; median_success_time_s: number | null;
};
type Report = { complete: boolean; configurations: Configuration[]; note: string };
export function useControlStudy() {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => {
    let active = true;
    async function read() {
      try {
        const response = await fetch("./static/policy-control-study.json", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (active && data.complete && data.configurations?.length === 2) setReport(data);
      } catch { /* Pending experiment; show the explicit pending state. */ }
    }
    void read(); const timer = setInterval(read, 30000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return report;
}
export function ControlStudyCharts({ report }: { report: Report }) {
  return <>
    <p className="research-insight">One frozen diffusion policy, two station-keeping controllers.</p>
    <p className="research-context">OpenHatch · 30 fresh paired reset seeds · PID versus PD. Only the position and attitude integral gains change; policy weights, P/D gains, robot and task criteria stay fixed.</p>
    <div className="research-plots">{[false, true].map(tracking => {
      const max = tracking ? Math.max(10, Math.ceil(Math.max(...report.configurations.flatMap(c=>c.position_error_rms_by_episode))*1000/10)*10) : 100;
      return <svg key={String(tracking)} viewBox="0 0 330 310" className="research-plot" role="img" aria-label={tracking ? "Base tracking error by controller" : "Success by controller"}>
        <text x="40" y="20" className="plot-title">{tracking ? "Base tracking RMSE (mm)" : "Task success (%)"}</text>
        {[0,.25,.5,.75,1].map(t=><g key={t}><line x1="40" x2="315" y1={240-t*180} y2={240-t*180} stroke="#dfe4e7"/><text x="32" y={244-t*180} textAnchor="end" className="plot-tick">{Math.round(max*t)}</text></g>)}
        {report.configurations.map((c,i)=>{
          const x=115+i*120, color=i===0?"#163e52":"#087fbd";
          const value=tracking?c.position_error_rms_mean*1000:c.success_percent;
          return <g key={c.controller} data-controller={c.controller} data-metric={tracking?"tracking":"success"} data-value={value}>
            <title>{c.controller}: {tracking?`${value.toFixed(1)} mm mean RMSE`:`${c.successes}/${c.episodes} successful`}</title>
            {tracking ? c.position_error_rms_by_episode.map((v,j)=><circle key={j} cx={x+(j%7-3)*4} cy={240-v*1000/max*180} r="3" fill={color} opacity=".35"/>) : <>
              <rect x={x-22} y={240-value/max*180} width="44" height={value/max*180} fill={color}/>
              <line x1={x} x2={x} y1={240-c.success_ci95[0]/max*180} y2={240-c.success_ci95[1]/max*180} stroke="#626d75"/>
              {c.success_ci95.map((v,j)=><line key={j} x1={x-7} x2={x+7} y1={240-v/max*180} y2={240-v/max*180} stroke="#626d75"/>)}
            </>}
            {tracking&&<line x1={x-23} x2={x+23} y1={240-value/max*180} y2={240-value/max*180} stroke={color} strokeWidth="3"/>}
            <text x={x} y={tracking?290:230-Math.max(value,c.success_ci95[1])/max*180} textAnchor="middle" className="plot-tick">{value.toFixed(1)}{tracking?" mm":"%"}</text>
            <text x={x} y="267" textAnchor="middle" className="plot-tick">{c.controller}</text>
          </g>;
        })}
      </svg>;
    })}</div>
    <div className="research-plots"><svg viewBox="0 0 460 260" className="research-plot" role="img" aria-label="Hatch opening through time by controller">
      <text x="48" y="20" className="plot-title">Hatch opening (degrees)</text>
      {[0,30,60,90].map(v=><g key={v}><line x1="48" x2="435" y1={205-v*1.6} y2={205-v*1.6} stroke="#dfe4e7"/><text x="38" y={209-v*1.6} textAnchor="end" className="plot-tick">{v}</text></g>)}
      {[0,15,30,45,60].map(t=><text key={t} x={48+t*6.4} y="228" textAnchor="middle" className="plot-tick">{t}</text>)}
      {report.configurations.map((c,i)=>{const color=i===0?"#163e52":"#087fbd";return <g key={c.controller}>
        <polygon points={[...c.angle_series.map(p=>`${48+p.time_s*6.4},${205-p.low_deg*1.6}`),...c.angle_series.slice().reverse().map(p=>`${48+p.time_s*6.4},${205-p.high_deg*1.6}`)].join(" ")} fill={color} opacity=".10"/>
        <polyline points={c.angle_series.map(p=>`${48+p.time_s*6.4},${205-p.mean_deg*1.6}`).join(" ")} fill="none" stroke={color} strokeWidth="2.5"/>
        <text x={60+i*90} y="44" fill={color} fontSize="12">{c.controller}</text>
      </g>})}<text x="240" y="253" textAnchor="middle" className="plot-tick">Time (s)</text>
    </svg><p className="research-context">Similar average base tracking error can conceal a large difference in task completion. Lines show mean opening; shading shows the 10th–90th percentiles across reset seeds. A successful episode holds its terminal value. Opening angle alone is not the success criterion.</p></div>
    <p className="research-context">Success whiskers: exact 95% binomial intervals. Tracking dots: one episode each; horizontal marks: mean. Tracking uses active first-episode steps, so successful and failed episodes have different durations. One training seed.</p>
    <a href="./static/policy-control-study.json">Download the measured results ↗</a>
  </>;
}
