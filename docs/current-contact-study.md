# Water current: completion and execution effort

Two tasks × three frozen DP checkpoints × three transverse currents × 30 fresh
matched reset states: **540 full episodes**. Controller gains, hydrodynamic
coefficients, motor limits, rendering, action decoding and success criteria are
fixed. Current is applied before camera warmup through robot-link relative-water
forces. The zero-current baseline was newly executed for this study.

| Task | Current (m/s) | Seed 17 /30 | Seed 43 /30 | Seed 101 /30 | Mean ± SD (%) |
|---|---:|---:|---:|---:|---:|
| OpenHatch | 0.00 | 30 | 30 | 30 | 100.0 ± 0.0 |
| OpenHatch | 0.10 | 30 | 30 | 30 | 100.0 ± 0.0 |
| OpenHatch | 0.20 | 30 | 30 | 30 | 100.0 ± 0.0 |
| RotateValve | 0.00 | 24 | 29 | 26 | 87.8 ± 8.4 |
| RotateValve | 0.10 | 19 | 20 | 19 | 64.4 ± 1.9 |
| RotateValve | 0.20 | 17 | 23 | 22 | 68.9 ± 10.7 |

Valve's paired differences from zero current are −23.3 pp (descriptive 95%
interval [−43.3, −1.1]) and −18.9 pp ([−35.6, −2.2]). Intervals resample training
and reset identities independently, keeping conditions paired, over 20,000
draws. They are marginal, not multiplicity-adjusted. The response is not monotonic.

Hatch retains full observed completion while 20-second motor-force RMS rises
from 2.648 to 2.897 N at 0.20 m/s: **+9.4%**. This measures actuator effort,
not electrical energy. All episodes supply the entire 20-second window; no
allocation saturation is observed there. Valve contact-loss incidence is 1.1%,
36.7% and 46.7%. Contact loss requires prior contact and is an associated
execution change, not a demonstrated cause of failure.

## Figures, videos and evidence

The homepage **Results → Policy × control → Water current** contains interactive
success, motor-effort and contact-loss graphs, with one line per training seed.
Four silent, full-episode wrist recordings compare 0 and 0.20 m/s. Valve selects
the first reset with baseline success/current failure; Hatch selects its first
reset. Rerun outcomes match the scored outcomes in all four clips. The videos
are illustrations and do not replace scored episodes.

- [Frozen protocol](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/current-contact-5090/PROTOCOL.md)
- [Per-episode data](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/current-contact-5090/results/episodes.csv)
- [Per-training data](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/current-contact-5090/results/training-seeds.csv)
- [All paired effects and intervals](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/current-contact-5090/results/summary.json)
- [Video provenance and selection](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/current-contact-5090/video-manifest.json)
- [Private evidence archive receipt](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/current-contact-5090/release.json)

The intervention estimates response to the declared direction and onset, not a
pre-equilibrated flow field. Mechanism dynamics are unchanged. A five-second
expert pilot checks finite responses on disjoint development states; it is not
a full-horizon expert success cohort under current.
