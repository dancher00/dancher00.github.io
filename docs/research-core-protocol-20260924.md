# Fixed five-part research campaign — 2026-09-24

Authorized scope: finish Marine PullLever/PushSlider; add RGB ACT/DP PressButton;
current/motor sensitivity on two existing policies/tasks; two-task action-interface
comparison; demonstration scaling. Additional training-seed repetitions were cancelled by the user. New tasks,
ship/darkness, and hardware are out of this computer's scope. Local/private site.

This protocol is fixed before new training or scored evaluation. Development
pilots are separate, with failures retained. Existing frozen protocols/scores
are unchanged. Do not alter a success criterion to improve model performance.

## A. Six-task learned-policy core

Keep the original Marine-v1 queue and its frozen splits unchanged. Preserve
failed policies and independent physical-contract replay. Analyze the first
contact/trajectory divergence from the teacher before any corrective training.

PressButton uses the existing `Wasman-Underwater-PressButton-T200-Direct`:
legacy geometry, smooth press-and-hold contract, original randomized water/reset
parameters, 120 Hz physics, 30 Hz commands and 16 s configured horizon.
Score470 commands after one camera warmup, before automatic reset. No physical
or success changes. The frozen PPO checkpoint generates demonstrations only;
this is privileged-teacher distillation, disclosed distinctly from scripted experts.
The existing state PPO score remains a separate historical result.
Student input: wrist RGB384 plus21 measured robot coordinates (base XYZ,
quaternion, linear/angular velocity, four joint positions/velocities). No button,
contact, current, reward or teacher state. Output: all10 original actuator
channels, with no lossy removal of attitude commands. Closed-loop normalization
and camera profile must match the demonstrations exactly.

Development9000–9007. Collection9200–9299: first80 successful attempts, maximum100.
Validation9100–9107, final9110–9139 plus separate42. ACT20k updates, batch8,
ResNet18, chunk16, LR1e-5. DP40epochs, CLIP/UNet, batch64/microbatch16,
LR3e-4/encoder3e-5, EMA. Validation choices ACT5k/10k/20k and DP10/20/40;
most successes then earliest budget. Original smooth success constraints, including
maximum penetration/tool speed and30 consecutive steps, replay independently.
Pilot must include teacher, zero-action, lossless replay and RGB timing/content.
Standalone model films use the previously verified grounded visual-panel wrapper,
with equal before/after physics hashes. Their observations can differ visually;
these presentation takes do not replace the benchmark tests.

## B. Current and motor limits

Frozen final DP models on RotateValve and OpenHatch; no retraining or teacher.
Thirty paired fresh seeds10000–10029 per task and condition. Conditions:
calm/full motors; +Y currents0.10/0.20m/s; -Y current0.20m/s;
80% and60% original bidirectional per-motor force capacity, calm water.
These are declared sensitivity conditions, not measured ocean distributions.
Only one factor changes at a time. Inject current after seeded reset before
first scored action; disable stochastic turbulence consistently with baseline.
Reduce allocated force capacity before the native inverse PWM/RPM map and lag,
not by weakening reported telemetry after force application.
Save actual motor limits and current vectors, initial full robot/object states,
source/checkpoint hashes, saturation, contact, progress, attitude and angular speed.
Paired initial poses must agree before current-induced dynamics. Publish success,
contact loss, peak attitude/angular speed and initial two-second RMS tracking; distinguish
successful-only metrics from all-attempt metrics. Check original contracts.

## C. Action interface

Marine PushSlider and PullLever; same80 episodes, wrist RGB, measured robot state,
30Hz decision rate, architecture/budget, and low-level gains. Compare eight
absolute actuator channels with absolute EE-pose/jaw commands through the same
ToolPoseController(posture_gain=0.08). This isolates the commanded representation
under the declared IK, not all possible whole-body controllers.
Reuse recorded teacher EE targets and exact jaw commands only after source and
packing audit. Quaternion is the recorded expert's constant RX(pi/2), never
inferred from task progress at student inference. Replay at least8 recorded
seeds per task through both interfaces before learning. Failed replay blocks that
interface; preserve diagnosis rather than substitute expert actions at inference.
Selection on original validation seeds. Fresh paired final seeds10100–10129;
baseline standalone42 films remain separately identified. One ACT and one DP run per new EE interface.

## D. Data budgets (scope revised at user request)

Two tasks: Marine PushSlider and PullLever. Nested fixed episode prefixes
10/20/40/80, same first-success ordering, metadata and image files reused read-only.
DP data scaling uses training seed42,40epochs per budget; report that update count
changes with dataset size. Whole-episode5% offline holdout is deterministic and
separate from closed-loop validation; no frame-level split. The budget denotes available
episodes including that holdout; publish the actual training/holdout counts.
One training seed42 per configuration. Additional ACT/DP trainings with seeds43/44
are cancelled at the user's request; existing partial checkpoints are retained.
Fresh final10200–10229 per task for all data budgets. Re-evaluate the original80-demo
DP on those same resets, without retraining. Selection uses existing validation,
never these final outcomes. Intervals describe reset variation conditional on a
trained model; no claim of measured training-seed robustness is made.

## Execution, resource and publication gates

One heavy stage at a time; short development checks may share GPU only with memory
headroom. Preserve inherited dirty files and the128-source Marine freeze.
Before every long stage: validated inputs, disk headroom, pinned source hashes,
separate output path. No automatic hyperparameter sweep. Journal failures and
stop dependent stages, while independent completed studies remain publishable.
Do not call the campaign complete until every requested comparison has recorded
results/diagnosis, independent verification, appropriate videos and local-site data.

New DP runs retain a full resumable last checkpoint; validation snapshots at
epoch10/20/40 store EMA weights and configuration only. This changes storage,
not optimization or inference. Existing frozen Marine checkpoints remain untouched.

## GPU execution amendment

At the user's request, not-yet-started DP jobs use microbatch16 with gradient
accumulation to the same effective batch64. The previously completed PushSlider
DP10-demo run and original Marine runs retain microbatch8. Training scripts,
epoch budgets, architectures, data, LR schedules and success criteria are unchanged.
Actual microbatch size is recorded in every checkpoint configuration. RNG consumption
and floating-point accumulation are not claimed to be bit-identical across batching.
The short interleaved throughput measurement (8 vs16) is engineering timing only,
not another policy-learning experiment, and writes no model checkpoint.
