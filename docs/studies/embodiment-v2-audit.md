# PressButton embodiment audit (27 September 2026)

**Status: development. The 30 reserved paired resets (86000–86029) have not been opened.**
This study compares two complete robot/controller systems with a common scripted EE objective. It does not test learned-policy transfer or isolate robot morphology.

## What the original result establishes

The frozen held-arm study remains BlueROV2/Reach Alpha **0/30**, RexROV2/Oberon7 **30/30**. Independent success replay agrees. The actual initial TCP displacements match within approximately 6 micrometres. Every Blue late-window predicate except the 4 mm button travel passes; maximum travel is approximately 2.21 mm. The observed failure is insufficient pressing depth. The old Blue recording lacks contact-wrench telemetry, so it does not uniquely identify geometry, controller compliance or hydrodynamics as the cause.

Source: `artifacts/embodiment_v2_20260927/held-arm-audit.json`. Original traces are unchanged under `artifacts/held_arm_embodiments_20260924`.

## Moving-arm implementation and diagnosed problems

1. **Tool frames:** Alpha's raw gripper link has an intrinsic roll of about 1.94 rad. Asking it for raw identity orientation produced out-of-range commands in the first new probe. The adapter now declares a fixed gripper-frame calibration and respects the existing action bounds. This was a new adapter defect, not evidence about the old held-arm failures.
2. **Rex rigid reaction:** its former added-mass closure assumed a held arm. The opt-in articulated closure uses current composite rigid inertia and joint reaction from RNEA, with native masses, base added mass and forces. Imported PhysX base inertia agrees with the URDF calculation within 0.00023. The no-contact 240/480 Hz development pair passes the declared gate (TCP RMS difference 6.268 mm; attitude 0.1813 degrees; joint difference 0.000211 rad). Joint acceleration/contact remain one-step estimates; arm added mass and hardware validation are absent.
3. **Load compensation and contact:** absolute IK corrections retained a Rex height error of approximately 133 mm. Resolved-rate integration compensates load, but unbounded integration winds into the button's stop. The retained reference-state IK plans native joint commands from URDF kinematics and compensates measured arm deflection through the base. At a declared pressing target it holds the last native commands. The current candidate targets 6 mm travel for this latch; physical success remains 4 mm plus the original alignment, distance, stability and hold conditions.
4. **Time units:** initial Blue rate checks inadvertently changed motor transport delay and acceleration-filter time constant with the timestep. Subsequent checks preserve the nominal 8.333 ms transport delay and 18.673 ms filter time constant. Old confounded diagnostics are retained and are not pure integration-rate evidence.
5. **Legacy Blue arm-fluid coefficients:** every-step monitoring records acceleration limiting on 4,787/4,800 steps in every powered development episode, without force/torque clipping. The generic rule assigns 0.01–0.02 kg m² rotational added inertia to small fingers and bookkeeping frames (the tool frame's dry diagonal inertia is 1e-6 kg m²). The existing geometry-scaled grasp-model variant removes independent wetted-body loading from bookkeeping frames and scales rotational coefficients with dimensions. With the same controller and 240 Hz step, all three episodes then have **zero** acceleration/force/torque limiting. This supports replacing the legacy arm-fluid approximation in an explicitly versioned articulated study; it does not retroactively alter the old benchmark or establish calibrated hydrodynamics. The variant changes rotational added inertia and damping together, so this comparison is not an isolated coefficient ablation.

Coefficient source comparison: `artifacts/embodiment_v2_20260927/blue-coefficient-audit.json`.
Limiter comparison: `blue-hydro-audit-240/trace.npz` versus `blue-scaled-240/trace.npz` in the same study directory.

## Current blocking result

The final 30-state comparison is **not run**. No ACT/DP training was launched.

The Rex reference-state, 0.14 m approach candidate passes its TGS 480/960 Hz contact check: TCP RMS disagreement 6.363 mm, maximum attitude disagreement 0.224 degrees, and joint disagreement 0.00362 rad. All 1,800 development poses pass the nonadjacent CAD-hull self-collision check. Six CPU tests pass. These selected checks do not establish universal moving-arm or hardware validity.

Blue preserves 3/3 development success at every tested rate with the scaled, unclipped fluid variant, but fails the predeclared maximum 0.5-degree attitude agreement:

| Solver | Rates (Hz) | TCP RMS disagreement (mm) | Maximum attitude disagreement (degrees) | Gate |
|---|---|---:|---:|---|
| TGS | 240 / 480 | 0.938 | 1.257 | failed |
| TGS | 480 / 960 | 1.011 | 0.599 | failed |
| TGS | 960 / 1920 | 5.289 | 2.421 | failed |
| PGS | 240 / 480 | 1.024 | 1.048 | failed |

A separate dry, zero-gravity, contact-free native-articulation test isolates a solver-dependent rotation discrepancy from water and control. At 0.01 rad/s over two seconds, TGS integrates angular velocity to 0.020001 rad but accumulates only 0.017479 rad yaw; PGS accumulates 0.019770 rad. At the slowest 0.001 rad/s case, TGS accumulates no rotation despite 0.002 rad integrated velocity. The precise engine-internal cause remains unproven. PGS improves this micro-test but **does not pass the contact gate**, so it is not an accepted remedy.

A separate Rex development take (reset 85000, TGS 480 Hz) records an independently replayed success and a failed motors-off control. It is not a final evaluation. Its raw observer video also shows the distant negative-control robot in the background; it is retained as diagnostic evidence, not promoted as the site's final comparison film.

Next: isolate the remaining contact discrepancy using identical recorded native commands and per-physics-step pose/velocity/contact telemetry, then validate a numerical remedy against both free rotation and contact. Do not repeat training, open final states, weaken the gate, or tune to final outcomes. Resume the frozen 30-pair comparison only after this blocker is resolved.

## Acceptance and reporting

The protocol and development history are in [embodiment-v2-protocol.md](embodiment-v2-protocol.md). Contact convergence, not a favorable success count, gates final evaluation. The held-out states must remain unopened until the controller, physical-model variant and source files are frozen. A failed or numerically marginal development episode is retained. Development scores must not be merged into the 30-reset benchmark.

The website and current paper still show the historical held-arm study. New plots, videos and final scores will be added only after the declared gates pass, with model/controller changes disclosed separately from the original v1 results.
