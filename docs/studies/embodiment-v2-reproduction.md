# Moving-arm development: reproduce the numerical blocker

This is a development audit, not a new benchmark result. The original held-arm
0/30 and 30/30 scores remain frozen. Read the [audit](embodiment-v2-audit.md) and
[protocol](embodiment-v2-protocol.md) before running anything. New final states
86000–86029 remain unopened.

The scope follows AM-Bench's [embodiment study](https://arxiv.org/html/2609.00641v1#S4.SS3):
a shared scripted end-effector objective with IK and native low-level control.
It does not require training ACT/DP again on each robot. Here the compared systems
also differ in fluid-model assumptions, so an isolated morphology claim would be
unsupported.

Use the pinned simulator installation from [Installation](../installation.md).
The audit additionally uses `pin==4.1.0` and, only for observer video,
`imageio-ffmpeg==0.6.0`. Current runtime: Python 3.12, torch 2.12.0+cu130,
numpy 2.5.3, Warp 1.17.0. These checks have not yet been repeated on an independent
machine. Results and checksums are in
[benchmarks/embodiment-development](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/embodiment-development).

```bash
# CPU-only identities and adapter contracts
.venv/bin/python -m pytest tests/test_rex_articulated.py tests/test_embodiment_ik.py -q

# Isolated dry native-articulation integration, no fluid or task controller.
# Use fresh output paths; preserve previous evidence.
.venv/bin/python scripts/audit_blue_rotation_integration.py \
  --dt 0.0020833333333333333 --solver-type 1 --output rotation-tgs.json
.venv/bin/python scripts/audit_blue_rotation_integration.py \
  --dt 0.0020833333333333333 --solver-type 0 --output rotation-pgs.json

# Same development states and controller, opt-in PGS / geometry-scaled fluid.
.venv/bin/python scripts/probe_blue_articulated.py \
  --control-mode ik --ik-mode reference --stroke .14 --hold-travel .006 \
  --hydro-variant geometry-scaled --acceleration-cap none --solver-type 0 \
  --dt 0.004166666666666667 --seeds 85000 85001 85002 --output-dir blue-pgs-240
.venv/bin/python scripts/probe_blue_articulated.py \
  --control-mode ik --ik-mode reference --stroke .14 --hold-travel .006 \
  --hydro-variant geometry-scaled --acceleration-cap none --solver-type 0 \
  --dt 0.0020833333333333333 --seeds 85000 85001 85002 --output-dir blue-pgs-480
.venv/bin/python scripts/audit_embodiment_timestep.py \
  blue-pgs-240 blue-pgs-480 --output blue-pgs-gate.json
```

The archived gate is **false**; 3/3 development success does not override the
attitude disagreement. `freeze_articulated_study.py` refuses failed gates, and
`run_articulated_embodiments.py` requires a source-bound passing manifest.
There is no accepted v2 final manifest or final score. Do not use the final runner
until a numerical remedy passes the declared gates.

The opt-in modules do not change registered task defaults, the original physical
success predicate, old checkpoint evaluation, or frozen runtime pins. Failed
variants and the raw Rex diagnostic take remain in the development evidence
archive; that take is not the final synchronized comparison film.
