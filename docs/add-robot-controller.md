# Add a robot or controller

Robot assets, collision geometry, actuator maps and tracking control jointly
change behavior. Document their differences before calling a comparison an
embodiment ablation.

## Robot integration

Start from a robot declaration in `src/wasman/assets/`, including the existing
BlueROV2/Reach Alpha or RexROV2/Oberon7 configuration. Preserve upstream asset
licenses and register mesh provenance. Declare joint order, frames, masses,
inertias, buoyancy, collision geometry, limits and tool/gripper transforms.

Validate joint limits and tool transforms first. Then check buoyancy and
station-keeping with the vehicle floating, followed by contact behavior. A
fixed-base reach film alone does not validate free-floating manipulation.
Record the tested scope and retain geometric audit evidence.

## Controller integration

Follow the command path from task targets to base wrench and joint drives in
`src/wasman/controllers/`. Preserve units, coordinate frames and signs. Document
integrator reset, saturation/desaturation, update rate and motor limits. A new
controller must share the intended target semantics with the policy adapter.

Replay an identical expert target sequence before training or comparing models.
When the robot, gains and actuation all change, report a comparison of complete
systems. To attribute a difference to one factor, hold the others fixed or explain
why the design does not permit that separation.

The frozen release benchmarks PID/PD and declared EE/native interfaces. It does
not contain benchmarked MPC or adaptive-control baselines. Extending those methods
requires a new implementation and validation; changing a label is insufficient.
