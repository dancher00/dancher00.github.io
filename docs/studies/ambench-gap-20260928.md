# Remaining gaps relative to AM-Bench

Comparison checked against [AM-Bench v1](https://arxiv.org/html/2609.00641v1),
28 September 2026. Task contracts and robots differ; success percentages cannot
rank the two suites directly.

| Axis | AM-Bench | Current WasserMan publication |
|---|---|---|
| Policy matrix | 12 tasks × 8 configurations, including VLA transfer | Six core tasks × ACT/DP; separate HotStab and two corrected shipwreck protocols |
| Low-level control | Five stacks on two tasks, including MPC and L1 | Completed PID/PD and action-interface interventions; MPC/Adaptive are planned |
| Embodiment | Four platforms; scripted experts | Two native robot/controller configurations on PressButton; custom twin-arm expert study |
| Physical validation | Hardware effects and learning-pipeline tests | Simulation only; no hardware or CFD calibration |

Our two-arm comparison is an additional capability, but does not yet establish
learned bimanual manipulation. The regular study has 30 paired resets per mode;
the rapid-command recording is a single illustrative reset with an explicit
joint-limit audit limitation. Neither is evidence of broad underwater policy
transfer or general two-hand superiority.

A bounded [second-machine check](../second-machine-results.md) now passes one
expert and one DP RotateValve episode. It does not reproduce the full cohort
or training. For a stronger simulation paper, prioritize clear asset/data access,
a sharper contribution, and validated numerical or literature-grounded ranges
for the hydrodynamic model. Hardware is unavailable; state that boundary rather
than imply physical validation. For a later experimental extension, learned
bimanual ACT/DP and held-out visual water conditions would address specific gaps.
These are proposed extensions, not newly launched jobs or completed results.

Before submission: review novelty and citations, finalize authorship and venue
disclosures, and prepare anonymized reviewer access. Current private GitHub
releases retain development provenance and are not anonymous review packages.
No extra training-seed campaigns are required by this update.
