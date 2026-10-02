# Bimanual FK audit: world-coordinate precision

This is a disclosed amendment to a numerical diagnostic after the two-hand and
support test runs. It does not change the controller, physical model, recorded
states, 170-degree success predicate, test resets or 100 micrometre tolerance.
The original freeze and failed audit remain available.

## Observed failure

The 30 independent simulations occupy origins separated by 12 m. Their global
coordinates therefore extend to 348 m, although each robot moves only near its
own local origin. PhysX and recorded tool coordinates use float32. The original
CPU audit compares double-precision local forward kinematics with those recorded
world transforms after subtracting the environment origin.

The support run completed 30/30 tasks and passed every sampled CAD, native joint
limit and motor-force check. Two individual tool samples exceeded the original
absolute-world FK bound: left hand, seed 92023 at 90.5667 s, 107.179 micrometres;
right hand, seed 92028 at 59.1 s, 104.556 micrometres. The final queue stopped and
did not open the third condition until this discrepancy was investigated.

## Translation counterfactual

The diagnostic assigns each offending recorded joint configuration and base
orientation to the same native articulation at several world translations. It
calls native forward kinematics without integrating physics, applying controller
commands or adding task contacts. Joint coordinates and orientations agree
exactly across translations.

| Recorded pose | Near origin | At the original distant origin |
|---|---:|---:|
| Seed 92023, left hand | 0.790 µm | 107.162 µm at y = 276 m |
| Seed 92028, right hand | 0.565 µm | 104.575 µm at y = 336 m |

The discrepancy is almost entirely along the translated axis. This reproduces
the audit failure by changing world origin alone; it is not evidence of a
controller failure or a physical limit violation. The diagnostic source,
assigned poses and raw transforms are retained with the evidence archive.

## Supplemental audit

`scripts/audit_bimanual_coordinate_precision.py` checks every powered 30 Hz
sample, with no phase or outcome exclusions. For each recorded pose it obtains
native TCP coordinates at the original world origin and near zero, holding the
recorded joint coordinates and orientation fixed. The difference measures the
world-coordinate rounding contribution. It retains three separate residuals:

1. Recorded TCP versus native FK at the original world origin.
2. Native FK near zero versus independent double-precision CPU FK.
3. Recorded TCP after removing the measured coordinate contribution versus CPU FK.

Each residual must remain below the original 100 µm threshold. All original CAD,
joint-position and motor-force checks still apply. The support audit checks
162,000 poses (both hands at each pose); its largest corrected TCP discrepancy is
61.182 µm. Reports preserve the uncorrected errors and hashes of the original
trace, original audit, native URDF, supplemental audit source and residual arrays.

`scripts/report_bimanual_coordinate_study.py` uses this supplemental verification
and otherwise retains the frozen result aggregation. It also checks equality of
the actual initial-offset arrays across the three conditions. The original
`report_bimanual_study.py` remains unchanged and still rejects the original
support audit. The amendment is applied consistently to all modes and separate
demo/reproduction trajectories; completed physical episodes are not rerun or
selected again.

This establishes consistency of sampled recorded kinematics to the stated
precision. It is not a proof of collision freedom between samples or calibrated
hardware accuracy. The native kinematic reconstruction is an audit operation,
not part of the controller or the rendered task dynamics.
