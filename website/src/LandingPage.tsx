import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import overview from "./assets/project-overview-light.svg";
import overviewDark from "./assets/project-overview-dark.svg";
import { ExpertMultiview } from "./ExpertMultiview";
import taskViews from "./taskDemonstrations.json";
import { UnderwaterImaging } from "./UnderwaterImaging";
import "./landing.css";
import publication from "../publication.json";
import { docsHref } from "./publicationLinks";
import { ProjectFooter } from "./ProjectFooter";
import { ThemeToggle } from "./ThemeToggle";
import { ProjectLogo, ThemedImage } from "./ThemedImage";
import { OverviewVideo } from "./OverviewVideo";

const CurrentResults = lazy(() => import("./CurrentResults").then(module => ({ default: module.CurrentResults })));
const EffectsDemos = lazy(() => import("./EffectsDemos").then(module => ({ default: module.EffectsDemos })));
const TaskVariation = lazy(() => import("./TaskVariation").then(module => ({ default: module.TaskVariation })));

function DeferredSection({ children, id }: { children: ReactNode; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (id && location.hash === `#${id}`) {
      setVisible(true);
      requestAnimationFrame(() => ref.current?.scrollIntoView());
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "800px" });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [id]);
  return <div id={id} ref={ref} style={visible ? undefined : { minHeight: 160 }}>
    {visible && <Suspense fallback={<p className="landing-note" role="status">Loading study…</p>}>{children}</Suspense>}
  </div>;
}

function Citation() {
  const [status, setStatus] = useState("");
  return <section className="landing-width landing-section" id="citation" aria-labelledby="citation-title">
    <div className="landing-heading"><h2 id="citation-title">Citation</h2><p>Please cite the <a href={publication.paper_url}>WasserMan paper on arXiv</a>.</p></div>
    <div className="landing-citation"><div><span>BibTeX · arXiv:2610.04536</span><button type="button" onClick={async () => {
      try { await navigator.clipboard.writeText(publication.citation); setStatus("Copied"); }
      catch { setStatus("Select the text below to copy the citation."); }
    }}>Copy BibTeX</button></div><pre><code>{publication.citation}</code></pre><p role="status">{status}</p></div>
    <p className="landing-note"><a href={`${publication.repository_url}/blob/main/CITATION.cff`}>Machine-readable citation ↗</a></p>
  </section>;
}

const demos = [
  { id: "PressButton", name: "Press button", description: "Approach a panel and hold contact while keeping station." },
  { id: "RotateValve", name: "Rotate valve", description: "Grasp, turn and release an articulated valve." },
  { id: "OpenHatch", name: "Open hatch", description: "Maintain a grasp as a hinged hatch opens." },
  { id: "CollectShell", name: "Collect shell", description: "Pick up a seabed object and carry it to a receptacle." },
  { id: "PushSlider", name: "Push slider", description: "Apply sustained contact along a constrained linear path." },
  { id: "PullLever", name: "Pull lever", description: "Engage a lever and move it through its constrained arc." },
  { id: "HotStab", name: "Hot stab", description: "Retrieve, insert and release a connector into its service socket." },
  { id: "CabinRecovery", name: "Cabin recovery", description: "Open a cabinet and recover a hard drive inside a sunken cabin." },
  { id: "CargoRelease", name: "Cargo release", description: "Cut a retaining rope and release the secured cargo." },
  { id: "WallToss", name: "Wall toss", description: "Release a capsule through a wall aperture. Recording." },
];

function TaskFilm({ task }: { task: typeof demos[number] }) {
  const views = taskViews[task.id as keyof typeof taskViews];
  return <><ExpertMultiview views={views} label={task.name} /><div><h3>{task.name}</h3><p>{task.description}</p></div></>;
}

