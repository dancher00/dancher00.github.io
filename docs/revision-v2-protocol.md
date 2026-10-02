# Revision v2: executable benchmark and training variation

Status: frozen before primary collection/training/test; no primary outcomes yet. Authorized by the
author on 2026-09-29 to run the necessary experiments, revise paper/site/repos,
use the RTX 5090 and remove unnecessary generated files. This supersedes the
historical cancellation of additional training seeds. Historical rows remain
immutable. Acceptance by a journal is an external decision.

## Contribution and asset boundary

The target is a simulation diagnostic benchmark, not a calibrated digital twin
or a hardware-transfer result. Six core tasks and two primary diagnostics:
expert replay versus learned execution, and integral control versus productive
contact. Exploratory wreck, bimanual, optical and boundary-model examples are
secondary and cannot establish core robustness.

`open-procedural-v1` removes the need for restricted Reach CAD. Non-finger
collision proxies, joint frames, inertias, dynamics and success predicates come
from the tracked source. Arm visuals use those primitives. Grasp fingers are
new, explicitly specified two-segment boxes, not copied or fitted to restricted
CAD. This changes both imagery and finger collision geometry. Therefore all
open-profile results and datasets are new rows, never additional seeds of the
old CAD-profile table. Historical CAD remains opt-in and separately licensed.

Engineering gate before the freeze: all six experts must complete independently
replayed success contracts on development states; audit images, contacts,
command transport and absence of restricted file dependencies. If feasibility
fails, diagnose geometry/controller mismatch on development states, preserve
failures, and version any change before collecting the main training set.

Development selected a20 mm shallower expert approach on RotateValve and
PushSlider. Their initial pilot outcomes (4/8 and0/8) are retained alongside the
corrected8/8 runs. This adapts the expert's target to the new generic fingers;
the geometry, gains and task success thresholds did not change in these checks.

Development command playback passed8/8 at30 Hz on RotateValve versus5/8
at20 Hz on the same eight source episodes. The open revision therefore uses
30 Hz Valve targets and one-control-step DP observation history. Historical
20 Hz datasets/checkpoints retain their defaults. OpenHatch playback passed8/8
at20 Hz; the other task interfaces also passed their declared playback gates.

## Frozen learning design (before test outcomes)

- Tasks ordered PressButton, RotateValve, OpenHatch, CollectShell, PushSlider,
  PullLever. Task index `i=0..5` defines disjoint seed blocks.
- Asset development: `31000+1000*i .. 31007+1000*i`.
- Training candidates: `40000+1000*i .. 40399+1000*i`, in increasing order;
  first 80 successful audited episodes, with all attempted outcomes retained.
- Fixed whole-episode split: permutation seed 20260929, 76 training and 4
  offline-validation episodes, identical for ACT, DP, BC and all training seeds.
  Data hashes and exact seed membership must be recorded before fitting.
- Independent training seeds: 17, 43, 101. No replacement of failed seeds.
- Three policy families: ACT, diffusion policy (DP), and a simple chunked
  behavioral-cloning regressor (BC). BC adds a non-transformer, non-diffusion
  reference: ImageNet ResNet18 with frozen batch-normalization statistics,
  concatenated robot state, two width1024 ReLU layers, and a16-action L1 head.
  It receives the same normalized image/state inputs and targets as ACT.
- Closed-loop development: `50000+1000*i .. 50007+1000*i`.
- Primary test: `60000+1000*i .. 60029+1000*i`, not used for tuning or selection.
  Evaluate the complete cohort in increasing order in one30-environment batch;
  diffusion noise is assigned by batch slot. Control horizons are470,2240,1790,
  7190,1790,1790 steps, respectively, at30 Hz (first warmup step separate).
- Primary checkpoint: fixed final budget, identical rule for all tasks/methods.
  No task-dependent best-checkpoint choice.
- Primary budget: 320,000 sampled training windows per method/run. ACT and BC
  batch32 and 10,000 updates; DP effective batch64 and 5,000 updates. Use full batches
  with repeated shuffled passes. Report actual GPU time, parameters, precision,
  memory and sample count. Equal sample exposure is not equal FLOPs or time.
