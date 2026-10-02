# Integrate a policy

A new policy must obey the task's observation and action contract. Keep the
simulator criterion fixed while implementing the adapter.

For the current open core, use the [frozen protocol](revision-v2-protocol.md) and
[reference trainer](train-policies.md). Its ACT/DP/BC implementations are already
integrated; a different architecture requires an explicit loader/rollout adapter.
Record a new method identifier and its source changes. Do not overwrite a
reference checkpoint or claim that modified runtime code passes the existing
frozen manifest. Preserve task physics, observations, reset cohorts and success
criteria when presenting a comparison; disclose any deliberate change to them.

## Adapter boundary

Inspect an existing loader in `src/wasman/learning/`, its training script and the
corresponding rollout backend. Declare camera ordering, image preprocessing,
measured-state fields, output normalization, history length, action horizon,
executed chunk length and reset behavior. Preserve checkpoint/config identity.

On recorded expert observations, compare model predictions, decoded targets and
commands actually passed to the controller. Locate the first disagreement before
starting a long closed-loop experiment. A newly introduced limiter is a controller
change and must not be silently folded into an architecture comparison.

## Deployment checks

Reload the selected checkpoint in a clean process. Verify finite predictions,
chunk timing, reset of history buffers and the absence of privileged expert
inputs or replacement actions. Run a bounded development rollout, retain its
trace and inspect the first physical deviation. Matching offline actions does
not by itself establish closed-loop success.

The open-core reference protocol uses the fixed final-budget checkpoint; an
alternative selection rule defines a different experimental setting and must be
reported explicitly. Report one training run
as one run; reset confidence intervals do not measure training-seed variability.
Record unsuccessful outcomes as well as successful demonstrations. The current
revision schedules three independent trainings per reference family and task.
VLA integration and additional policy families are not completed evaluations.
