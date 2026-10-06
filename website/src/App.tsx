import publication from "../publication.json";
import { docsHref } from "./publicationLinks";
import { WallTossStudy } from "./WallTossStudy";
import { ExpertMultiview } from "./ExpertMultiview";
import taskViews from "./taskDemonstrations.json";
import { UnderwaterImaging } from "./UnderwaterImaging";
import { ProjectFooter } from "./ProjectFooter";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectLogo } from "./ThemedImage";
import modelBenchmarks from "./modelBenchmarks.json";
import { BenchmarkStudies } from "./BenchmarkStudies";
import { OpenCoreRevision } from "./OpenCoreRevision";
import { useState } from "react";
import { ExpertDemo } from "./ExpertDemo";
import { CinemaPlayer } from "./CinemaPlayer";
import { TaskVariation } from "./TaskVariation";
import { PhysicalEffectsLab } from "./PhysicalEffectsLab";
import { EffectsDemos } from "./EffectsDemos";
import { effects, groups, groupDescriptions, tasks } from "./benchmark";
import buttonCameraDemo from "../fixtures/press_button_registered_grounded_v1_demo.json";

const demoAliases: Record<string, keyof typeof taskViews> = { RecoverData: "CabinRecovery", CutRope: "CargoRelease", TossBall: "WallToss" };
const viewsForTask = (id: string) => taskViews[demoAliases[id] ?? id as keyof typeof taskViews];

