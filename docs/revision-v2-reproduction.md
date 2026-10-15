# Reproduction records and execution contract

The benchmark connects each reported outcome to a checkpoint, ordered reset
cohort, rollout seed, precision, source version and complete task horizon.
Diffusion noise is assigned by batch slot, so cohort order is part of the
execution contract. Saved physical traces are rescored with the recorded
task-success predicate.

## Public inputs

- [Demonstrations](https://huggingface.co/datasets/dancher00/WasserMan): original attempts, selected episodes, lossless RGB, measured state, commands and fixed whole-episode splits.
- [Primary policy models](https://huggingface.co/dancher00/WasserMan-models): ACT, DP, chunked BC, EE-interface and SmolVLA checkpoints, configurations and selective download tools.
- [Policy and execution studies](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3): paired evaluation traces, history and trajectory-mixture models, expert candidate streams, RGB controls and analysis records.

These repositories are public. Their cards and indices specify the scope of each
download. Restore selected tasks and checkpoints, verify their hashes, and keep
the original split and ordered cohort. See [data and models](revision-v2-packages.md).

## Run a study

Install the [published runtime](installation.md) and its pinned policy
dependencies. The [model card](https://huggingface.co/dancher00/WasserMan-models)
provides native checkpoint launch commands. A short development rollout checks
loading and stepping; a scored evaluation uses the complete declared horizon
and reset cohort.

The [policy-study reproduction guide](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/blob/main/ras-closure-v4-20261012/REPRODUCE.md)
restores the exact runtime metadata and selected checkpoint, gives paired RGB
and placement commands, and describes independent physical scoring. The
[reset and interval guide](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/blob/main/ras-strong-closure-v5-20261013/REPRODUCE.md)
documents reset generators and exchange-pair cluster intervals.

For collection and training from source, use the [campaign workflow](reproduction.md).
Keep repeated evaluations separate from independent training seeds. The
[results guide](benchmark-results.md) and [policy studies](policy-studies.md)
identify the native reference and comparison protocol for each reported result.
