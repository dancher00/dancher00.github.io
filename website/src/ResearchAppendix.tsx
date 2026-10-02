import { useEffect } from "react";
import { WreckStudies } from "./WreckStudies";
import { MarineMechanismStudy } from "./MarineMechanismStudy";
import { PullLeverCorrection } from "./PullLeverCorrection";
import { PositionCorrection } from "./PositionCorrection";
import { SmoothTeacherStudy } from "./SmoothTeacherStudy";
import { Plot } from "./BenchmarkStudies";
import { ThemeToggle } from "./ThemeToggle";

export default function ResearchAppendix() {
  useEffect(() => { document.title = "Research appendix · WasserMan"; }, []);
  return <main className="page-shell research-appendix" id="research-appendix">
    <a className="appendix-back" href="./#results">← WasserMan results</a><ThemeToggle />
    <header><p className="eyebrow">WasserMan</p><h1>Research appendix</h1>
      <p>Additional comparisons, physical failure analyses and exploratory corrections. Each study retains its own protocol, validation states and reported limitations.</p></header>
    <nav aria-label="Appendix contents"><a href="#shipwreck">Shipwreck tasks</a><a href="#contact">Contact trajectories</a><a href="#diagnostics">Policy diagnostics</a><a href="#state-ppo">State PPO</a></nav>
    <section id="shipwreck"><h2>Shipwreck tasks</h2><WreckStudies /></section>
    <section id="contact"><h2>Contact trajectories</h2><MarineMechanismStudy /></section>
    <section id="diagnostics"><h2>Policy diagnostics</h2><p className="research-context">These separate experiments include negative results. Their small validation cohorts do not replace the core benchmark.</p><PullLeverCorrection /><PositionCorrection /><SmoothTeacherStudy /></section>
    <section id="state-ppo" className="state-policy-reference"><h2>State-policy reference · PressButton PPO</h2><p className="research-context">Separate short-start protocol: legacy-v1 geometry, T200 actuation, 16 s horizon. This is not a controlled comparison with the visual policies.</p><div className="state-reference-plot"><Plot state /><p>PPO succeeds in 959 of 1,024 evaluation episodes. Completion-time statistics were not recorded.</p></div></section>
    <a className="appendix-back" href="./#results">← Return to the three main comparisons</a>
  </main>;
}
