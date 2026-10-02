# Reproduce the bimanual valve study

All three modes score 30/30 on the fixed paired test cohort. The commands below
require the completed study's `frozen-sources.json`. Do not
generate a replacement manifest to bypass a missing artifact or a source mismatch.

The simulation and renderer revision is
`6cc568d08bc5db239cf07e180e95d1829fa46369`. Revision
`52be64c489304326ffee0a55993d2cbe0ceb3cab` adds the documented
[coordinate-precision audit](bimanual-coordinate-audit.md) without changing any
of those 749 frozen source, asset and environment files. Use the latter revision
for simulation commands below. The original manifest was created after the simulation
commit. A newer publication
commit may add reports, paper sources and website material while retaining those
exact runtime bytes. The protocol document itself is frozen: its development-era
status paragraphs are historical provenance, not the current campaign status.

This is a scripted-control study on a custom twin-Oberon Rex, with a separate
506 mm passive valve. It does not replace the original RotateValve ACT/DP results
or the native two-platform PressButton study. See the
[physical model and fixed protocol](bimanual-valve-v1-protocol.md).

## Obtain the recorded evidence

Run downloads from the current publication branch, before entering the pinned
runtime: the older runtime commit predates the final artifact registry.
The versioned `bimanual-evidence` artifact contains the original development,
final and demo traces, sampled audits, coordinate counterfactual and the
same-machine clean-install reproduction. Downloading it does not start a run:

```bash
python3 scripts/fetch_paper_artifacts.py fetch --artifact bimanual-evidence \
  --destination .maintenance/backups/bimanual-evidence-download \
  --cache .maintenance/backups/download-cache
mkdir .maintenance/backups/bimanual-evidence-view
python3 -m tarfile -e \
  .maintenance/backups/bimanual-evidence-download/bimanual-valve-v1-evidence.tar.gz \
  .maintenance/backups/bimanual-evidence-view
```

Use the archive's `bimanual-valve-v1/manifest.json` to inspect per-file hashes.
`campaign/summary.json` reports the 90 powered test episodes; `clean-reproduction/`
contains three separate demo repeats and their motors-disabled controls. Failed
preflights and original numerical diagnostics remain in `diagnostics/`.
The `bimanual-demo-free`, `bimanual-demo-support` and `bimanual-demo-two-hands`
artifact IDs download the three final silent pool films separately. The complete
website bundle already includes those films.

## Install and verify the runtime

From the current publication checkout, retain the manifest's absolute path and
prepare the isolated runtime:

```bash
export WM_BIMANUAL_MANIFEST="$(pwd)/benchmarks/bimanual-valve-v1/frozen-sources.json"
python3 scripts/paper_release.py prepare --runtime bimanual \
  --directory .maintenance/checkouts/bimanual-v1
cd .maintenance/checkouts/bimanual-v1
```

Follow [installation](../installation.md) inside this checkout, skipping its
clone step, and install the optional recording dependency:

```bash
uv pip install --python .venv/bin/python --no-deps -r research/media-requirements.txt
.venv/bin/python scripts/run_bimanual_study.py \
  --manifest "$WM_BIMANUAL_MANIFEST" \
  --mode two-hands --split final --output-dir artifacts/bimanual-replica/two-hands \
  --check-only
```

The launcher checks frozen source/asset hashes before running. `--check-only`
prints the exact command and reset IDs; it does not evaluate success. Use the
recorded Python/Isaac Lab/package versions and preserve authorized mesh files.
Choose fresh output directories for every execution.

The pinned checkout does not itself contain the later benchmark manifest.
The variable above points back to the publication copy. Alternatively set it to
the extracted archive's `bimanual-valve-v1/campaign/frozen-sources.json`. This is
an evaluation input, not a file to regenerate after inspecting test outcomes.

## Repeat the three-condition benchmark

Run one physics process at a time. Each mode uses the same 30 test reset IDs
92000–92029, a 180-second physical horizon, 240 Hz physics and 30 Hz commands.
An extra motors-disabled control is simulated but excluded from the denominator.

