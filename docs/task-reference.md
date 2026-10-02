# Tasks and evaluation contracts

## Current open-core evaluation

The frozen revision uses the following complete, ordered primary cohorts for
all three training seeds of ACT, DP and BC. Every horizon counts 30 Hz control
steps; OpenHatch policy targets use 20 Hz, while the other policies use 30 Hz.

| Task | Primary test reset IDs | Control steps |
|---|---|---:|
| PressButton | 60000–60029 | 470 |
| RotateValve | 61000–61029 | 2240 |
| OpenHatch | 62000–62029 | 1790 |
| CollectShell | 63000–63029 | 7190 |
| PushSlider | 64000–64029 | 1790 |
| PullLever | 65000–65029 | 1790 |

The [revision protocol](revision-v2-protocol.md) declares separate training,
validation, controller and interface streams. Follow the
[open-core package workflow](revision-v2-packages.md) for data and model restoration.
The complete new evaluation remains in progress; historical rows cannot fill
missing new-profile results.

## Historical task coverage

The six-task visual core, separate HotStab, and corrected CabinRecovery/CargoRelease
evaluations cover nine tasks with ACT/DP. Wall Toss has a separate paired expert
demonstration, with no learned-policy score. The website catalog also includes
planned environments; its size is not the number of completed model benchmarks.

## Exact recorded evaluator mapping

| Core task | Reported test seeds | Recorded control steps | Original evaluator |
|---|---|---:|---|
| PressButton | 9110–9139 | 470 | `scripts/rollout_button_visual.py` |
| RotateValve | 2500–2529 | 2240 | `artifacts/valve_visual_20260923/act_test31/source_evaluate_valve_visual.py` |
| OpenHatch | 4400–4429 | 1790 | `scripts/evaluate_hatch_visual.py` |
| CollectShell | 5500–5529 | 7190 | `scripts/evaluate_shell_visual.py` |
| PushSlider | 8310–8339 | 1790 | `scripts/rollout_marine_visual.py` |
| PullLever | 8510–8539 | 1790 | `scripts/rollout_marine_visual.py` |

These are the original ACT baseline commands; the registry records both models
and every study row. Some invocations also include standalone seed 42, which is
excluded from the paper's 30-state denominator. Do not replace the recorded steps
with a rounded nominal horizon. Valve's original evaluator is transported in
`core-metadata`; the launcher verifies its hash before executing it.

## Physical completion

| Task | Contract summary |
|---|---|
| PressButton | Button travel with the recorded alignment, motion and contact checks |
| RotateValve | At least 170 degrees of signed rotation; engagement/stability are diagnostics in this contract |
| OpenHatch | Opening angle, rotation accumulated under grasp, opposing contact and stable hold |
| CollectShell | Verified grasp/lift, transport, complete footprint inside hoop, release and settling |
| PushSlider | Passive mechanism travel with tool engagement and base stability |
| PullLever | Passive mechanism travel with tool engagement and base stability |
| HotStab | Insertion, release, withdrawal and two seconds of unsupported seating |
| CabinRecovery | Open the cabinet under grasp; extract and hold the HDD for 2 seconds |
| CargoRelease | Sever and separate the line; open/withdraw cutter with low residual contact and speed |
| Wall Toss (expert only) | Intentional release, free travel, complete passage and contact-free hold beyond the wall; event-based stand-off |

These summaries are not replacements for versioned predicates. The exact
contract travels with each original report/trajectory, config and source hash.
Progress toward a threshold and complete task success are different quantities.

## Which command to use

`benchmark.py` offers a common development entry point for collection, training
and short inference checks. Exact paper replication uses `paper_release.py
recorded`, because historical native-marine and Valve evaluators differ from
some generic development routes. See [reproduction](reproduction.md).

HotStab requires its separately pinned runtime and full test IDs 3000–3029.
The original split, two-camera inputs and model-selection protocol are in
[HotStab protocol](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/hotstab-v1/PROTOCOL.md). Its scores are excluded
from the six-task average. [Corrected shipwreck studies](extended-studies.md)
retain their own protocols and audits. [Wall Toss](wall-toss.md) is an expert
example of current sensitivity, outside every learned-policy average.
