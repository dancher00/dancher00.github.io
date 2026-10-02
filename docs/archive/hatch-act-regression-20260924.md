# ACT regression audit — 2026-09-24

The fixed final checkpoint remains20k; this audit does not select checkpoints on
test scores. Original paired30-seed results:10k22/30,20k10/30,15 losses and3 gains.
All30 episodes reach the handle neighborhood for both policies. On10k, all30
command closing while near the handle;20k does so in11/30. Fourteen of15 lost
successes never command the normalized jaw below zero while near the handle.
Thus most losses stall with an open gripper before bilateral grasp; they do not
fail by releasing a previously successful grasp.

The identical-input shadow probe finds an initial mean base-X target difference
of+4.88cm for20k relative to10k. Their normalization/configuration tensors match.
On the late20k failure states, BOTH checkpoints keep commanding an open gripper.
This indicates a trajectory-dependent failure state, not simply a forgotten
close command in the final policy. A four-training-episode fixed-observation
probe finds lower prediction error at20k in all eight channels overall. It is
not held-out validation and does not prove generalization or overfitting.

Reproduction limitation: the first instrumented20k rollout repeats10/31 and its
initial targets exactly. The second, with persisted shadow diagnostics, gives
16/31 on identical initial measured states; initial target differences reach
0.00374 normalized despite identical saved seed4400 pixels. Other initial images
were not saved by the original evaluator, so the source of this difference is
unresolved. Do not attribute it to one cause or replace the original score.

Bounded causal probe declared before execution: run the10k policy for the first
40seconds, then20k, on the same31 diagnostic seeds. Use no expert or contact-based
switching. This tests whether a different approach history allows20k to complete
contact/hold. It is a hybrid diagnostic and must never be labeled an ACT benchmark
score. Store both predictions at every replan and the switch time. No training,
physics, scene, success-criterion or action-scale changes.

## Completed causal probe

The fixed40s10k-prefix/20k-tail run completes20/30 plus42, compared with the
original20k10/30 and the repeated instrumented20k16/30. This supports approach
history as a contributor: the20k policy can finish many episodes after a different
approach. It does not prove one-channel causation or restore the original
benchmark. Its prefix does not exactly reproduce the old10k trajectory: initial
command differences again reach0.00374 normalized and later amplify. This limits
causal precision. No expert or contact-triggered switch was used. All three new
raw traces pass independent physical-contract replay in verified.json.

Actionable next correction: collect independently seeded development episodes
covering late-approach/open-jaw stalls, label corrective actions with the physical
expert, and validate checkpoint selection on held-out whole development episodes.
Freeze a fresh final test split before retraining. Do not pick10k using the original
test results, reduce success thresholds, or launch an unguided PPO/grid sweep.
The current audit explains the observed failure mechanism; its learning-level
cause and render/inference repeat variability remain separate unresolved limits.

## Identical-input reproducibility follow-up

Fresh diagnostic seeds7600–7607 have bitwise identical normalized RGB and measured
state across two processes, yet bf16 first-chunk commands differ by up to0.003736
in absolute normalized actuator units. Repeating the forward pass within either
process is exact; a peer with identical weights in the same process is also exact.
Both runs report cuDNN benchmark selection enabled. FP32 with cuDNN autotuning
and TF32 disabled and deterministic cuDNN gives bitwise equal first chunks across
the two checked processes. See `reproducibility_report.json` and saved complete
input batches. This establishes inference arithmetic as one source of variation,
not a proof that every rollout difference is caused by it or that task performance
is repaired. The original evaluator and original reported score are preserved.
