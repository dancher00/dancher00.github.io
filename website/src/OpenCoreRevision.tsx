import { docsHref } from "./publicationLinks";
import gallery from "./assets/open-core-wrist-gallery.png";
import results from "../../research/revision-v2-primary-results.json";

export function OpenCoreRevision() {
  return <article className="open-core-revision" aria-label="Open core revision">
    <div>
      <span className="eyebrow">Open procedural core · completed experiments</span>
      <h3>Six tasks without restricted arm CAD</h3>
      <p>The new version uses distributable arm geometry and a fixed evaluation protocol. It specifies three independent training runs for ACT, diffusion policy and a simple behavioral-cloning baseline, matched training sample budgets and the same final-checkpoint rule.</p>
      <p>All six task packages passed authenticated download, restoration and physical data-audit checks, including 480 selected demonstrations and all 60 final models. All 54 primary evaluations passed physical success rescoring. All 42 controller and 12 interface cohorts are complete. Anonymous delivery of the full new release remains pending.</p>
      <div className="table-scroll">
        <table>
          <caption>Open-core success (%): mean ± sample SD across three trainings, 30 resets each</caption>
          <thead><tr><th scope="col">Task</th>{["ACT", "DP", "BC"].map(model => <th scope="col" key={model}>{model}</th>)}</tr></thead>
          <tbody>{results.rows.filter(row => row.model === "ACT").map(({ task }) =>
            <tr key={task}><th scope="row">{task}</th>{["ACT", "DP", "BC"].map(model => {
              const row = results.rows.find(value => value.task === task && value.model === model)!;
              return <td key={model}>{(row.mean * 100).toFixed(1)} ± {(row.training_run_sd * 100).toFixed(1)}</td>;
            })}</tr>
          )}</tbody>
        </table>
      </div>
      <p>These compare declared implementations with equal sampled training windows, not equal compute or encoders. Zero observed SD does not establish certainty. On a second workstation, the same checkpoints agreed on 1,438 of 1,620 episode outcomes; 182 differed. One full training and evaluation were reproduced exactly in a clean checkout on the same GPU.</p>
      <a href={docsHref("revision-v2-protocol")}>Read the frozen protocol ↗</a>
      <p><a href={docsHref("revision-v2-reproduction")}>Reproduction evidence and limits ↗</a></p>
    </div>
    <figure>
      <a href={gallery} target="_blank" rel="noreferrer" aria-label="Open full-size wrist-camera task gallery">
        <img src={gallery} width="2115" height="780" loading="lazy" alt="Wrist-camera observations of PressButton, RotateValve, OpenHatch, CollectShell, PushSlider and PullLever using procedural fingers; two expert frames per task." />
      </a>
      <figcaption>Actual expert observations at 25% and 75% of each development episode. Presentation frames illustrate policy inputs; they are not learned-policy test results.</figcaption>
    </figure>
  </article>;
}
