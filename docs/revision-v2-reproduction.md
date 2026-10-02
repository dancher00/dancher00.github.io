# Open-core reproduction: verified scope and remaining work

The complete six-task primary evaluation and test-set workstation comparison
have been physically audited, as have all 42 controller/model and 12
action-interface cohorts. The six complete same-GPU DP repeats are now also
physically rescored; see the table below. This page separates completed checks
from the remaining release and evaluation requirements. Historical CAD-profile
results use a different asset version.

A physical-state audit recomputes the fixed task-success predicate from saved
state traces; it does not rerun the simulator dynamics. The separately listed
clean-checkout and second-workstation repetitions are new simulator executions.
Neither type of check is hardware or CFD validation.

| Check | Verified scope | Limitation |
|---|---|---|
| Clean installation | Open profile and pinned public backbones installed in a new checkout without restricted arm CAD | Verified dependency caches were shared |
| Task regeneration | Two declared development episodes per task pass physical audits on each of RTX 5090 and RTX 5080 | Twelve expert episodes per workstation, not a full training set or policy evaluation |
| Physical generation agreement | All 12 paired trajectory archives are byte-identical | Does not establish hardware fidelity or all-state determinism |
| RGB generation agreement | All 12 RGB archives differ; 36 fixed sampled frame pairs have mean absolute channel differences of 0.067–0.515 on the 0–255 scale | First, middle and final frames only; no full-image-sequence bound |
| Full training repetition | ACT PressButton seed 17: 320,000 sampled windows; identical configuration and every final tensor bitwise equal | One same-GPU repetition, not an additional independent training seed |
| Full clean inference | Retrained ACT seed 17 reproduces all 30 PressButton outcomes, complete physical trace, initial images and all 59 action predictions bitwise on RTX 5090 | One task/model/seed; not a guarantee of determinism on other tasks |
| Six-task same-GPU DP repetition | All six seed-17 checkpoints rerun over their full 30-reset cohorts; both runs physically rescored; 169/180 outcomes agree | Eleven outcomes differ across Valve, Shell and Slider; not extra training seeds or a causal explanation |
| Second-workstation training and evaluation | Full ACT PressButton seed-17 training on RTX 5080 uses identical audited input bytes, configuration and normalization statistics; its final model scores 15/30 with physical replay | Existing verified dependency environment; weights differ from RTX 5090, and this is not an extra independent training seed |
| Download and restoration | All six private task packages restore 480 selected demonstrations, six fixed 76/4 splits and all 60 final models; all 504 attempted episodes are retained. PushSlider and PullLever include the additional EE-interface models and data views | Authenticated author access; anonymous/public access remains pending |
| Restored dataset audits | All six native dataset audits and both EE-view audits regenerate byte-for-byte; PressButton training-input hashes also match the completed clean retraining | The PressButton retraining preceded its download; restoration of the other tasks is not a new training repetition |
| Full learned-policy repetition | All 54 primary checkpoints evaluated on both RTX 5080 and RTX 5090; all pairs physically rescored. Binary outcomes agree in 1,438/1,620 paired episodes, with recorded initial measured states equal in all 54 pairs | 182 outcomes differ; GPU, driver and operating-system environments change together. These are not additional independent trainings or hardware validation |
| Supplemental validation | All 54 checkpoints have eight-reset second-workstation validation cohorts; all 432 episodes physically rescored | Extension scheduled after first test exposure; no tuning or checkpoint selection, not extra primary test data |

For exact training-input reproduction, use the checksummed RGB archives rather
than assuming cross-workstation renderings are bitwise identical. See
[download and restore commands](revision-v2-packages.md). Dataset audits and
checkpoint hashes remain available after verified temporary copies are pruned.

## Observed portability issue

The first completed checkpoint pair, ACT PressButton seed 17, scores 12/30 on the
RTX 5090 and 17/30 on the RTX 5080, with 13 differing reset outcomes. The ordered
reset IDs, checkpoint and initial measured robot states match. The GPU/driver
pairs are RTX 5090/595.84 and RTX 5080/580.178.04; these are workstation conditions,
not an isolated intervention on GPU model alone. Environment observations taken
during the campaign also record different Linux kernels (7.0.0-31-generic versus
7.0.0-34-generic). The listed effective package versions, frozen runtime,
dependency-source manifest and backbone manifest match; this does not establish
identity of every workstation component or retrospectively attest each job.