const repo = publication.repository_url;
const mediaVersion = "grounded-presentation-v1";
const sceneMedia: Record<string, string> = {
  PushSlider: "push-slider",
  PullLever: "pull-lever",
};
const nav = [
  ["open-core", "Open core"],
  ["tasks", "Tasks"],
  ["embodiments", "Embodiments"],
  ["physical-effects", "Physical effects"],
  ["results", "Results"],
];
const citation = publication.citation;
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`badge ${children === "Validated" || children === "Implemented" ? "ready" : ""}`}
    >
      {children}
    </span>
  );
}
function Title({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{number} / WasserMan</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
function App() {
  const [menu, setMenu] = useState(false);
  const [effect, setEffect] = useState(0);
  const [randomization, setRandomization] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const activeEffect = effects[effect];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Select the citation below to copy it.");
    }
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header>
        <div className="page-shell nav-shell">
          <a className="wordmark" href="./">
            <ProjectLogo />
            WasserMan
          </a>
          <ThemeToggle />
          <button
            className="menu-toggle"
            aria-expanded={menu}
            aria-controls="navigation"
            onClick={() => setMenu(!menu)}
          >
            Menu
          </button>
          <nav id="navigation" className={menu ? "open" : ""}>
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <a
              className="nav-docs"
              href={docsHref()}
              onClick={() => setMenu(false)}
            >
              Docs ↗
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="hero page-shell" id="top">
          <p className="eyebrow">Research preview · open-core experiments complete</p>
          <h1>
            <span>WasserMan:</span> Benchmark for
            <br className="desktop-break" />
            <em> Underwater Manipulation Policy Learning</em>
          </h1>
          <p className="hero-contribution">
            Six contact tasks connect expert replay, learned policies and controller
            interventions. Fixed protocols and replayable physical traces make
            each result auditable.
          </p>
          <div className="hero-meta">
            Isaac Sim 6.1 · Open asset profile · Fixed evaluation protocol
          </div>
          <div className="resource-row">
            <a className="button primary" href={repo}>
              Code · private preview ↗
            </a>
            <a className="button" href={docsHref()}>
              Documentation ↗
            </a>
            <a className="button" href="#open-core">
              Evidence and status ↓
            </a>
            
            <span className="unavailable">Dataset · not released</span>
          </div>
          <div className="release-note">
            <strong>Development snapshot</strong>
            <span>
              Six open-core tasks · ACT / DP / chunked BC / SmolVLA · Three training seeds per configuration
            </span>
          </div>
        </section>
        <section className="page-shell" id="open-core" aria-label="Open-core protocol and evidence">
          <OpenCoreRevision />
        </section>
        <section className="section-block page-shell" id="architecture">
          <Title number="01" title="One benchmark. Independent design choices.">
            Connect visual decisions to control, contact and water forces under
            explicit task contracts.
          </Title>
          <div className="architecture">
            {[
              ["Task", "Goal · scene · success", "Six open-core task contracts"],
              ["Policy", "Observations → actions", "ACT / Diffusion Policy / BC"],
              [
                "Control",
                "Pose → body wrench",
                "Geometric station-keeping PID",
              ],
              [
                "Embodiment + water",
                "Robot · contacts · fluid forces",
                "Explicit geometry and fluid assumptions",
              ],
            ].map(([title, text, detail]) => (
              <div key={title}>
                <small>{detail}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <p className="section-note">
            Wrist RGB and measured robot state → visual policy → EE targets with IK,
            or base/joint targets → tracking and motor allocation → physical contact
            and per-link hydrodynamics. The composite robot model is not tank- or CFD-calibrated.
          </p>
        </section>
        <section
          className="page-shell overview"
          id="press-button-overview"
          aria-label="Benchmark overview"
        >
          <h2>Historical demonstration archive</h2>
          <p className="research-context">The films and extended task catalog below use earlier asset versions. They document prior engineering studies; they are not outcomes of the new open-core evaluation.</p>
          <div className="video-frame">
            <CinemaPlayer
              label="PressButton staged rollout"
              poster={`./static/recordings/press-button/registered-grounded-v1/poster.jpg?v=${buttonCameraDemo.video_sha256.slice(0, 12)}`}
              src={`${buttonCameraDemo.video_url}?v=${buttonCameraDemo.video_sha256.slice(0, 12)}`}
              cameraStreams={buttonCameraDemo.camera_streams}
              chapters={buttonCameraDemo.chapters}
              caption="HYBRID STATE CONTROLLER"
            />
            <div className="video-caption">
              <span>PressButton · BlueROV2 Heavy + Reach Alpha 5</span>
              <span>1.7 m start / physical T200 / uncut · 1×</span>
            </div>
          </div>
          <p className="media-note">A continuous 1.7 m approach, arm deployment and sustained press. Task recording; model evaluations appear in Results.</p>
          <details className="recording-details"><summary>Recording protocol and provenance</summary>
          <p className="recording-provenance">
            A continuous swim-in from a 1.7 m base-to-panel separation, followed by
            settling, arm deployment and one sustained press. The elbow starts
            folded. Waypoint transit and arm deployment precede PPO alignment;
            measured-depth control then holds contact. These stages are not learned end-to-end.
            The camera is choreographed; physics is continuous. No time remapping.
            Propeller direction follows realized motor thrust; displayed RPM is illustrative,
            not a calibrated motor model.
            The button lights green at 4 mm depression and turns off below 3 mm;
            this is a mechanical indicator, not the task-success signal.
            Water colour in this button film is visual styling.
            Separate depth-aware water and vehicle-light comparisons are shown below.
            {" "}Base and gripper feeds share this episode and timeline; they are recordings,
            not inputs to the state-based button policy.
            {" "}This take uses registered-v1 geometry and geometry-v2 camera mounts.
            Earlier task scores and other task films retain their original versions.
            {" "}<a href={buttonCameraDemo.report_url} download>Verified camera recording ↓</a>
          </p>
          </details>
        </section>
        <section className="section-block tinted" id="tasks">
          <div className="page-shell">
            <Title number="02" title="Task catalogue">
              {tasks.length} implemented and proposed scenes grouped by interaction type. Their individual status labels distinguish evaluated tasks from planned extensions; this is not the six-task open-core result set.
            </Title>
            <div className="task-groups">
              {groups.map((group, i) => (
                <details className="task-group" key={group}>
                  <summary>
                    <span className="group-number">0{i + 1}</span>
                    <div className="task-group-heading"><h3>{group}</h3><p>{groupDescriptions[i]}</p></div>
                    <span>
                      {tasks.filter((t) => t.group === i).length} tasks
                    </span>
                    <b aria-hidden="true">+</b>
                  </summary>
                  <div className="task-grid">
                    {tasks
                      .filter((t) => t.group === i)
                      .map((task) => (
                        <article
                          className={`task-card${viewsForTask(task.id) ? " has-rollout" : ""}`}
                          id={task.id === "RotateValve" ? "rotate-valve" : task.id === "OpenHatch" ? "open-hatch" : task.id === "CollectShell" ? "collect-shell" : task.id === "RecoverData" ? "recover-data" : task.id === "CutRope" ? "cut-rope" : undefined}
                          key={task.id}
                        >
                          <div className="task-media">
                            {viewsForTask(task.id) ? (
                              <ExpertMultiview views={viewsForTask(task.id)} label={task.name} />
                            ) : task.id === "OpenChest" ? (
                              <img loading="lazy" src="./static/variations/environment_3.jpg?v=ship-interior-v5" alt="Ship cargo hold; scene illustration, not a task demonstration" />
                            ) : sceneMedia[task.id] ? (
                              <CinemaPlayer
                                compact
                                poster={`./static/${sceneMedia[task.id]}-preview.png?v=${mediaVersion}`}
                                src={`./static/${sceneMedia[task.id]}-preview.mp4?v=${mediaVersion}`}
                                label={`${task.name}: zero-action scene preview`}
                              />
                            ) : (
                              <>
                                <span className="task-monogram">
                                  {task.name
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")}
                                </span>
                                <span>Rollout not available yet</span>
                              </>
                            )}
                          </div>
                          <div className="task-body">
                            <div className="card-heading">
                              <h4>{task.name}</h4>
                              <Badge>{task.status}</Badge>
                            </div>
                            <p>{task.description}</p>
                            {task.id === "TossBall" && <p className="preview-label">One paired expert example; ACT/DP not evaluated. <a href="#wall-toss-study">Still water versus cross-current ↗</a></p>}
                            {task.id === "OpenChest" && <p className="preview-label">Ship-interior scene preview only. The chest still needs a reachable lid handle, articulated hinge and validated grasp before this becomes an opening task.</p>}
                            {sceneMedia[task.id] && !viewsForTask(task.id) && (
                              <p className="preview-label">
                                Scene preview · zero actions, not a trained
                                policy
                              </p>
                            )}
                            <details className="task-spec">
                              <summary>Task specification ↗</summary>
                              <dl>
                                <dt>Task identifier</dt>
                                <dd>{task.id}</dd>
                                <dt>Success contract</dt>
                                <dd>{task.success}</dd>
                                <dt>Randomization</dt>
                                <dd>{task.randomization}</dd>
                                <dt>Underwater adaptation</dt>
                                <dd>{task.adaptation}</dd>
                              </dl>
                            </details>
                          </div>
                        </article>
                      ))}
                  </div>
                </details>
              ))}
            </div>
            <TaskVariation />
            <div className="explorer">
              <h3>Randomization explorer</h3>
              <p>
                Separate visual variability from physical variability. Only
                implemented ranges are active in the current baseline.
              </p>
              <div
                className="tabs"
                role="group"
                aria-label="Randomization category"
              >
                {["Appearance", "Geometry + placement", "Hydrodynamics"].map(
                  (label, i) => (
                    <button
                      key={label}
                      aria-pressed={randomization === i}
                      onClick={() => setRandomization(i)}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
              <div className="explorer-content">
                {randomization === 0 ? (
                  <>
                    <Badge>Surface presets implemented</Badge>
                    <h4>Panel appearance, visibility and lighting</h4>
                    <p>
                      Sourced PBR surface presets cover all six panel faces.
                      Depth-aware water presets and switchable vehicle lamps
                      are available for camera experiments. Optical variations
                      are not part of the validated button state-policy evaluation.
                    </p>
                  </>
                ) : randomization === 1 ? (
                  <>
                    <Badge>Implemented</Badge>
                    <h4>Panel target and initial robot pose</h4>
                    <p>
                      Button lateral position −0.17 to −0.03 m; height 0.70 to
                      0.82 m. Vehicle position, yaw and arm joints vary at
                      reset.
                    </p>
                  </>
                ) : (
                  <>
                    <Badge>Implemented</Badge>
                    <h4>Flow, buoyancy, drag and added mass</h4>
                    <p>
                      Horizontal current 0–0.22 m/s with bounded disturbances.
                      Volume 0.97–1.03×, damping 0.85–1.15× and added mass
                      0.90–1.10× nominal.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="section-block page-shell" id="embodiments">
          <Title number="03" title="Robot embodiments">A work-class vehicle with two arms for cooperative underwater manipulation.</Title>
          <article id="rexrov2" className="bimanual-embodiment">
            <video className="embodiment-film" src="./static/bimanual-valve/two-hands.mp4" poster="./static/bimanual-valve/two-hands.png" controls muted playsInline preload="metadata" aria-label="RexROV2 bimanual valve manipulation" />
            <h3>RexROV2 + twin Oberon7</h3><p>Six thrusters · two six-axis arms + grippers</p>
            <p>Two arms grasp and turn a valve together while the vehicle holds station. A custom bimanual configuration with state-feedback control.</p>
            <a href={docsHref("studies/bimanual-valve-v1-reproduction")}>Robot configuration and bimanual protocol ↗</a>
          </article>
        </section>
        <section className="section-block page-shell" id="physical-effects">
          <Title number="05" title="Water is part of the dynamics.">
            Explore how currents, nearby surfaces and motor response shape underwater motion.
            Optional physical effects bring more of the underwater environment into simulation.
          </Title>
          <EffectsDemos />
          <WallTossStudy />
          <details className="effects-model-details">
            <summary>Model equations and numerical sensitivity</summary>
          <div className="tabs" role="group" aria-label="Physical effect">
            {effects.map((entry, i) => (
              <button
                key={entry.title}
                aria-pressed={effect === i}
                onClick={() => setEffect(i)}
              >
                {entry.title}
              </button>
            ))}
          </div>
          <div className="effect-panel">
            <div className="equation">{activeEffect.equation}</div>
            <div>
              <Badge>{activeEffect.state}</Badge>
              <h3>{activeEffect.title}</h3>
              <p>{activeEffect.text}</p>
              <code>{activeEffect.range}</code>
            </div>
          </div>
          <PhysicalEffectsLab effect={activeEffect.title} />
          </details>
          <UnderwaterImaging />
        </section>
        <section className="section-block research-results" id="results">
          <div className="page-shell">
            <Title number="06" title="Historical results">
              Prior asset versions and exploratory studies retain their original protocols and scores. Current open-core evidence and remaining work are listed at the top of this page.
            </Title>
            <p><a href="#open-core">Open-core protocol and reproduction status ↑</a></p>
            <details className="study model-study">
              <summary><span className="research-disclosure-title"><strong>Studies and demonstrations</strong><small>Policies, control and embodiments</small></span></summary>
              <div className="study-body">
                <BenchmarkStudies />
                <details className="benchmark-evidence"><summary>Evaluation protocols & numerical results</summary>
            <div className="table-scroll">
              <table className="model-results">
                <caption>Measured model performance under each task's stated protocol</caption>
                <thead><tr><th>Task</th><th>Model</th><th>Input</th><th>Success</th><th>Median completion</th></tr></thead>
                <tbody>
                  {modelBenchmarks.rows.map((row) => <tr key={`${row.task}-${row.model}`}>
                    <td>{row.task}</td><td>{row.model}</td><td>{row.input}</td>
                    <td>{row.successes}/{row.episodes} · {(100 * row.successes / row.episodes).toFixed(1)}%</td>
                    <td>{row.median_success_time_s === null ? "—" : `${row.median_success_time_s.toFixed(1)} s`}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="benchmark-protocols">
              {modelBenchmarks.protocols.map((protocol) => <p key={protocol.task}>
                <strong>{protocol.task}.</strong> {protocol.description}
              </p>)}
              <p>One training seed per model. RotateValve's 30/30 score has an exact 95% binomial interval of 88.4–100%; it does not estimate variation across training runs. These results apply to the declared robot, physics and evaluation horizon.</p>
              <p><a href="./static/model-benchmarks.json" download>Benchmark data ↓</a>{" · "}<a href="./static/rotate-valve-model-benchmarks.json" download>RotateValve evaluation report ↓</a>
                {modelBenchmarks.rows.some((row) => row.task === "OpenHatch") && <>{" · "}<a href="./static/open-hatch-model-benchmarks.json" download>OpenHatch evaluation report ↓</a></>}
              </p>
            </div>
                </details>
              </div>
            </details>
          </div>
        </section>
        <section className="section-block page-shell" id="documentation">
          <Title number="07" title="Run, inspect, reproduce.">
            A documented path from your first rollout to a new benchmark task.
          </Title>
          <div className="docs-grid">
            <article><h3>Install and verify</h3><p>Set up the pinned simulator with open procedural assets and run a bounded saved-policy check.</p><a href={docsHref("installation")}>Installation guide ↗</a></article>
            <article><h3>Collect and train</h3><p>Record expert episodes, audit physical completion and use the declared ACT/DP data interface.</p><a href={docsHref("collect-demonstrations")}>Collection workflow ↗</a></article>
            <article><h3>Evaluate a model</h3><p>Download a selected checkpoint and reproduce its original task, reset cohort and evaluator.</p><a href={docsHref("reproduction")}>Recorded evaluations ↗</a></article>
            <article><h3>Extend the benchmark</h3><p>Add a task, robot, controller or policy while preserving versioned contracts and evidence.</p><a href={docsHref("add-task")}>Extension guides ↗</a></article>
          </div>
          <p className="section-note">Private preparation release. Models and evidence can be downloaded selectively; raw training RGB is not included, and licensed robot meshes require separate authorized installation.</p>
        </section>
        <section className="section-block tinted">
          <div className="page-shell prose">
            <h2>Abstract</h2>
            <p>
              Underwater manipulation couples a floating vehicle, an articulated arm and the surrounding water.
              Currents, buoyancy, hydrodynamic forces and actuator response affect both contact and motion,
              so task performance depends on the robot, low-level controller and learned policy together.
            </p>
            <p>
              WasserMan is a modular simulation suite for underwater vehicle–manipulator policy learning.
              Its task catalog spans instantaneous interaction, object transport and constrained contact.
              The suite combines per-link hydrodynamics, configurable currents, thruster dynamics,
              low-level controllers and explicit measured success criteria. Visual ACT and Diffusion Policy
              baselines cover PressButton, RotateValve, OpenHatch, CollectShell, PullLever and PushSlider;
              state-based PPO is reported under a separate protocol. Shipwreck recovery and cargo-release
              studies extend the suite to dark interiors, with historical and development results identified
              separately. Recorded trajectories illustrate task execution; independent model rollouts establish
              benchmark scores. Studies examine learning, recovery fine-tuning, low-level control, currents,
              motor limits and two native robot/controller configurations. Action-interface and demonstration-budget
              comparisons are complete for PushSlider and PullLever. Separate HotStab, CabinRecovery and CargoRelease protocols bring the total to nine tasks with ACT/DP evaluations. Wall Toss illustrates current sensitivity with a matched expert-command pair. All evidence is from simulation, with each result's scope and
              protocol reported alongside it.
            </p>
          </div>
        </section>
        <section className="section-block page-shell citation">
          <div>
            <h2>Paper citation</h2>
            <p>Please cite the <a href={publication.paper_url}>WasserMan paper on arXiv</a>.</p>
            <button className="button" onClick={copy}>
              Copy BibTeX
            </button>
            <p role="status">{copyStatus}</p>
          </div>
          <pre>
            <code>{citation}</code>
          </pre>
        </section>
      </main>
      <ProjectFooter />
    </>
  );
}
export default App;
