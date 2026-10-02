# Two articulated robots on PressButton

**BlueROV2/Reach Alpha: 30/30. RexROV2/Oberon7: 30/30.** These are scripted EE/IK
results on the same 30 new initial TCP displacements, seeds 86000–86029. Both bases
float freely. Independent replay of all success predicates agrees with the live
scores; both motors-disabled controls fail. No ACT/DP training was performed.

The [source/configuration manifest](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/articulated-embodiments-v3/frozen-manifest.json)
was written before opening these final states. All 719 frozen source/asset files
were retained. The final simulation uses PGS at 240 Hz, with 30 Hz high-level
control. All final episodes are reported; there was no tuning after evaluation.

| Validation | Blue | Rex |
|---|---:|---:|
| Final task success | 30/30 | 30/30 |
| Motors disabled | Failure | Failure |
| Development 240/480 Hz TCP RMS disagreement | 0.959 mm | 1.247 mm |
| Development maximum attitude disagreement | 0.0685° | 0.0885° |
| Final URDF/actual TCP maximum difference (5 Hz) | 10.0 μm | 67.9 μm |
| Contact-phase base attitude RMS | 0.716° | 0.219° |
| Peak motor-force/native-limit ratio | 2.99% | 24.80% |

All 18,000 sampled Rex control poses pass the nonadjacent CAD-hull self-collision
check. These sampled checks do not prove absence of every possible substep contact.
Native motor/joint limits pass, telemetry remains finite, and the Blue variant
applies no numerical fluid-acceleration clipping. Contact-phase TCP **goal** errors
are 42.0 and 50.9 mm RMS: these include intentional preload/hold and controller
response, and are not isolated IK solver errors. The complete success predicate,
including alignment and base stability, is retained.

## What was fixed

The old held-arm v1 scores (Blue 0/30, Rex 30/30) remain unchanged. Blue reached
only about 2.21 mm of the original 4 mm required button travel. That recording
has insufficient wrench telemetry to uniquely attribute the historical failure.

For the new articulated controller, replaying an identical native action stream
at 240/480 Hz passed the declared tolerances (0.979 mm TCP, 0.0969° orientation),
whereas the earlier closed loop differed by 1.0475°. This isolated amplification
through feedback. The common IK adapter compensated measured arm displacement
in the world frame, including actual base tilt. It now uses the commanded level
base frame: arm deflection is compensated while the native attitude controller
controls base rotation. A unit check requires that rotating the whole robot
without joint deflection cannot produce spurious translation compensation.
Both platforms then passed fresh contact timestep gates, before final evaluation.
The dry-rotation solver discrepancy remains documented; no universal PhysX fix
is claimed.

Explicit model variants are disclosed in the [protocol](embodiment-v3-protocol.md):
Blue uses geometry-scaled arm-fluid coefficients; Rex uses current articulated
rigid inertia and reaction, native base added mass, and lagged acceleration/contact
estimates. Rex arm added mass is not modeled. Native geometry, masses, joint
actuators, low-level gains, motor limits and button physics are retained. The
6 mm controller hold target does not alter the 4 mm physical success threshold.
These variants do not overwrite historical task defaults.

This is a comparison of complete robot/controller/fluid-model systems. It does
not isolate morphology, establish learned-policy transfer, or validate a real
vehicle. The filmed seed 85000 was preselected and is separate from final scoring;
videos are uncut at real time, without audio or overlays. Rex propeller rotation
is slowed for readability and follows realized motor forces. Visual fixture
supports have no colliders; hidden negative-control environments still simulate.

## Reproduce and inspect

Use the simulator environment described in [installation](../installation.md).
The release manifest identifies the exact source hashes and software environment.
Download `articulated-embodiments-v3-evidence.tar.gz` from the
[private release](https://dancher00.github.io/wasserman/docs/artifacts/)
for final trajectories, all continued development runs, failed diagnostics, gates,
reports, plots and individual demonstration takes. Existing v2 audit evidence is
retained in its separate release.

From this repository, with a fresh output directory for each command:

```bash
python scripts/run_articulated_embodiments.py --robot blue \
  --manifest benchmarks/articulated-embodiments-v3/frozen-manifest.json \
  --output-dir artifacts/reproduced-blue
python scripts/run_articulated_embodiments.py --robot rex \
  --manifest benchmarks/articulated-embodiments-v3/frozen-manifest.json \
  --output-dir artifacts/reproduced-rex
python scripts/report_articulated_embodiments.py artifacts/reproduced-blue \
  artifacts/reproduced-rex --output artifacts/reproduced-summary.json
python scripts/audit_embodiment_fk.py artifacts/reproduced-blue \
  artifacts/reproduced-rex --output artifacts/reproduced-fk.json
python scripts/audit_articulated_cad.py artifacts/reproduced-rex \
  --output artifacts/reproduced-cad.json
```

Add `--split demo` to the wrapper for a separate preselected filmed take, or
`--check-only` to validate the source freeze without starting simulation.