const groups = [
  { name: "Instantaneous interaction", description: "Precise contact with a panel.", tasks: ["PressButton"] },
  { name: "Object transport and delivery", description: "Acquire, carry, release and recover underwater objects.", tasks: ["CollectShell", "CabinRecovery", "CargoRelease", "WallToss"] },
  { name: "Articulated objects and constrained contact", description: "Sustain contact along a mechanism or an insertion path.", tasks: ["RotateValve", "OpenHatch", "PushSlider", "PullLever", "HotStab"] },
];
const navigation = [["tasks", "Tasks"], ["embodiments", "Embodiments"], ["physical-effects", "Physical effects"], ["results", "Results"]];
export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const update = () => {
      const current = navigation.filter(([id]) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= 160).at(-1);
      setActiveSection(current?.[0] ?? "");
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div className="landing">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="landing-header"><div className="landing-width">
      <a className="landing-brand" href="./"><ProjectLogo />WasserMan</a>
      <div className="landing-header-actions"><ThemeToggle /><button className="landing-menu" aria-expanded={menu} aria-controls="landing-navigation" onClick={() => setMenu(!menu)}>Menu</button></div>
      <nav id="landing-navigation" className={menu ? "is-open" : ""} aria-label="Main navigation">{navigation.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} onClick={() => setMenu(false)}>{label}</a>)}<a className="landing-docs" href={docsHref()}>Docs ↗</a></nav>
    </div></header>
    <main id="main">
      <section className="landing-hero landing-width">
        <p className="landing-kicker">Simulation benchmark · Isaac Lab</p>
        <h1><strong>WasserMan:</strong><span>Benchmark for <em>Underwater Manipulation</em> Policy Learning</span></h1>
        <p>A shared testbed for visual policy learning, floating-base control and underwater contact.</p>
        <div className="landing-links"><a className="landing-button" href={publication.paper_url} target="_blank" rel="noreferrer">Paper (arXiv) ↗</a><a className="landing-button" href={docsHref()}>Read documentation ↗</a><a className="landing-button" href={publication.repository_url}>Code ↗</a><a className="landing-button" href={docsHref("revision-v2-packages")}>Data & models ↗</a><a className="landing-button" href="#overview-video">Overview video ↓</a></div>
      </section>
      <OverviewVideo />
      <figure className="landing-width landing-teaser"><ThemedImage src={overview} darkSrc={overviewDark} loading="lazy" decoding="async" alt="WasserMan overview: two native robots, cooperative two-arm valve manipulation, control, task environments, policies and underwater disturbances"/><figcaption>Overview of WasserMan · task tiles and the two-arm inset show recorded simulation views. </figcaption></figure>
      <section className="landing-width landing-section" id="approach">
        <div className="landing-heading"><h2>Learning, control and contact.</h2><p>Arm motion disturbs the vehicle; vehicle motion changes the grasp. Evaluate the policy and controller together, from observations to physical task completion.</p></div>
        <figure className="landing-system" aria-label="Closed-loop policy and control architecture">
          <div className="landing-system-flow">
            <div><span>01 · POLICY</span><h3>Choose an action</h3><p>Images + robot state</p></div>
            <span className="landing-flow-arrow" aria-hidden="true">→</span>
            <div><span>02 · CONTROL</span><h3>Execute the target</h3><p>Vehicle + arm commands</p></div>
            <span className="landing-flow-arrow" aria-hidden="true">→</span>
            <div><span>03 · SIMULATION</span><h3>Interact underwater</h3><p>Robot, contact + fluid forces</p></div>
          </div>
          <div className="landing-feedback"><span>← Images and robot state close the loop</span></div>
          <figcaption>Shared task goals and success criteria. <a href={docsHref("data-and-interfaces")}>Observations and actions ↗</a></figcaption>
        </figure>
      </section>
      <section className="landing-band" id="tasks"><div className="landing-width">
        <div className="landing-heading"><h2>Task environments</h2><p>Ten task environments, from precise panel contact to shipwreck intervention. Nine tasks have learned-policy evaluations with versioned protocols.</p></div>
        {groups.map((group, index) => <details className="landing-task-group" key={group.name} open={index === 0}>
          <summary><span className="landing-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{group.name}</h3><p>{group.description}</p></div><small>{group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}</small><b aria-hidden="true" /></summary>
          <div className="landing-task-grid">{group.tasks.map(id => { const task = demos.find(t => t.id === id)!; return <article key={id} className="landing-task-card"><TaskFilm task={task} /></article>; })}</div>
        </details>)}
        <p className="landing-note">Recorded trajectories use the earlier asset version. Learning results below use the open procedural core.</p>
        <p className="landing-note"><a href="./?view=explore#tasks">Task contracts, scene details and development catalogue ↗</a></p>
        <DeferredSection><TaskVariation compact /></DeferredSection>
      </div></section>
      <section className="landing-section landing-width" id="embodiments">
        <div className="landing-heading"><h2>Robot embodiments</h2><p>A work-class vehicle with two arms for cooperative underwater manipulation.</p></div>
        <div className="landing-robots">

          <article><video className="embodiment-film" src="./static/bimanual-valve/two-hands.mp4" poster="./static/bimanual-valve/two-hands.png" aria-label="RexROV2 bimanual valve manipulation" controls muted playsInline preload="metadata" /><span className="landing-number">WORK-CLASS VEHICLE</span><h3>RexROV2 + twin Oberon7</h3><p>Six thrusters · two six-axis arms + grippers</p><p>Two arms grasp and turn a valve together while the vehicle holds station. A custom bimanual configuration with state-feedback control.</p></article>
        </div>
        <p className="landing-note"><a href={docsHref("studies/bimanual-valve-v1-reproduction")}>Robot configuration and bimanual protocol ↗</a></p>
      </section>
      <section className="landing-section landing-width" id="physical-effects">
        <div className="landing-heading"><h2>Physical effects</h2><p>Currents, buoyancy, drag, added mass and actuator response shape underwater motion.</p></div>
        <DeferredSection><EffectsDemos /></DeferredSection>
        <DeferredSection><UnderwaterImaging /></DeferredSection>
        <p className="landing-note">Buoyancy, relative-water forces and bounded thruster response; optional proximity effects. <a href={docsHref("physical-model-scope")}>Model scope and assumptions ↗</a></p>
      </section>
      <DeferredSection id="results"><CurrentResults /></DeferredSection>
      <section className="landing-section landing-width" id="abstract">
        <div className="landing-heading"><h2>Abstract</h2></div>
        <div className="landing-abstract"><p>WasserMan is, to our knowledge, the first multi-task simulation benchmark for visuomotor learning of floating-base underwater contact manipulation. It includes ten implemented task environments, learned-policy results on nine tasks, two native vehicle–arm platforms and a custom bimanual configuration.</p><p>A shared six-task evaluation compares ACT, diffusion policy and chunked behavioral cloning over three independent trainings per configuration. SmolVLA adds a vision–language–action baseline on three tasks, evaluated over three training seeds and 270 test episodes. Across 3,780 episodes in the shared learning and intervention studies, controlled comparisons show that successful expert replay does not guarantee comparable learned completion across interfaces, integral control can determine task completion, and water current can change both completion and actuator effort.</p><p>The suite provides versioned task contracts, demonstrations, trained models and per-episode evidence. Paired expert-controlled platform studies achieve 30/30 for each robot on PressButton and 30/30 in each of three twin-arm RotateValve modes. These studies retain their task and asset protocols.</p></div>
      </section>

      <section className="landing-width landing-section landing-start" id="get-started" aria-labelledby="get-started-title">
        <div className="landing-heading"><h2 id="get-started-title">Use WasserMan</h2><p>Install the open procedural core, collect demonstrations and train or evaluate a policy with its recorded contract.</p></div>
        <div className="landing-start-grid">
          <a href={docsHref("installation")}><span>Installation</span><h3>Set up the simulator ↗</h3><p>Linux, Python 3.12 and a compatible NVIDIA GPU. Procedural assets require no restricted robot CAD.</p></a>
          <a href={docsHref("revision-v2-packages")}><span>Data & models</span><h3>Generate data and models ↗</h3><p>Collect audited demonstrations, train reference policies and inspect artifact availability.</p></a>
          <a href={docsHref("first-run")}><span>First run</span><h3>Check policy inference ↗</h3><p>A short bounded run checks installation. The full protocol uses 30 evaluation resets per training seed.</p></a>
        </div>
      </section>
      <Citation />
    </main>
    <ProjectFooter />
  </div>;
}
