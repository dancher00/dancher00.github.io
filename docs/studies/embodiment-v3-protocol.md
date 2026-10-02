# Common EE control on two floating robots: accepted-candidate protocol

This continues the [v2 development protocol](embodiment-v2-protocol.md). Original held-arm v1 scores and the published failed v2 gates are immutable. The task is PressButton with the original 4 mm travel, 13 cm distance, alignment >0.7, base attitude <0.25 rad and angular speed <0.35 rad/s for four 30 Hz samples. Native dimensions, masses, low-level gains, force limits, button spring and contacts are retained.

## Diagnosis and single controller correction

Raw PhysX and Isaac Lab orientation readers agree. A dry-rotation discrepancy remains solver-dependent; no universal engine fix is claimed. Replaying an identical native command stream at PGS 240/480 Hz passes the original contact tolerances (TCP RMS 0.979 mm, maximum orientation difference 0.0969 deg). The prior closed-loop controller fails at 1.0475 deg, implicating feedback amplification.

The shared reference-state IK now compensates measured arm displacement in the commanded **level-base frame**, removing actual base tilt from that translation compensation. The native attitude loop continues to control the base. It no longer uses translation to cancel the geometric effect of base rotation against the button. A CPU contract test rotates the whole robot without joint deflection and requires zero spurious translation correction. Both robots use this same rule (`--offset-frame level`).

The versioned model variants remain those already justified in v2: Blue geometry-scaled arm-fluid coefficients with no numerical acceleration clipping; Rex current articulated rigid inertia/reaction with base added mass, and lagged joint acceleration/contact. Rex arm added mass and hardware calibration remain absent. No inertia-axis reparameterization from isolated diagnostic experiments is used.

## Fixed candidate and release gates

- Three development resets: 85000–85002. Final 30 paired resets: 86000–86029, unopened until source/config freeze.
- Reference-state IK, level-frame arm compensation, 0.14 m approach, 6 mm measured-progress hold, 5 s settling, 8 s approach, 20 s episode, 30 Hz high-level control. Six millimetres is a controller target, not a changed success criterion.
- PGS on both platforms. Both contact checks must pass an adjacent-rate pair with RMS TCP difference <=10 mm, maximum base orientation difference <=0.5 deg, joint difference <=0.02 rad, identical success outcomes, finite telemetry, native motor bounds and no applied Blue fluid clipping. Use a common tested rate.
- Blue physical motor delay stays 8.333 ms and acceleration-filter time constant 18.673 ms. The runtime reports that external-forces-every-iteration is unsupported by PGS; the accepted solver is PGS and no TGS-only behavior is claimed.
- Audit actual-vs-URDF TCP kinematics and all sampled Rex poses against nonadjacent CAD hulls. Negative controls hold initial arm targets with motors off. They must fail.
- Freeze sources/assets before final resets. Independent 30 Hz replay must agree with live success. Once final tests begin, do not tune to their outcomes.

This compares complete robot/controller/fluid-model systems, not isolated morphology or learned transfer. Development success does not enter the 30-reset score. Final reporting includes every episode and descriptive reset percentiles, not training-seed uncertainty. No ACT/DP training is part of this study.

## Presentation

Use a separate, preselected development reset 85000 for each live observer video. No sound or text overlays. Other environments are hidden from rendering only; a noncolliding grounded support makes the fixed button fixture legible. Source trajectories and numerical scores come from the unmodified physical bodies. The same recorded clip is not an extra test episode. Rex propeller presentation is slowed for readability and follows realized motor forces.