A post hoc first-observation check holds the model and measured state fixed on
the RTX 5090 and substitutes the saved image batch from the second workstation.
The images differ by 0.353 mean absolute 8-bit channel units. The resulting action
chunk difference matches the recorded cross-workstation difference within
1.35e-6 maximum absolute action units. The original RTX 5090 first prediction is
reproduced bitwise; the second workstation's first prediction differs by at most
1.35e-6 when recomputed on the RTX 5090. Thus image differences explain this first
prediction contrast. This check does not isolate the cause of the complete
closed-loop success difference. The initial images of the three primary ACT runs
on the RTX 5090 are byte-identical.

To repeat this saved-input diagnostic after restoring the PressButton task,
primary evaluation and portability packages, use the same execution environment
as the primary workstation:

```bash
PYTHONPATH=src:.deps/valve-policy-deps .venv/bin/python \
  scripts/diagnose_button_initial_prediction.py \
  --checkpoint artifacts/restored-open-core/models/PressButton-ACT-17/final.pt \
  --left artifacts/restored-open-core/primary-evaluation/PressButton-ACT-17 \
  --right artifacts/restored-portability/external/PressButton-ACT-17/rollout \
  --output artifacts/first-image-diagnostic.json
```

This command runs two first-observation model
predictions on a CUDA GPU; it does not rerun a complete episode. The source,
checkpoint and saved RGB/prediction hashes identify the diagnostic inputs. Its
numerical residual need not reproduce exactly on a different workstation.

Both outcomes are retained. No training budget, checkpoint, task contract or
primary runtime is changed in response. The completed 54-pair comparison shows that discrepancies are task- and
checkpoint-dependent; its 182 differing binary outcomes remain in the record.
Primary scores and cross-workstation repetitions remain separate; repetitions
of one trained model do not increase the independent-training sample size.

The second completed task, RotateValve, gives the following counts for training
seeds 17/43/101. Each checkpoint is evaluated on the same ordered 30 reset IDs.

| Family | Primary RTX 5090 successes | Repeated RTX 5080 successes | Paired outcome agreement |
|---|---|---|---|
| ACT | 29 / 17 / 30 | 30 / 16 / 29 | 29 / 27 / 29 out of 30 |
| DP | 26 / 27 / 23 | 26 / 27 / 23 | 30 / 30 / 30 out of 30 |
| BC | 22 / 21 / 24 | 21 / 20 / 22 | 29 / 29 / 28 out of 30 |

All nine pairs have bitwise-equal recorded initial measured states. DP's binary
outcomes agree on every reset here; this does not imply bitwise trajectory or
image agreement. The ACT and BC discrepancies remain in the released evidence.
Unlike PressButton, RotateValve therefore has close outcome agreement for these
particular checkpoints. This task-dependent observation does not establish
GPU-independent benchmark scores or equivalence. GPU, driver and kernel differ
between the workstations; no single component is identified as the cause.
The complete second-task comparison is preserved in
`artifacts/revision-v2/RotateValve-cross-machine-complete.json`.

A separate full retraining on the RTX 5080 also completes the fixed 10,000 updates
and 320,000 sampled windows. The input audit and normalization statistics match
the primary training exactly, but 153 state-dictionary tensors differ and the
logged loss sequences differ from the first update. Its own 30-reset evaluation
scores 15/30 and passes physical replay. This is a successful execution of the
training/evaluation workflow, not bitwise cross-workstation training reproduction
or a statistical equivalence claim. It remains separate from the three primary
training seeds.

The [supplemental reference-controller check](revision-v2-expert-reference-plan.md)
also retains all test states. PressButton's fixed privileged teacher scores
27/30 with initial measured states equal to the primary cohort. Its failures are
not removed from the learned-policy denominator and do not prove infeasibility.
Reference outcomes for the other five tasks remain pending.

## Reproduction analysis commands

After the full primary and external reports are present:

```bash
.venv/bin/python scripts/compare_revision_reproduction.py \
  --core artifacts/revision-v2/core \
  --external artifacts/revision-v2/external-reproduction \
  --output artifacts/revision-v2/cross-machine-scores.json
```

