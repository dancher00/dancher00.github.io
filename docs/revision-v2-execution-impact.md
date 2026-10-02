# Execution sensitivity of the reported conclusions

Same final checkpoints, three training identities and 30 task resets on two workstations. These paired repetitions do not replace primary scores.

| Model | Primary mean (%) | Repeat mean (%) | Drift (pp) |
|---|---:|---:|---:|
| ACT | 43.5 | 43.1 | -0.4 |
| DP | 61.9 | 60.4 | -1.5 |
| BC | 26.3 | 24.4 | -1.9 |

The equal-task ordering DP > ACT > BC is preserved. Across the 18 task-level pairwise model contrasts, no nonzero difference reverses direction. The ACT/DP tie on RotateValve becomes a one-episode DP advantage across 90 episodes; this is not evidence of a resolved difference.

| Task | Model | Primary /90 | Repeat /90 | Drift (pp) | Matching /90 |
|---|---|---:|---:|---:|---:|
| PressButton | ACT | 41 | 46 | +5.6 | 65 |
| PressButton | DP | 54 | 50 | -4.4 | 56 |
| PressButton | BC | 36 | 32 | -4.4 | 68 |
| RotateValve | ACT | 76 | 75 | -1.1 | 85 |
| RotateValve | DP | 76 | 76 | +0.0 | 90 |
| RotateValve | BC | 67 | 63 | -4.4 | 86 |
| OpenHatch | ACT | 73 | 76 | +3.3 | 77 |
| OpenHatch | DP | 90 | 90 | +0.0 | 90 |
| OpenHatch | BC | 15 | 14 | -1.1 | 71 |
| CollectShell | ACT | 0 | 0 | +0.0 | 90 |
| CollectShell | DP | 30 | 24 | -6.7 | 62 |
| CollectShell | BC | 0 | 0 | +0.0 | 90 |
| PushSlider | ACT | 9 | 7 | -2.2 | 84 |
| PushSlider | DP | 38 | 40 | +2.2 | 88 |
| PushSlider | BC | 2 | 2 | +0.0 | 88 |
| PullLever | ACT | 36 | 29 | -7.8 | 77 |
| PullLever | DP | 46 | 46 | +0.0 | 88 |
| PullLever | BC | 22 | 21 | -1.1 | 83 |

Outcome agreement is 1,438/1,620 (88.8%). Small aggregate drift can conceal opposing episode flips. The largest absolute task/model mean drift is 7.8 pp (PullLever ACT).

The separate same-GPU seed-17 DP repeat agrees on 169/180 outcomes (93.9%); task counts change by at most one success out of 30, despite seven Shell and three Slider outcome flips. This does not identify the numerical source of execution variability. Controller, action-interface and current contrasts were not rerun across workstations in this comparison.

Regenerate: `python scripts/summarize_execution_variation.py`. Source hashes and all 18 comparisons: `research/revision-v2-execution-impact.json`.