- Chunk length16 and execute8 actions for all methods. OpenHatch uses20 Hz;
  the other five tasks use30 Hz. Task-specific action/observation schemas remain explicit. ACT retains its
  single-image encoder; DP retains two image observations and its architecture.
  Results compare reference implementations, not architecture in isolation.
- ACT: ImageNet ResNet18, AdamW1e-5/weight decay1e-4, KL10, gradient norm10.
  BC uses the same AdamW settings, precision and gradient norm limit as ACT.
  DP: CLIP ViT-B/16 + conditional UNet, AdamW3e-4/encoder3e-5, warmup first
  20% then cosine decay, EMA power0.75, 50 training diffusion steps/DDIM16.
- Correct CLIP image normalization; train-only random crops/color jitter and
  deterministic evaluation center crop. FP32 deterministic-cuDNN inference
  for both; stochastic diffusion noise uses a separately declared rollout seed.
- Use matching valid (non-padded) training windows across methods within a task.
  Normalize from training episodes only. No object/contact/expert state inputs.
  Disable DP's historical Valve start-orientation noise; dataset reads are
  deterministic, with random image augmentation applied in the training model.
- Save a resumable last checkpoint and final inference weights, configuration,
  source/data hashes and metrics. Do not retain every intermediate full optimizer.

Report every run's successes/30, mean and SD over training runs, all per-reset
outcomes and training failures. Reset intervals are conditional on checkpoints.
Do not pool 90 trials as 90 independent trainings. With only three training runs,
uncertainty about training variability remains substantial. Any bootstrap must
resample training runs and paired resets as separate crossed factors. Task means
have equal task weights, never a pooled binomial interval.

## Diagnostic follow-up

On all three independently trained OpenHatch DP models, vary only position and
attitude integral gains: multipliers 0, 0.5, 1; retain P/D gains, reset states,
weights, action interface and success contract. Run matching RotateValve controls
to measure task dependence. Predefine paired diagnostic states as
`70000+1000*i .. 70029+1000*i`. Record opposing contact, mechanism motion,
tracking, saturation, completion and contact-conditioned progress. Do not infer
causal mediation from an association between contact and success.
Use a predeclared20-second prefix for paired contact/tracking/effort comparisons,
censored jointly at the earlier terminal time; report exposure and the full
task outcomes separately. These are30 Hz control-rate measurements, not peak
240 Hz motor loads. Compare methods' training replicates independently while
sharing resampled reset indices; numerical equality of training-seed labels does
not make different algorithms' training runs a matched scientific pair.

PushSlider/PullLever native versus EE training uses the same underlying episodes,
split, seeds, budget and selection after 8/8 paired expert replay per interface.
Test seeds `80000+1000*i .. 80029+1000*i`; retain null effects. A shared image
encoder ablation can separate encoder from interface if the primary gap recurs.

Data scaling and recovery are removed from primary causal claims. If retained
as new experiments, data-budget runs must hold update/sample exposure fixed;
recovery comparisons must hold precision, optimizer and selection fixed.

Hydrodynamics: document provenance, compare equations and coefficient orders to
published identified BlueROV models, and run predeclared parameter sensitivity.
Analytic/unit checks and sensitivity do not become physical validation. Source
ranges and the exact sweep must be committed before those scored rollouts.

## Storage, release and review gates

Process one raw task dataset at a time; reserve at least40 GiB free. Compress RGB
losslessly in independent shards, verify decoding byte hashes before removing
the working raw copy, and keep trajectory/metadata/outcome records. Delete only
task-created, verified redundant outputs or disposable caches. Existing unique
experiments and original evidence are retained.

Every long process has a log, exit receipt, source/config hashes, timeout and GPU
monitoring. A failed development pilot is not a failed scored benchmark trial.
An interruption is never silently converted to a completed trial.

Release gates: no hidden CAD, all six collect/train/evaluate/score entry points,
downloadable checksummed data and final weights, full training/evaluation in a
fresh checkout, source and policy provenance. Author has authorized repository
and website updates; do not change private-repository visibility implicitly.

Adversarial checkpoints: asset/protocol freeze; completed core and diagnostics;
release usability; final manuscript. Current inline reviews share the authoring
model/context and are self-checks, not independent human or journal reviews.