The command verifies model/cohort identity, replays physical success and reports
every per-reset disagreement and initial-state difference. It refuses an
incomplete 54-checkpoint comparison unless `--allow-incomplete` explicitly marks
the output as progress. The [first-package self-check](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#docs/reviews/revision-v2-first-package-review.md)
records the remaining review objections. Neither these checks nor that review
constitutes independent peer review or a submission-ready decision.

The separate fixed eight-reset validation extension has its own physical scorer:

```bash
.venv/bin/python scripts/score_revision_validation.py \
  --core artifacts/revision-v2/core \
  --external artifacts/revision-v2/external-reproduction \
  --output artifacts/revision-v2/validation-scores.json
```

It requires all 54 final checkpoints' declared validation cohorts, or explicitly
labels a partial report with `--allow-incomplete`. The extension began after
first-task test exposure; it does not establish pre-test model selection or
permit tuning or replacing failed seeds. Its eight-state counts remain separate
from primary 30-state scores, with reset intervals conditional on each checkpoint.


The third completed task, OpenHatch, gives these counts, again ordered by
training seeds 17, 43, 101. These repeat the same checkpoints, not three new
trainings on the second workstation.

| Family | RTX 5090 successes / 30 | RTX 5080 successes / 30 | Paired agreements / 30 |
| --- | --- | --- | --- |
| ACT | 29, 19, 25 | 30, 18, 28 | 29, 23, 25 |
| DP | 30, 30, 30 | 30, 30, 30 | 30, 30, 30 |
| BC | 11, 3, 1 | 12, 2, 0 | 15, 27, 29 |

All nine pairs have matching recorded initialization fingerprints and measured
states. BC seed 17 illustrates why totals alone are insufficient: 11 versus 12
successes conceals 15 discordant resets, seven lost and eight gained successes.
DP's perfect observed runs do not establish certain population success or zero
training variation. The empirical bootstrap degenerates at the all-success
boundary; each checkpoint's separate conditional binomial interval is 88.4–100%.
No checkpoint was selected or retrained from these observations. Full-rollout
causes of cross-workstation differences remain unresolved. Evidence:
`artifacts/revision-v2/OpenHatch-cross-machine-complete.json`.

## Same-GPU repeat discrepancy (30 September 2026)

The clean-checkout RotateValve DP seed-17 repetition completed with 25/30
successes versus 26/30 in the primary run; one ordered reset outcome differs.
The retained comparison is
`artifacts/repro-full/evaluation/RotateValve-DP-17/comparison.json` in the clean
checkout. This is a repetition of the same checkpoint, not a new training seed.
Physical-state rescoring confirms the difference. The first decoded prediction
chunk already differs at step 0 (maximum absolute difference 2.01e-7),
while recorded input state and anchor match at that step. The first measured-state
difference appears at step 1. The saved environment-zero image at step 0 is
byte-identical; the full RGB batch was not retained, so this does not isolate
renderer differences from numerical inference differences. Source hashes,
checkpoint, ordered seeds and reported inference settings match. The cause
remains unresolved. The source-bound audit is
`research/revision-v2-clean-valve-discrepancy.json`. Successful
PressButton reproduction does not establish deterministic execution for all tasks.

## Updated source snapshot (30 September 2026)

The snapshot at commit `6a7629d` contains 1009 files, including all completed
primary/controller/interface summaries and multipart evidence restoration tools.
Its 256,205,249-byte archive was restored into a separate directory: every member
hash matched, the frozen runtime hash matched, Python sources compiled, the
benchmark CLI help ran, and all 82 included unit tests passed. This reused the
existing dependency environment; it is not a fresh installation or GPU repetition.
The source index SHA-256 is
`c9572d9dcd31b8913ae4a85d2f20a1f0ec40f42d887e103df73b72a6933c19af`.
The archive and index were then downloaded from a separate private draft release
and restored again; all 1009 member hashes matched. The receipt is
`artifacts/revision-v2/source-private-restoration-v2.json`. Public or anonymous
access remains pending. A new virtualenv and dependency checkouts were installed
from that downloaded copy, using shared package-cache hard links to conserve SSD.
Pinned policy sources, overlay versions and backbones verified; CLI help and all
82 included unit tests passed. The receipt is
`artifacts/revision-v2/fresh-install-completed.json`. This is a new environment
installation with cached packages, not a cache-free download test. Simulator
checks subsequently found the runtime dependency omission documented below;
after the exact-file repair all six short runs completed.

## CollectShell same-GPU repeat (30 September 2026)

DP seed 17 gives 6/30 on the clean-checkout repetition versus 7/30 in the
primary run. Seven of the 30 individual outcomes differ, even though aggregate
counts differ by only one. Saved physical-state rescoring confirms both reports.
The report's checkpoint, source and declared inputs match; this does not prove
identical rendering or hidden simulator state. The audit is
`research/revision-v2-clean-shell-discrepancy.json`. The primary run remains the
reported benchmark result; the repeat is not a replacement or an independent
training seed. Exact same-GPU outcome reproducibility is therefore not supported
for either Valve or Shell.

## Complete six-task clean-checkout DP repetition

All six seed-17 DP checkpoints completed their original 30-reset cohorts and
full horizons in a separate checkout on the same GPU. Physical-state rescoring
verified both runs. Checkpoint hashes, declared inference settings and recorded
initialization match; relocated script path prefixes are normalized only when
the frozen relative script identity and file hash match.

| Task | Primary successes / 30 | Repeat successes / 30 | Matching individual outcomes / 30 |
|---|---:|---:|---:|
| PressButton | 14 | 14 | 30 |
| RotateValve | 26 | 25 | 29 |
| OpenHatch | 30 | 30 | 30 |
| CollectShell | 7 | 6 | 23 |
| PushSlider | 12 | 13 | 27 |
| PullLever | 13 | 13 | 30 |

In total, 169/180 outcomes agree and 11 differ. These repeats reuse the same
checkpoints and are not new training seeds or replacements for primary scores.
Neither matching aggregate counts nor matching all observed outcomes guarantees
identical trajectories or population repeatability. The complete source-bound
summary is `research/revision-v2-clean-repeat-results.json`; regenerate it with
`scripts/score_revision_clean_repeat.py --core CORE --repeat REPRO_FULL --output OUTPUT`.
This check is separate from the short GPU installation tests described below.

## Runtime packaging defect found by the new-environment check

The first PressButton GPU check exposed a missing input in source snapshot
`6a7629d`: `checkpoints/wasman_press_button_smooth_seed42.pt`. The frozen rollout
hashes this reference checkpoint in every mode, including learned visual-policy
inference. The earlier source selection excluded all `.pt` files. Thus the
source-v2 archive's installation and unit-test success did not prove executable
Button support. The simulator printed a missing-file traceback despite a zero
process exit status; the absence of the required report correctly stopped the
check driver. The failed attempt is retained.

The source packager now adds the explicitly pinned runtime file from
`research/revision-v2-runtime-dependencies.json`, checks its original SHA-256 and
size, and still excludes arbitrary learned checkpoints. Four targeted tests
cover inclusion and missing/changed/symlink rejection. Frozen experiment source,
geometry, policies and scoring are unchanged. The downloaded workspace was
repaired with the exact reference bytes; all six short GPU checks completed.
Corrected source v3 was packaged, privately downloaded and restored with every
member hash verified. Do not use the
older source-v2 snapshot alone as a complete execution release.


## Corrected source and completed GPU installation checks

Source v3 at `c5f18a884e7ee792d465a9aedd4a8a617c61bf72` contains 1022 files,
including the pinned Button reference. Every member was restored and hash-checked;
95 included unit tests passed using the new dependency environment. Index SHA-256:
`7ff6b41a9acceab704e257abbe5d6433b343f01714970338b31275638b008012`.
The previous source snapshot remains preserved. Authenticated private download
and restoration verified all 1022 members against the tested local source. The
receipt is `artifacts/revision-v2/source-private-restoration-v3.json`; this is not
a public-access claim.

The repaired fresh environment ran DP seed-17 checkpoints for all six tasks,
each with two development resets and 16 control steps. Saved trajectories and
predictions contain 260,048 checked finite tensor elements; checkpoint hashes,
all 150 frozen runtime source files and the required reference file match.
These are installation checks, not full-horizon benchmark scores or new trainings.
All six job processes and the driver exited zero. A lingering `omni.telemetry`
process caused a systemd stop timeout, so clean service shutdown is not established.
The evidence summary is `research/revision-v2-installation-checks.json`.


## Main evaluation release roundtrip completed

The authenticated private evaluation download restored all 618 indexed members
across 11 logical archives (multipart transport for Shell). Physical rescoring
regenerated all four complete outputs byte-identically: 54 primary cohorts,
42 controller/model cohorts, 12 interface cohorts, and the 60-training resource
audit. The 3240 scored episodes and all failed outcomes remain unchanged.
`research/revision-v2-evaluation-restoration.json` binds the index and output hashes.

The first reconstruction attempt stopped because the working analysis document
had changed since packaging. An isolated source-v3 directory with the exact
packaged specification passed every provenance check; analysis code and frozen
runtime were not changed. Both the failure and provisioning receipt are retained.
Model files were hard-linked from the canonical campaign after the separate
six-task download/restoration checks, rather than claimed as new downloads in
this step. This closes the main private evidence roundtrip, not public access,
anonymous export, the external-workstation supplement or a new simulation run.

## Effect on conclusions

The [execution-impact analysis](revision-v2-execution-impact.md) reports task/model
score drift and all pairwise directions from the existing 54 paired cohorts.
Aggregate DP > ACT > BC ordering is preserved; individual outcomes are not identical.
