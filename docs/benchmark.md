# Tasks, studies and limits

This page records historical CAD-profile studies. For the current six-task open
core, use the [frozen revision protocol](revision-v2-protocol.md) and
[reproduction status](revision-v2-reproduction.md). Historical numbers below
are not results of the new asset version or additional independent training runs.

The README reports nine tasks with ACT/DP evaluations: the original six-task visual
core, separate HotStab, and corrected CabinRecovery/CargoRelease protocols.
Only the six core rows enter the core macro-average.
Core snapshots are in [benchmarks/core](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/core); HotStab has its own
[protocol](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/hotstab-v1/PROTOCOL.md),
[results](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/hotstab-v1/RESULTS.md) and per-state records.

For each core row, `research/paper-results-index.json` provides the exact test
states, checkpoint, horizon, evaluator hash and source report. Model configurations
in `benchmarks/core/configs/` preserve input dimensions, rates, action chunks,
training budget, preprocessing and splits. The dataset inventory records that
available demonstrations and gradient-training demonstrations are not always the
same count. Control, interface and demonstration-budget comparisons have separate
cohorts and must not overwrite the suite's original scores.

| Study | Frozen snapshot |
|---|---|
| Core ACT/DP suite | `benchmarks/core/model-benchmarks.json` |
| EE targets vs actuator targets; DP data budgets | `benchmarks/core/research-core-studies.json` |
| Currents and motor capacity | `benchmarks/core/water-motor-study.json` |
| PID vs PD, OpenHatch DP | `benchmarks/core/policy-control-study.json` |
| Articulated robot systems, 30/30 each | `benchmarks/articulated-embodiments-v3/summary.json` |
| Custom twin-arm RotateValve, three scripted modes | `benchmarks/bimanual-valve-v1/summary.json` |
| Historical held-arm robot systems | `benchmarks/core/embodiment-study.json` |
| Separate OpenHatch ACT recovery correction | `benchmarks/core/hatch-act-correction.json` |
| HotStab expert / ACT / DP | `benchmarks/hotstab-v1/results/` |
| Corrected CabinRecovery / CargoRelease ACT/DP | `benchmarks/wreck-corrected-v3/` |
| Wall Toss, one expert-command pair | `benchmarks/wall-toss-v2/` |

The held-arm comparison concerns native robot/controller systems, not isolated
morphology or learned-policy transfer. Water-appearance demonstrations illustrate
optical variations; they are not an ACT/DP water-domain benchmark. State PPO has
its own task/observation protocol and is not an extra row in the RGB comparison.

Low success is retained as a result. HotStab ACT frequently fails to release after
insertion; DP predominantly fails to establish a verified grasp. Those outcome
categories are diagnostic observations, not proven unique causal explanations.
The geometric audits use sampled control frames and declared conservative
proxies; no claim is made about all substeps or every self-collision.

New tasks under active development are outside this frozen evaluation release.
The registered source may contain additional environments, but registration alone
does not make them a completed benchmark or a published result.

## Repeatability and audit scope

OpenHatch ACT scored 10/30 in the original core evaluation and 16/30 in an
instrumented repeat. Known bf16/cuDNN sensitivity does not fully explain the
rollout differences. Both observations remain part of the record; the separate
recovery comparison uses its own paired test cohort.

HotStab's expert scored 28/30. All 90 expert/ACT/DP test episodes passed the
protocol's sampled geometric audit. Passing that audit does not establish the
absence of all substep contacts or self-collisions. Core and HotStab results use
one training seed per model/configuration; reset uncertainty is not training-seed
variance. Hydrodynamic assumptions and illustrative water optics have not been
calibrated against a physical robot.

## Validated articulated PressButton comparison

BlueROV2/Reach Alpha and RexROV2/Oberon7 each score **30/30** on new paired resets,
with the original physical success contract. Independent trace replay agrees;
both motors-disabled controls fail. Configuration was frozen before opening the
final states. Both systems pass 240/480 Hz contact agreement checks.

The [v3 report](studies/embodiment-v3-results.md) discloses the controller fix,
explicit hydrodynamic variants, reproduction commands and limits. Historical
[v2 failures](studies/embodiment-v2-audit.md) and v1 scores are retained.

## Custom two-arm RotateValve comparison

All three modes score 30/30 on paired final resets: left arm parked, left hand on
a fixed support, and both hands turning the wheel. During turning, cooperative
control has lower mean base-orientation RMS (0.060° versus 0.093°/0.095°) and
mean peak motor utilization. The support grasp does not improve those averages
in this calm-water setup. These scripted experts use a separate 506 mm fixture;
their scores are not pooled with the original visual-policy task.

The [results and audit scope](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/bimanual-valve-v1/RESULTS.md) retain
the original world-coordinate precision failures and explain the supplemental
verification. [Reproduction commands](studies/bimanual-valve-v1-reproduction.md)
use an independent runtime pin, preserving all earlier model results.