```bash
set -e
for mode in free support two-hands; do
  OMP_NUM_THREADS=4 .venv/bin/python scripts/run_bimanual_study.py \
    --manifest "$WM_BIMANUAL_MANIFEST" \
    --mode "$mode" --split final --output-dir "artifacts/bimanual-replica/$mode"
  .venv/bin/python scripts/analyze_bimanual_trace.py "artifacts/bimanual-replica/$mode"
  .venv/bin/python scripts/audit_bimanual_trace.py "artifacts/bimanual-replica/$mode"
  .venv/bin/python scripts/audit_bimanual_coordinate_precision.py \
    "artifacts/bimanual-replica/$mode" \
    --output "artifacts/bimanual-replica/$mode-coordinates"
done
.venv/bin/python scripts/report_bimanual_coordinate_study.py \
  --runs artifacts/bimanual-replica/free artifacts/bimanual-replica/support \
         artifacts/bimanual-replica/two-hands \
  --coordinate-audits artifacts/bimanual-replica/free-coordinates \
         artifacts/bimanual-replica/support-coordinates \
         artifacts/bimanual-replica/two-hands-coordinates \
  --split final --output artifacts/bimanual-replica/summary.json
.venv/bin/python scripts/plot_bimanual_study.py artifacts/bimanual-replica/summary.json \
  --output-dir artifacts/bimanual-replica/plots
```

`free` parks the left arm; `support` grasps the fixed rail with it; `two-hands`
turns the wheel with both hands. The first two modes retain identical fixture
geometry. In the two-hand extension the unused rail is moved aside. The base is
free floating in all three conditions.

Success remains sampled signed shaft rotation of at least 170 degrees. Contact,
tracking and actuator-load diagnostics do not silently add success criteria.
The separate CAD audit checks sampled robot self-collision, native joint limits,
motor force limits and forward kinematics. Read audit reports as well as the
endpoint result. Contact work estimates use 30 Hz samples; they are not actuator
energy measurements. Orientation diagnostics use float64 quaternion geometry to
retain small rotations that float32 inverse-cosine diagnostics can round to zero.
The supplemental FK audit separates float32 world-coordinate rounding from
kinematic disagreement; all three residual checks retain the 100 µm bound.
The original absolute-world discrepancies remain recorded. This read-only
diagnostic amendment does not rerun or replace physical episodes.

## Record the separate pool demonstration

Demo reset 91003 is separate from the test cohort. Record its physical motion
first, then render the measured states. This avoids concurrent camera/dynamics
workloads without modifying the simulated trajectory.

```bash
OMP_NUM_THREADS=4 .venv/bin/python scripts/run_bimanual_study.py \
  --manifest "$WM_BIMANUAL_MANIFEST" \
  --mode two-hands --split demo --physics-only \
  --output-dir artifacts/bimanual-demo/two-hands
.venv/bin/python scripts/analyze_bimanual_trace.py artifacts/bimanual-demo/two-hands
.venv/bin/python scripts/audit_bimanual_trace.py artifacts/bimanual-demo/two-hands
.venv/bin/python scripts/audit_bimanual_coordinate_precision.py \
  artifacts/bimanual-demo/two-hands --output artifacts/bimanual-demo/two-hands-coordinates
OMP_NUM_THREADS=4 .venv/bin/python scripts/render_bimanual_trace.py \
  --run artifacts/bimanual-demo/two-hands \
  --output-dir artifacts/bimanual-demo/two-hands/pool-render
```

Use `support` and `free` in fresh directories for the other two films. Output is
180 seconds at 1280×720, 30 fps, real time, silent and without text overlays.
`observer.json` records trace/asset hashes, tool-pose agreement and clearance from
the pool floor, walls and water surface. `--snapshots-only` produces a framing
preview marked incomplete; it cannot substitute for a final movie.

The existing pool and textured wall are presentation geometry. Rendering does
not add boundary hydrodynamics, rerun physics or change success. Rotor animation
follows recorded motor forces with slowed display rotation, not physical RPM.

## Interpret a reproduction

The original development comparison checks all three modes at 240 and 480 Hz on
reset IDs 91000–91002 before opening the final cohort. Repeating a published
cohort is reproduction, not a new independent test for a subsequently tuned
controller. Preserve failed runs and use separate output paths.

A clean environment on the same workstation verifies installation and recorded
execution to its stated scope. It does not establish independent-machine or
hardware transfer. The [reproduction record](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/bimanual-valve-v1/reproduction.json)
identifies the tested commit, reset IDs, full horizon and numerical discrepancies;
package versions are fixed by the original source manifest.
