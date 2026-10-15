# Policy and execution studies

WasserMan evaluates trained visuomotor implementations under paired changes to
observations, physical conditions and execution. Each study retains its own
reset block, native reference, full task horizon and physical completion test.
The [primary comparison](benchmark-results.md) reports ACT, DP, chunked BC and
SmolVLA under their declared training protocols.

## Visual transfer

Fixed ACT and DP policies are evaluated under native, clear, coastal and harbor
appearance, and dimmer or brighter native lighting. The
[interactive results](https://dancher00.github.io/wasserman/#visual-transfer)
show every condition with training-run means, descriptive intervals and paired
changes. Appearance and lighting responses depend on the task and implementation.

## Current visual feedback

The RGB controls compare current images, an image held from the first observation,
and current images reassigned between resets. Current measured robot state and
policy action updates are retained. Holding the first image removes completion
in both RotateValve and OpenHatch for ACT and DP. Reassignment removes valve
completion while the hatch implementations retain most or all completions.
These tests distinguish image freshness from correspondence to a particular reset.

The reassignment uses a cyclic shift of 15 positions within the ordered batch of
30 resets. Its descriptive intervals resample exchange-pair clusters, preserving
the dependence introduced by this intervention. The
[reset specification and interval analysis](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/ras-strong-closure-v5-20261013)
provide the calculation and exact cohort identities.

## Physical sensitivity and expert references

Paired DP evaluations change contact friction, mechanism damping, actuator delay,
arm mass and inertia, and mechanism position and orientation. An unchanged
privileged expert is evaluated in each corresponding scene.

Moving the hatch by 4 cm in either Y direction changes learned completion from
100% to zero; the expert completes all 30 matched resets in each shifted scene.
Reducing valve-arm mass and inertia to 0.8× lowers completion for both the policy
and the expert. These references distinguish a response of the learned policy
from a change that also affects reference execution.

## Observation history and demonstration mixture

Three OpenHatch training arms share the same two-slot DP architecture, encoder
and training exposure: duplicated current observations, previous/current
observations, and history with a predefined mixture of expert approach trajectories.
All three perform well under native and coastal appearance, and none completes
the tested 4 cm translations.

Graded shifts of ±0.5 and ±1 cm distinguish the variants. At Y = −0.5 cm,
the trajectory-mixture arm completes 27.8% of episodes, compared with 98.9%
for history with the original demonstrations. The paired change is −71.1
percentage points, with a descriptive 95% interval of [−92.2, −46.7].
The tested mixture therefore has a placement-dependent effect under this budget.

## Expert candidates and demonstration selection

The coverage study executes all 400 configured expert candidates for each of
the six learning tasks. Every initial state and physical outcome is retained.
Original selected reset IDs and outcomes of the coverage execution have separate
masks. Distributions compare originally selected and remaining candidates,
and successful and failed coverage attempts, including vehicle pose, displaced
volume, damping and added mass. These records make the relationship between
demonstration selection and initial conditions inspectable.

## Contact, tracking and actuation

The diagnostic procedure scores the full episode, then compares contact,
mechanism progress, vehicle and joint tracking, and actuator use over matched
early exposure. Holding the first action chunk fixed stops task completion and
opposing grasp. Actuator delay can increase tracking error and effort while
completion stays unchanged. The [execution diagnostics](execution-diagnostics.md)
explain how these measurements are read together.

For the translated hatch, full-trajectory analysis shows that the required
opening-angle window is never reached, even where early contact increases.
The records identify the unsatisfied physical condition in the task contract.

## Data and reproduction

| Study records | Public location |
|---|---|
| Visual, physical, history and execution evaluations | [Evaluation traces](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/evaluations) |
| Matched history and trajectory-mixture models | [Checkpoints and training records](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/models) |
| Original and varied expert trajectories | [Demonstrations](https://huggingface.co/datasets/dancher00/WasserMan) and [trajectory mixture](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/diverse-demonstrations) |
| RGB controls, graded placement, six-task coverage and full-episode contract analysis | [Control and coverage records](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/ras-closure-v4-20261012) |
| Reset generators and exchange-pair interval calculations | [Protocol and statistical records](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/ras-strong-closure-v5-20261013) |

The [reproduction guide](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/blob/main/ras-closure-v4-20261012/REPRODUCE.md)
specifies the pinned runtime, selective input restoration, complete evaluation
commands and independent physical scoring. Record a fixed HF revision when
reproducing a study; every subset index identifies its files and checksums.
