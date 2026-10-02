# External coefficient anchor and planned sensitivity

The reference is von Benzon et al., *An Open-Source Benchmark Simulator: Control
of a BlueROV2 Underwater Robot*, JMSE10(12),1898 (2022),
[DOI](https://doi.org/10.3390/jmse10121898),
[institutional full text](https://vbn.aau.dk/ws/portalfiles/portal/505520780/jmse_10_01898.pdf).
Table A1 and Section4 distinguish experimentally identified damping from empirical
added-mass estimates. They do not calibrate our arm-equipped assembly.

Positive coefficient magnitudes, axis order surge/sway/heave/roll/pitch/yaw:

| Term | Current WM base | Published reference |
|---|---|---|
| Added mass / inertia | 5.5,12.7,14.6,0.12,0.12,0.20 | 6.36,7.12,18.68,0.189,0.135,0.222 |
| Linear damping | 4,6,7,0.20,0.25,0.30 | 13.7,0,33,0,0.8,0 |
| Quadratic damping | 18,32,38,0.8,1,1.2 | 141,217,190,1.19,0.47,1.5 |

Use SI units in the wrench equation. Translational quadratic coefficients have
units N s²/m²; angular quadratic coefficients have units N m s²/rad².
The article's angular table unit labels require dimensional interpretation from
its equations, rather than blind transcription.

Before scoring new sensitivity rollouts, freeze four conditions on existing
OpenHatch/RotateValve policies: nominal, published base damping only, published
base added mass only, both published base groups. Preserve nominal arm estimates,
buoyancy, motor map, controller gains, geometry, task thresholds and reset pairs.
Keep existing reset randomization scales paired. Use diagnostic seeds70000+1000i
through70029+1000i with identical policy noise; declare each change in the trace.
Cross nominal and combined-reference conditions with integral multipliers0 and1
to test whether the controller finding survives this model assumption change.

This is a sourced alternate model condition, not measured error bars around WM
coefficients, hardware validation, or a claim that either coefficient set is
correct for this assembly. No tank/CFD/hardware experiment has been performed.
