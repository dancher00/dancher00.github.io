# Physical models used by the reported comparisons

These are reduced-order simulation configurations, not identified models of the
assembled robots. The paper's numerical agreement checks are not tank or CFD
validation. Configuration hashes and the recorded runtime take precedence over
defaults in a newer checkout.

| Reported comparison | Fluid and rigid-body model | Coefficients and numerical evidence |
|---|---|---|
| Original PressButton RGB ACT/DP | BlueROV2/Reach Alpha; per-link buoyancy, diagonal added mass/Coriolis and linear/quadratic drag; 120 Hz physics | Assumed BlueROV-class base and generic arm estimates; no assembly calibration. This is the original core result, not the later articulated variant. |
| Marine core: Valve, Hatch, Shell, Slider, Lever; interface, recovery and PID/PD studies | Blue panel/grasp configuration, 240 Hz physics; per-link forces with geometry-scaled arm rotational coefficients | Base coefficients retained; arm rotational terms scaled by link geometry. Filtered finite-difference acceleration, componentwise 30 m/s² and 50 rad/s² guards. These are model terms and guards, not verified physical limits. |
| Extended HotStab/CabinRecovery/CargoRelease | Separate pinned Blue panel runtimes at 240 Hz, with scene-specific passive plug/HDD/door/rope loads and contact settings | Inherit the panel hydrodynamic family; payload displacement and drag are assumed. Corrected shipwreck scenes disable the large-step stabilization pass; do not replace their runtimes with core defaults. No assembly or payload fluid calibration. |
| Current/motor study | Same selected task configuration/checkpoint within each task; uniform current or reduced motor capacity | No stochastic turbulence. Current values and capacity changes are declared interventions; no fitted real-current envelope. |
| Articulated two-robot PressButton | Geometry-scaled Blue arm model; Rex rigid articulated reaction and base added mass | Native robot/controller configurations have different gains and models. Three-state development 240/480 Hz checks precede final paired resets; not an isolated morphology comparison. |
| Twin-arm RotateValve | Rex base added mass with lagged measured articulation/contact reaction; duplicated native arm mass, buoyancy and drag | No arm added mass or arm–arm flow. Separate scaled wheel and explicitly moved unused rail in cooperative mode. Three-state 240/480 Hz development evidence; 30-reset final execution comparison at 240 Hz. |
| Boundary illustration | Optional reduced-order wall/seabed terms; identical wrench commands, feedback off | Assumed proximity terms, zero recorded contacts; sensitivity demonstration only. These terms are not enabled throughout the core benchmark. |
| Optical illustration | Replay of the same physical trajectory with different image formation | Assumed attenuation/backscatter/refraction/particles; no multiple-scattering or camera-housing calibration, and no learned-policy water test. |

## Coefficient provenance and implementation

The Blue base uses displaced volume `13/1025 m³`, center of buoyancy
`(0,0,0.035) m`, and positive body-axis coefficients in XYZ/rotation order:

| Term | Diagonal coefficients |
|---|---|
| Added mass (kg; kg m²) | `(5.5,12.7,14.6,0.12,0.12,0.20)` |
| Linear damping (N s/m; N m s/rad) | `(4,6,7,0.20,0.25,0.30)` |
| Quadratic damping (N s²/m²; N m s²/rad²) | `(18,32,38,0.8,1,1.2)` |

These are engineering assumptions in
[`bluerov2_alpha.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/assets/bluerov2_alpha.py), not measured
coefficients for this robot/arm assembly. Generic arm displacement is mass/1025;
translational added mass is `(0.08m,0.45m,0.45m)`. In the grasp variant,
[`grasp_hydrodynamics.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/assets/grasp_hydrodynamics.py) replaces
rotational added mass and linear drag by the maximum translational coefficient
times `L²/12`, and rotational quadratic drag by the maximum translational
coefficient times `L³/32`. Non-wetted bookkeeping frames have zero fluid terms.
The base coefficients remain unchanged.

[`hydrodynamics.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/physics/hydrodynamics.py) implements per-link
water-relative forces. Original/core environments pass density 1025 kg/m³ and
acceleration filter 0.2; they retain the constructor's acceleration guards.
An articulated probe can use a different closure; do not infer its guards from
the core environment. Environment inheritance and overrides are in
[`env_cfg.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/tasks/underwater_panel/env_cfg.py) and
[`linear_cfg.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/tasks/underwater_panel/linear_cfg.py).

Rex coefficients are parsed from the native model by
[`rexrov2.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/physics/rexrov2.py), including FRD-to-FLU conversion
and symmetrization of the source added-mass matrix. Density is 1028 kg/m³.
[`rexrov2_articulated.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/physics/rexrov2_articulated.py) and
[`rexrov2_bimanual.py`](https://github.com/dancher00/wasserman/blob/main/src/wasman/physics/rexrov2_bimanual.py) define the
articulated closures. Native-model provenance is not experimental calibration
of the custom twin-arm assembly.

The twin-arm fixture enlarges linear dimensions 4×: mass/volume 64× and inertia
1024×. Passive shaft friction/damping scale 64× under an assumed constant-shear
rule. This 506 mm wheel does not replace the original visual-policy valve.
T200 steady thrust uses the manufacturer's 16 V curve; response delay, deadband
and lag are assumptions. Rex motor limits are the native 1540 N model limits.

## Same-metric numerical sensitivity

`paper/build_numerical_sensitivity.py` derives turning-phase RMS and motor peaks
from six original, SHA-256-verified development trajectories: all three modes,
240/480 Hz, seeds 91000–91002. It preserves each rollout's measured phase clock.
The cooperative-minus-free orientation contrast is −0.02874° at 240 Hz and
−0.02802° at 480 Hz; motor peak differences are −3.6789 and −3.6746 percentage
points. Support-minus-free orientation is +0.00964° and +0.00276° respectively.
This supports local numerical consistency of the cooperative contrast, not a
convergence order or an error bound for all 30 final resets. All three modes
already succeed; neither a larger success envelope nor physical superiority is
established.
