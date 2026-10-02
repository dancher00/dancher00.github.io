# Verify installation

Run from the code repository root after [installation](installation.md).

## Verify the frozen source

```bash
python3 scripts/restore_reproduction_sources.py
python3 scripts/verify_publication.py
```

The bundled package is available directly in the checkout. Restoration verifies
all members before writing and preserves existing files that differ.
The source check needs no simulator and does not estimate task success.

## Load and step the environment

```bash
export WASMAN_ASSET_PROFILE=open-procedural-v1
OMP_NUM_THREADS=4 .venv/bin/python scripts/rollout_button_visual.py \
  --mode zero --purpose development --seeds 31000 --steps 16 \
  --output-dir artifacts/installation-zero
```

Choose a fresh output directory on every run. Check `report.json` for `mode: zero`,
`purpose: development` and 16 completed steps; inspect the saved trace for finite
values. No trained visual-policy checkpoint is required. A short zero-action run
checks scene loading and stepping, not physical task completion or benchmark scores.

## Record a demonstration

```bash
OMP_NUM_THREADS=4 .venv/bin/python scripts/benchmark.py collect \
  --task PressButton --purpose development --seeds 31000 \
  --output-dir artifacts/button-demo
```

This runs the task's expert and saves a complete episode with wrist RGB, action
and physical trace. Continue with [collection and audit](collect-demonstrations.md)
and [training](train-policies.md). Recorded feasibility and learned-policy
performance are separate measurements.
