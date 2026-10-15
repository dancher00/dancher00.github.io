import { docsHref } from "./publicationLinks";

const studies = [
  { title: "Current visual feedback", text: "Holding the first wrist image removes completion in both tasks. Reassigning current images affects valve and hatch execution differently.", anchor: "current-visual-feedback" },
  { title: "Physical sensitivity", text: "Contact, actuator delay, arm properties and mechanism pose are varied with matched expert references. Hatch placement changes separate learned behavior from task feasibility.", anchor: "physical-sensitivity-and-expert-references" },
  { title: "History and demonstrations", text: "Matched training arms compare current observations, temporal history and an expert trajectory mixture. Graded placement tests reveal where their responses differ.", anchor: "observation-history-and-demonstration-mixture" },
  { title: "Demonstration selection", text: "Complete candidate streams cover all six learning tasks. Initial-state distributions retain successful and failed attempts alongside the original selection masks.", anchor: "expert-candidates-and-demonstration-selection" },
  { title: "Contact and actuator use", text: "Paired measurements track grasp, mechanism progress, stabilization, joint error and actuator demand over a common exposure, alongside full-horizon completion.", anchor: "contact-tracking-and-actuation" },
  { title: "Full-episode task completion", text: "Translated hatch episodes can establish contact yet never reach the required opening-angle window. Physical traces identify which task condition remains unsatisfied.", anchor: "contact-tracking-and-actuation" },
];

export function PolicyStudies() {
  return <section className="landing-section landing-width" id="policy-studies" aria-labelledby="policy-studies-title">
    <div className="landing-heading"><h2 id="policy-studies-title">Policy and execution studies</h2><p>Paired interventions connect policy behavior to observations, physical conditions and training choices. Each comparison keeps its own native reference and task contract.</p></div>
    <div className="landing-start-grid">{studies.map(study => <a href={docsHref("policy-studies") + "#" + study.anchor} key={study.title}><h3>{study.title} ↗</h3><p>{study.text}</p></a>)}</div>
    <p className="landing-note"><a href={docsHref("policy-studies")}>Results and protocols ↗</a> · <a href="https://huggingface.co/datasets/dancher00/WasserMan-Review-v3">Datasets, checkpoints and evaluation records on Hugging Face ↗</a></p>
  </section>;
}
