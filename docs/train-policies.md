# Train a reference policy

## Current open-core protocol

The open core trains ACT, diffusion policy (DP) and chunked behavioral cloning
(BC). Collect and audit data with the [source campaign](reproduction.md), then
train an individual model from its generated task dataset:

```bash
WASMAN_ASSET_PROFILE=open-procedural-v1 .venv/bin/python scripts/train_revision_policy.py \
  --task PressButton --model ACT --seed 17 \
  --data artifacts/open-core/data/PressButton \
  --output-dir artifacts/retrained-button-act17
```

For this individual command, retain the raw task RGB until training finishes;
the complete campaign archives it losslessly after fitting its reference models.
Use `restore_revision_rgb.py` when working from those local lossless archives.

The same entry point accepts `--model DP` or `--model BC`. Use a fresh output
directory for each run. The frozen primary protocol requires seeds 17, 43 and
101, the identical 76/4 whole-episode split and 320,000 sampled windows, with the
final-budget checkpoint for every family. The trainer checks the open asset
profile, runtime hashes and physical dataset audit; it rejects pilot data for
primary training. See the [protocol](revision-v2-protocol.md) for full cohorts and
the [reproduction record](revision-v2-reproduction.md) for completed checks and
cross-workstation limits. A task package's final checkpoints do not contain the
optimizer state needed to resume their historical intermediate updates.

## Historical CAD-profile training

Training is optional when evaluating an existing compatible checkpoint. The source release
provides trainers and configuration snapshots; it does not distribute the original
raw RGB datasets. New demonstrations produce a new experiment, not an exact
retraining of an unavailable historical dataset.

## Before training

Install the pinned policy overlay, collect whole episodes and pass the task's
independent dataset audit. Confirm ordered state/action fields, image processing,
control rate and train/validation splits. Keep test observations out of training
and checkpoint selection. See [collection](collect-demonstrations.md).

## Native PushSlider example

Inspect these commands first. `--dry-run` prints the original backend without
launching a learner:

```bash
.venv/bin/python scripts/benchmark.py train --task PushSlider --model ACT \
  --data artifacts/my-slider-data --output-dir logs/my-slider-act \
  --episodes 80 --steps 20000 --batch-size 8 --seed 42 --dry-run
.venv/bin/python scripts/benchmark.py train --task PushSlider --model DP \
  --data artifacts/my-slider-data --output-dir logs/my-slider-dp \
  --episodes 80 --epochs 40 --batch-size 64 --microbatch 8 --seed 42 --dry-run
```

Remove `--dry-run` only when intentionally starting that experiment. Output
directories must be fresh. DP gradient accumulation preserves effective batch
size 64; a smaller microbatch changes memory use, not that effective batch size.
Initial encoder weights and their provenance must match the selected protocol.

## Preserve the actual comparison

The core ACT configurations use 80 training episodes. DP uses 76 training and
four held-out episodes from 80 available demonstrations. ACT and DP budgets are
not equal compute. Original per-task configs in `benchmarks/core/configs/` and
`research/core-datasets.json` are authoritative, including other task-specific
execution details. HotStab uses 59 successful training demonstrations and eight
separate development states, with its own budgets and cameras.

Archive the data identity, source hashes, config, normalization statistics,
training seed, logs and checkpoint-selection rule. Reload a checkpoint in a clean
process and inspect predictions on recorded observations before a closed-loop run.
Select checkpoints using the declared validation protocol, then evaluate on a
separate fixed test set. Published test sets are for replication, not tuning.

## EE interface study

The recorded EE experiments use `prepare_research_dataset.py` and the
`train_research_act.py` / `train_research_dp.py` backends. Passing `--interface ee`
to the common launcher selects those trainers for PushSlider/PullLever. An EE
view must have audited expert-command replay and its own normalization. It is not
an interchangeable label on a native actuator dataset. See [interfaces](data-and-interfaces.md).
