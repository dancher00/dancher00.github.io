# Analysis specification before primary evaluation

This companion implements the frozen revision protocol. The analysis design
below was written while the first PressButton models were training, before any
primary test or diagnostic outcome was produced. A separately labeled completed
primary-results section was appended on 30 September 2026. Neither changes the
frozen runtime or cohorts.

## Primary scores

Each cell contains three independent final-budget trainings on the same76/4
whole-episode split and 30 paired reset states. Report all three counts, their
mean success proportion and sample SD across trainings. Give each checkpoint's
exact95% Clopper–Pearson interval separately, conditional on that checkpoint.
An incomplete cell is missing, never silently zero or a two-run replacement.
All three policy families remain in the table regardless of their outcomes.

Supplementary descriptive95% percentile intervals use20,000 bootstrap draws,
analysis seed20260929. Resample training runs and reset IDs as crossed factors.
For a between-algorithm contrast, independently resample the two algorithms'
training runs but share reset indices. The numerical seed labels17/43/101 do not
make ACT and DP training runs matched observations. The task macro-average gives
each of the six tasks equal weight; no pooled binomial interval is reported.
With only three training runs, these descriptive intervals cannot establish a
precise population distribution of training variability. They are marginal and
not multiplicity-adjusted. Report effect sizes; no significance-based filtering.

Boundary-interpretation clarification added on 2026-09-29 after the first
three-run all-success cell (OpenHatch DP): resampling an all-success or all-failure
observed cell gives a degenerate percentile interval. This does not establish a
population success probability of one or zero. Retain the unchanged descriptive
estimator, report all counts and the separate checkpoint-conditional exact
binomial intervals, and do not interpret zero sample SD as absent training
variability. This clarification changes no estimator, run or selection rule.

## Frozen-policy diagnostics

For each condition contrast, require identical ordered reset IDs, policy hash,
initial poses/joints and randomized hydrodynamic multipliers within each of the
three training replicates. Different base coefficients are the named intervention;
they are not an uncontrolled change in random multipliers. Compare each variant
to Ki1/nominal. Intervention contrasts share resampled training indices as well
as reset indices, since the same trained model receives both conditions.

Continuous metrics use the first 600 control samples (20s at 30 Hz), jointly
censored when either episode becomes inactive or resets. This avoids comparing
full successful episodes to longer failed episodes. Retain full-horizon success
as a separate endpoint. Per reset report jointly observed time; opposing-grasp
occupancy; RMS Euclidean station-position error (m); RMS base-attitude error
(degrees); RMS motor force (N across motors/time); saturation fraction; signed
mechanism progress (degrees); and signed progress during opposing grasp. Last
successful samples count; reset samples do not. Report sampled force statistics
as30 Hz observations, never240 Hz peaks or actuator energy.

Average per-reset metrics with equal reset weights, then average the three runs.
An empty joint prefix is explicitly missing with zero exposure; do not manufacture
an RMS or discard that reset from the success denominator. Contact-conditioned
progress is a descriptive association. Ki intervention does not manipulate contact
independently and cannot establish contact as a causal mediator.

## Action-interface comparison

Report both PushSlider and PullLever, each with all three final DP trainings per
interface, on the reserved 30-reset interface cohort. Native and EE policies use
the same source episodes, split, image bytes, sampled-window budget, action chunk
and execution length. The paired expert replay gate is a prerequisite, not a
policy success result. Recompute success from physical traces using the released
contract; reject incomplete horizons or disagreement with the reported outcomes.

The effect is EE minus native success proportion. Bootstrap resets jointly but
training runs independently between interfaces: these are separately trained
models even when integer seed labels coincide. Report individual counts and
training SD, not only the contrast. This is a system-level action-interface
comparison; changing representation also changes its decoder, so it does not
attribute the effect separately to IK, normalization or phase learning. No task
is selected or omitted based on the size or direction of its effect.

## Provenance and failure handling

Outputs bind source/config/report/checkpoint hashes. A corrupt or incompatible
report fails scoring. `--allow-incomplete` emits an explicitly incomplete progress
report and cannot become a completed benchmark table. Infrastructure interruptions
resume the same training state or are recorded as unresolved; no test-driven
replacement, checkpoint selection or removal of failed runs is permitted.

Unit tests exercise boundary binomial uncertainty, training variability that
persists when resets are repeated, and the distinction between paired frozen-model
interventions and independent algorithm trainings.

## Verification addition after initial test exposure (29 September 2026)

The primary and action-interface scorers now require matching recorded
initialization fingerprints within each task before using paired reset indices.
The fingerprint includes ordered reset IDs, measured state before the first
command, and initial pose/joint/fluid-randomization fields where the backend
records them. It checks the available evidence, not the complete hidden simulator
state. A changed recorded state or randomized coefficient fails scoring even when
the seed IDs match. Unit tests inject both changes and nonfinite state values.

This is an additional integrity check, introduced after 14 primary cohorts were
available; it changes no model, cohort, success predicate or uncertainty formula.
Those 14 cohorts pass. Missing cohorts and interface comparisons remain to be
checked when their recordings exist. The original pre-test analysis design above
is retained; this addition is not represented as having preceded test exposure.

## Matched coefficient-model analysis clarification (29 September 2026)

The frozen hydrodynamic design already includes the four conditions formed by
nominal/published-both coefficients and integral multipliers 0/1. The analysis
implementation now reports Ki0 minus Ki1 separately within each coefficient
model, in addition to retaining every comparison against Ki1/nominal above.
Ki0/published-both versus Ki1/nominal changes two factors and must not be described
as an isolated integral-gain effect.

