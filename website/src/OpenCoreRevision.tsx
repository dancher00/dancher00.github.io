import { docsHref } from "./publicationLinks";
import gallery from "./assets/open-core-wrist-gallery.png";
import results from "../../research/revision-v2-primary-results.json";

export function OpenCoreRevision() {
  return <article className="open-core-revision" aria-label="Open core revision">
    <div>
      <span className="eyebrow">Open procedural core</span>
      <h3>Six tasks without restricted arm CAD</h3>
      <p>The open procedural core uses distributable arm geometry and a fixed evaluation protocol. It specifies three independent training runs for ACT, diffusion policy and a simple behavioral-cloning baseline, matched training sample budgets and the same final-checkpoint rule.</p>
      <p>Demonstrations and trained ACT, DP, BC and SmolVLA policies are publicly available on Hugging Face. Task contracts, fixed splits, checkpoint configurations and per-episode physical evidence support the reported comparisons. See <a href={docsHref("revision-v2-packages")}>data and models</a> and the <a href={docsHref("policy-studies")}>paired policy studies</a>.</p>
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
      <p>The comparison uses declared implementations with equal sampled training windows. Encoders, observation history and compute remain implementation-specific. Each outcome is tied to its checkpoint, ordered reset cohort, source version and full task horizon.</p>
      <a href={docsHref("revision-v2-protocol")}>Read the frozen protocol ↗</a>
      <p><a href={docsHref("revision-v2-reproduction")}>Reproduction records and commands ↗</a></p>
    </div>
    <figure>
      <a href={gallery} target="_blank" rel="noreferrer" aria-label="Open full-size wrist-camera task gallery">
        <img src={gallery} width="2115" height="780" loading="lazy" alt="Wrist-camera observations of PressButton, RotateValve, OpenHatch, CollectShell, PushSlider and PullLever using procedural fingers; two expert frames per task." />
      </a>
      <figcaption>Actual expert observations at 25% and 75% of each development episode. Presentation frames illustrate policy inputs; they are not learned-policy test results.</figcaption>
    </figure>
  </article>;
}
