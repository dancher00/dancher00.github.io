# Marine PullLever / PushSlider — benchmark design v1

Status: frozen after independent expert and zero-action acceptance, before final
training collection. Sources and raw evidence hashes are in acceptance.json. No new long search is authorized
by this protocol: one fixed training run per architecture and task.

## Task and interface

Versioned Marine-v1 scenes, registered BlueROV2 + Alpha, T200 actuation,
240Hz physics /30Hz policy,60s horizon, calm water. Original randomized robot
reset and mechanism Y/Z ranges retained. Rail travel0.27m; lever angle40degrees;
original proximity/alignment/base stability and four consecutive control samples.
Task objects remain passive. No direct joint driving or object pose writes after
reset. Fingers/force opposition are diagnostics, not substituted success criteria.
Appearance updates preserve original mechanism physical definitions; the grounded
wall and T200 upgrade are explicitly versioned scene changes.

Network inputs:384px wrist RGB and eight measured normalized robot values
(base XYZ, four arm joints, jaw). Outputs: eight absolute normalized actuator
targets. Base attitude target remains level. Native30Hz avoids lossy resampling;
packed command replay is required before training. No object/expert state at
network inference. FP32 evaluation; cuDNN benchmark off/deterministic on and
TF32 off after all resets.

## Splits

| Task | Final demonstration attempts | Closed-loop validation | Final test |
|---|---|---|---|
| PushSlider |8200–8279|8300–8307|8310–8339|
| PullLever |8400–8479|8500–8507|8510–8539|

Expert development/acceptance uses8100–8115 plus42. Additional collection attempts
if needed use8280–8299 /8480–8499, retain failures, select the first80 successful
whole episodes. Never use validation/test seeds as labels. Standalone42 is a
separate diagnostic excluded from30-seed aggregates. A fixed model training seed42
is distinct from environment reset seed42.

## Fixed budgets and selection

ACT: pinned LeRobot ResNet18, chunk16, batch8,20,000updates, AdamW1e−5,
weight decay1e−4,KL10; evaluate checkpoints5k/10k/20k on validation only.
DP: pinned AM-Bench CLIP/UNet, horizon16,2observations,8executed actions,
16DDIM steps;40epochs, effective batch64/microbatch8, AdamW3e−4 with encoder3e−5,
EMA. Preserve the standard whole-episode5% offline holdout from80 demonstrations.
Evaluate EMA epochs10/20/40 on the separate eight closed-loop validation seeds.
All choices use the same inputs/action representation. Select most validation
successes, earliest budget breaks ties. Save selection and checkpoint hashes
before final test. No final-test-guided model replacement.

## Required evidence

- Seeded expert and zero-action trials; neutral policy must not solve the task.
- Independent replay of every scored physical trace and data-censoring/timing audit.
- Full dataset/asset/config/code hashes, failures retained, packing replay gate.
- Final30 paired seeds plus separate42; same initial measured states checked.
- Success counts with exact95% binomial intervals, successful completion time,
  progress-through-time and physical contact diagnostics. One training seed only.
- Full clean expert and actual policy films; failures remain failures. Video42
  never replaces the30-seed score. Site remains local/private.
