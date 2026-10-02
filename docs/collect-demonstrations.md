# Collect and audit demonstrations

Use a development checkout and new reset states. Do not modify a pinned runtime
or tune against the published test cohort. A successful expert establishes
feasibility under its contract, not learned-policy success.

The examples below describe the historical collection tools. For current
open-core primary data, follow the fixed candidate streams and
`audit_revision_dataset.py` in the [revision protocol](revision-v2-protocol.md),
or run its [complete source campaign](reproduction.md). The historical
`dataset_audit.json` and revision `revision_audit.json` are different contracts.

## Record a first development episode

After installation, run the PressButton collection example in
[Verify installation](first-run.md). Full primary datasets use the frozen
candidate streams in `run_revision_campaign.py`; arbitrary development episodes
are not primary training data.

## Record one native marine episode

PushSlider and PullLever share the native 30 Hz marine recording schema. This
example records one development episode and its wrist RGB:

```bash
OMP_NUM_THREADS=4 .venv/bin/python scripts/rollout_marine_visual.py \
  --task PushSlider --mode collect --purpose development --seeds 12000 \
  --steps 1790 --output-dir artifacts/my-slider-pilot
```

Collection uses privileged expert feedback. Deployment of a visual policy must
use `--mode policy`; it must not call the expert for replacement actions.
Retain the report, failed episodes, source hashes and physical trace. Inspect
approach, grasp, mechanism motion and release in their recorded order.

## Audit the pilot

```bash
.venv/bin/python scripts/audit_marine_dataset.py \
  --data artifacts/my-slider-pilot --episodes 1 --pilot
```

The audit requires a successful whole episode. It checks RGB, frame/action
alignment, finite state/commands, actuator packing and physical success replay.
A failed collection episode is not made successful by changing the predicate.
A pilot audit is deliberately not accepted by the final trainers.

## Build a training dataset

Collect batches into a dedicated dataset directory using unique, declared
training seeds, separate from validation and test resets:

```text
my-slider-data/
  train_batch00/seed_<id>/metadata.json
  train_batch00/seed_<id>/trajectory.npz
  train_batch00/seed_<id>/wrist.rgb
  train_batch01/...
```

Once 80 successful demonstrations are available, audit the complete selected set:

```bash
.venv/bin/python scripts/audit_marine_dataset.py \
  --data artifacts/my-slider-data --episodes 80
```

The resulting `dataset_audit.json` identifies the exact ordered successful seeds
and file hashes. The trainers reject a mismatched task, insufficient data, a pilot
report or a different audited selection. Existing audit files are preserved.
Raw RGB can be large: inventory the requested episodes before transferring data.

## Other protocols

RotateValve, OpenHatch, CollectShell and PressButton retain their original
recorders and loaders. Use the backend mapping in [task reference](task-reference.md)
and the task's frozen protocol. HotStab uses its isolated runtime, two robot cameras
and a geometric audit. Do not convert datasets by renaming files or assume that
all six tasks share the same action vector. See [data contracts](data-and-interfaces.md).
