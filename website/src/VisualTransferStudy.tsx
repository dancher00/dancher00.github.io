import { useState } from "react";
import results from "./assets/visual-transfer/results.json";
import csvUrl from "./assets/visual-transfer/results.csv?url";
import auditUrl from "./assets/visual-transfer/audit.json?url";
import provenanceUrl from "./assets/visual-transfer/provenance.json?url";
import "./visual-transfer.css";

const extension = "https://huggingface.co/datasets/dancher00/WasserMan-Review-v3";
const conditions: Record<string, string> = {
  "native-light1.0": "Native",
  "clear-light1.0": "Clear",
  "coastal-light1.0": "Coastal",
  "harbor-light1.0": "Harbor",
  "native-light0.5": "Dim · 0.5×",
  "native-light1.5": "Bright · 1.5×",
};
const tasks = [["RotateValve", "Rotate valve"], ["OpenHatch", "Open hatch"]];
const signed = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;

export function VisualTransferStudy() {
  const [task, setTask] = useState("RotateValve");
  const [implementation, setImplementation] = useState("ACT");
  const rows = results.filter(row => row.task === task && row.implementation === implementation);
  const title = `${tasks.find(([id]) => id === task)![1]} · ${implementation}`;
  return <section className="landing-section landing-width visual-transfer" aria-labelledby="visual-transfer-title">
    <div className="landing-heading">
      <h2 id="visual-transfer-title">Transfer across visual conditions</h2>
      <p>Change water appearance and lighting, then run the same trained policy. Physical task completion is measured with matched initial conditions and fixed policy weights.</p>
    </div>
    <div className="visual-transfer-controls">
      <div className="optics-options" role="group" aria-label="Visual transfer task">{tasks.map(([id, name]) => <button key={id} aria-pressed={task === id} onClick={() => setTask(id)}>{name}</button>)}</div>
      <div className="optics-options" role="group" aria-label="Visual transfer implementation">{["ACT", "DP"].map(name => <button key={name} aria-pressed={implementation === name} onClick={() => setImplementation(name)}>{name}</button>)}</div>
    </div>
    <div className="study-chart visual-transfer-chart">
      <h3>{title}</h3>
      <svg viewBox="0 0 600 340" role="img" aria-label={`${title}: physical task completion under six visual conditions. ${rows.map(row => `${conditions[row.condition]} ${row.completion_percent.toFixed(1)} percent`).join("; ")}.`}>
        {[0, 25, 50, 75, 100].map(value => <g key={value}>
          <line x1={130 + value * 4} x2={130 + value * 4} y1="12" y2="296" stroke="var(--dark-line, #dce5ed)" />
          <text x={130 + value * 4} y="322" textAnchor="middle" fontSize="14" fill="currentColor">{value}%</text>
        </g>)}
        {rows.map((row, index) => {
          const y = 33 + index * 47;
          const low = 130 + row.descriptive_95_low_percent * 4;
          const high = 130 + row.descriptive_95_high_percent * 4;
          return <g key={row.condition}>
            <text x="0" y={y + 5} fontSize="15" fill="currentColor">{conditions[row.condition]}</text>
            <rect x="130" y={y - 13} width={row.completion_percent * 4} height="26" rx="2" fill="var(--dark-link, #146da9)" opacity=".2" />
            <line x1={low} x2={high} y1={y} y2={y} stroke="var(--dark-link, #146da9)" strokeWidth="2" />
            {[low, high].map((x, i) => <line key={i} x1={x} x2={x} y1={y - 7} y2={y + 7} stroke="var(--dark-link, #146da9)" strokeWidth="2" />)}
            <circle cx={130 + row.completion_percent * 4} cy={y} r="5" fill="var(--dark-link, #146da9)" />
            <text x="592" y={y + 5} textAnchor="end" fontSize="15" fontWeight="650" fill="currentColor">{row.completion_percent.toFixed(1)}</text>
          </g>;
        })}
      </svg>
      <p>Mean completion across three training seeds, with 30 paired resets per seed. Lines show descriptive 95% intervals that account for training runs and reset identities.</p>
    </div>
    <p className="landing-note">Native, clear, coastal and harbor use the same lighting. Dim and bright change lighting under native appearance. Each condition includes all 90 episodes and uses the unchanged physical success criterion over the full task horizon. This study uses a separate reset block from the primary comparison.</p>
    <details className="study-numbers">
      <summary>Completion and paired changes</summary>
      <div className="visual-transfer-table"><table>
        <caption>{title} · change from native appearance and lighting</caption>
        <thead><tr><th scope="col">Condition</th><th scope="col">Completion (%)</th><th scope="col">Change (pp)</th><th scope="col">Descriptive 95% interval (pp)</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.condition}><th scope="row">{conditions[row.condition]}</th><td>{row.completion_percent.toFixed(1)}</td><td>{signed(row.paired_change_pp)}</td><td>{signed(row.paired_change_descriptive_95_low_pp)} to {signed(row.paired_change_descriptive_95_high_pp)}</td></tr>)}</tbody>
      </table></div>
    </details>
    <p className="landing-note visual-transfer-downloads"><a href={csvUrl} download="wasserMan-visual-transfer.csv">Results & per-training-seed rates (CSV) ↓</a><a href={auditUrl} download="wasserMan-visual-transfer-audit.json">Paired episode outcomes (JSON) ↓</a><a href={provenanceUrl} download="wasserMan-visual-transfer-provenance.json">Checksums & provenance ↓</a></p>
    <div className="landing-heading visual-transfer-resources"><h3>Data and models</h3><p>Datasets, policy checkpoints and evaluation records are available on <a href={extension}>Hugging Face ↗</a>.</p></div>
    <div className="landing-start-grid">
      <a href={`${extension}/tree/main/diverse-demonstrations/OpenHatch`}><span>Expert trajectories</span><h3>OpenHatch demonstrations ↗</h3><p>Recorded approach and opening variations, lossless RGB, robot state, commands and physical task evidence.</p></a>
      <a href={`${extension}/tree/main/models`}><span>Policy checkpoints</span><h3>Observation history & demonstration mixture ↗</h3><p>Diffusion Policy checkpoints, training configurations and logs for the observation-history and demonstration-mixture studies.</p></a>
      <a href={`${extension}/tree/main/coverage`}><span>Expert coverage</span><h3>Complete candidate streams ↗</h3><p>Initial states and physical outcomes for PressButton, RotateValve and OpenHatch, including the original selected-demonstration mask.</p></a>
    </div>
  </section>;
}
