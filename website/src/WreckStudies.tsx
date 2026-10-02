import { CorrectedWreckStudy } from "./CorrectedWreckStudy";
import { useState } from "react";
import { ExpertDemo } from "./ExpertDemo";
import cabin from "../public/static/cabin-recovery/results.json";
import cargo from "../public/static/cargo-release/results.json";
import followup from "../public/static/wreck-followup/results.json";

function HistoricalWreckStudies() {
  const [task, setTask] = useState<"cargo" | "cabin">("cargo");
  const data = task === "cargo" ? cargo : cabin;
  const directory = task === "cargo" ? "cargo-release" : "cabin-recovery";
  return <details className="wreck-study" id="wreck-results" open>
    <summary>Shipwreck tasks · ACT, DP & π₀</summary>
    <p className="research-context">Wrist RGB + measured robot state · robot flashlights only · 80 recorded trajectories · 30 independent reset seeds per model. One training seed; π₀ uses a frozen vision-language backbone.</p>
    <div className="research-switches" role="group" aria-label="Shipwreck result task">
      <button aria-pressed={task === "cargo"} onClick={() => setTask("cargo")}>Cargo release</button>
      <button aria-pressed={task === "cabin"} onClick={() => setTask("cabin")}>HDD recovery · historical v1</button>
    </div>
    {task === "cabin" && <p className="wreck-caveat">Historical protocol: a cabinet-door collision defect was found after these runs. The corrected expert is shown in Task environments. These scores do not evaluate the corrected scene; the corrected-scene evaluation is reported above.</p>}
    <div className="research-comparison">
      <div><svg className="research-plot" viewBox="0 0 450 300" role="img" aria-label={`${task} learned policy success`}>
        <text x="45" y="23" className="plot-title">Complete task · success (%)</text>
        {[0,25,50,75,100].map(v => <g key={v}><line x1="45" x2="425" y1={230-v*1.7} y2={230-v*1.7} stroke="#dfe4e7"/><text x="35" y={234-v*1.7} textAnchor="end" className="plot-tick">{v}</text></g>)}
        {data.results.map((r,i) => {const x=110+i*120, value=100*r.successes/r.attempts, color=["#163e52","#087fbd","#267d88"][i]; return <g key={r.model} data-wreck-model={r.model} data-successes={r.successes}>
          <title>{r.model}: {r.successes}/{r.attempts}</title><rect x={x-20} y={230-value*1.7} width="40" height={value*1.7} fill={color}/>
          <line x1={x} x2={x} y1={230-r.exact_binomial_95[0]*170} y2={230-r.exact_binomial_95[1]*170} stroke={color}/>
          {r.exact_binomial_95.map((v,j)=><line key={j} x1={x-5} x2={x+5} y1={230-v*170} y2={230-v*170} stroke={color}/>)}
          <circle cx={x} cy={230-value*1.7} r="3" fill={color}/><text x={x} y="255" textAnchor="middle" className="plot-tick">{r.model === "PI0" ? "π₀" : r.model}</text><text x={x} y="279" textAnchor="middle" className="plot-tick">{r.successes}/{r.attempts}</text>
        </g>;})}
      </svg><p className="research-context">Exact 95% binomial intervals over reset episodes. <a href={`./static/${directory}/results.json`}>Results and subtask evidence ↗</a></p></div>
    </div>
    <details><summary>ACT/DP follow-up · development validation</summary>
      <p className="research-context">Expert-command replay: 12/12 across three sampling schemes. Improved predictions on expert states have not yet produced successful closed-loop cutting. This historical diagnostic predates the completed 30-state comparison shown above.</p>
      <div className="table-scroll"><table><caption>Cargo release · four validation states, not test scores</caption><thead><tr><th>Policy</th><th>Targets</th><th>Images</th><th>Success</th></tr></thead><tbody>{followup.results.map(r=><tr key={`${r.model}-${r.action_mode}`}><td>{r.model}</td><td>{r.action_mode}</td><td>{r.image_pipeline}</td><td>{r.successes}/{r.episodes}</td></tr>)}</tbody></table></div>
      <p><a href="./static/wreck-followup/README.md">Diagnosis and scope ↗</a> · <a href="https://github.com/dancher00/wasserman/blob/main/docs/extended-studies.md">Historical study scope ↗</a></p>
    </details>
  </details>;
}

export function WreckWater() {
  const [task,setTask] = useState("cabin");
  const [camera,setCamera] = useState("gripper");
  const [water,setWater] = useState("coastal");
  const path=`./static/wreck-water/${task}/${camera}_${water}`;
  return <article className="wreck-water-study" id="wreck-water">
    <h3>Through the water</h3>
    <p>One physical expert trajectory, four water appearances. Compare refraction, attenuation, backscatter and suspended particles through either robot camera.</p>
    <div className="research-switches" role="group" aria-label="Water demonstration task">{[["cabin","HDD recovery"],["rope","Cargo release"]].map(([id,label])=><button key={id} aria-pressed={task===id} onClick={()=>setTask(id)}>{label}</button>)}</div>
    <div className="research-switches" role="group" aria-label="Water camera">{["gripper","base"].map(id=><button key={id} aria-pressed={camera===id} onClick={()=>setCamera(id)}>{id === "gripper" ? "Gripper camera" : "Base camera"}</button>)}</div>
    <div className="research-switches" role="group" aria-label="Water appearance">{[["reference","RTX reference"],["clear","Clear"],["coastal","Coastal"],["silt","Silty"]].map(([id,label])=><button key={id} aria-pressed={water===id} onClick={()=>setWater(id)}>{label}</button>)}</div>
    <div className="wreck-water-film"><ExpertDemo key={path} src={`${path}.mp4`} poster={`${path}.jpg`} label={`${task} expert, ${camera} camera, ${water} water`}/></div>
    <p className="research-context">Paired RGB-D renderings with illustrative optical coefficients, not calibrated water measurements. State-feedback experts; learned policies were not evaluated under these water appearances.</p>
    <a href="./static/wreck-water/">Synchronized four-condition comparison ↗</a>
  </article>;
}

export function WreckStudies() { return <><CorrectedWreckStudy /><details><summary>Historical v1 results and development diagnostics</summary><HistoricalWreckStudies /></details></>; }