For full-horizon success, also report the difference of these paired effects:
`(Ki0 - Ki1 at published-both) - (Ki0 - Ki1 at nominal)`. Form this contrast for
each training-run/reset cell before applying the same crossed bootstrap, so all
four outcomes share both resampled factors. This is a descriptive measure of
model dependence, not a calibration test. Do not form this difference from the
continuous summaries: the jointly censored prefix can differ between pairs.
The additional tables retain all three training counts and interval estimates.

This clarification was implemented after the first two primary task matrices
and the first nominal-controller report were available, before any
published-coefficient outcome existed. No experimental condition, training,
checkpoint, reset, success criterion or bootstrap setting was added or changed.
The dated implementation receipt is
`artifacts/revision-v2/matched-integral-analysis-clarification.json`.

## Reset snapshot and camera-warmup clarification (29 September 2026)

The frozen Valve/Hatch evaluators record base pose, joint positions and fluid
randomization immediately after reset, then execute one 30 Hz camera-warmup
step with the assigned gain/coefficient condition already active. The first
recorded measured state is after that step and before the first learned command.
Consequently, matching the reset snapshot does not imply identical first policy
observations across controller/model interventions. Scored continuous exposure
starts after warmup. The intervention includes effects accrued during warmup.

The scorer now retains per-field reset differences (using the existing absolute
matching tolerance of 1e-7) and per-channel differences in the first measured
state. It rejects nonfinite records and incompatible shapes rather than allowing
NumPy broadcasting. Post-warmup equality is reported, not required for an
intervention. Valve channels are measured tool XYZ in metres and XYZW quaternion
components; Hatch channels are the eight normalized base/arm/jaw observations.
No mixed-unit maximum is interpreted as a physical distance or angular error.

This is an analysis/reporting clarification after the first nominal Valve Ki1/Ki0
pair, not a runtime modification or a change to the warmup, cohorts or success
criteria. That pair has exactly matching recorded reset snapshots but small
post-warmup pose-component differences. The measured evidence is retained in
`artifacts/revision-v2/valve-first-integral-initialization.json`.

## Complete primary results — 30 September 2026

All 54 cohorts passed physical success-predicate rescoring: three independent
trainings per family on each of six tasks, 30 resets per checkpoint. Counts are
ordered by training seeds 17, 43 and 101. No training seed was replaced.

| Task | ACT successes /30 | DP successes /30 | BC successes /30 |
|---|---|---|---|
| PressButton | 12, 14, 15 | 14, 19, 21 | 13, 13, 10 |
| RotateValve | 29, 17, 30 | 26, 27, 23 | 22, 21, 24 |
| OpenHatch | 29, 19, 25 | 30, 30, 30 | 11, 3, 1 |
| CollectShell | 0, 0, 0 | 7, 9, 14 | 0, 0, 0 |
| PushSlider | 0, 2, 7 | 12, 10, 16 | 1, 0, 1 |
| PullLever | 13, 23, 0 | 13, 17, 16 | 7, 12, 3 |

Equal-task macro-averages are 43.5% (ACT), 61.9% (DP) and 26.3% (BC). These
are summaries of the declared implementations, not architecture-only effects.
For example, ACT and DP both average 84.4% on RotateValve, while their sample
training SDs are 24.1 and 6.9 percentage points. ACT varies from 0/30 to 23/30
on PullLever. All failures remain in the reported matrix.

The complete scorer output is `artifacts/revision-v2/primary-scores-complete.json`.
The compact checked-in record `research/revision-v2-primary-results.json` binds
all counts, means, SDs and descriptive contrasts to that source hash. Figure
generation uses the complete output and fixed seed ordering. Boundary outcomes
and three-run SDs must be interpreted with the limitations specified above.

## Completed interface results (30 September 2026)

All 12 cohorts passed saved physical-state rescoring and recorded-initialization
checks. Each count is out of 30, ordered by training seeds 17/43/101.

| Task | Base + joint targets | EE targets | EE − native, percentage points | Descriptive 95% interval |
|---|---|---|---|---|
| PushSlider | 13 / 8 / 18 | 1 / 4 / 3 | −34.4 | [−56.7, −12.2] |
| PullLever | 11 / 13 / 18 | 14 / 18 / 13 | +3.3 | [−21.1, +27.8] |

The complete source-bound summary is `research/revision-v2-interface-results.json`.
The PullLever interval does not establish equivalence. The intervention changes
representation, decoding and normalization together; it does not isolate IK.
The research resets differ from the primary evaluation and are not pooled with it.


## Supplemental privileged-reference checks (30 September 2026)

This post hoc extension runs the fixed expert/controller logic on the 30 primary
reset IDs for each task. It was not used to select models, change training data
or replace primary evaluations. All six completed cohorts passed physical
success-contract replay, including failed attempts.

| Task | Reference successes / 30 |
|---|---:|
| PressButton | 27 |
| RotateValve | 28 |
| OpenHatch | 30 |
| CollectShell | 30 |
| PushSlider | 30 |
| PullLever | 26 |

The source-bound record is `research/revision-v2-reference-results.json`.
Recorded initial measured states match the ACT-17 primary reference bitwise for
five tasks. Valve stores different initial-state schemas, so identical reset IDs
do not establish full-state pairing there. The controllers use privileged task
information and are not a fourth learned baseline or an upper bound on policy
performance. Shell and Slider success supports feasibility for these fixed
controllers; it does not explain the learned-policy failures. No claim of
universal feasibility follows from 30 observed resets.
