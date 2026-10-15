# Data and models

## Demonstrations

[WasserMan on Hugging Face](https://huggingface.co/datasets/dancher00/WasserMan)
provides the original six-task demonstration dataset: all collection attempts,
selected successful episodes, lossless RGB, measured state, commands, physical
traces and fixed train/validation splits. The dataset card gives selective
download and restoration commands, file sizes and checksums. Restore only the
task or episode you need; raw RGB expansion requires additional disk space.

## Trained policies

[WasserMan models](https://huggingface.co/dancher00/WasserMan-models) provides the
primary ACT, DP and chunked-BC checkpoints, the EE-interface DP policies and the
SmolVLA models. It includes configurations, training records, result summaries,
a selective downloader and a native simulator launcher. SmolVLA reconstruction
uses the pinned pretrained base specified in the model card.

Full original rollout archives are outside this model repository's scope.
The per-file release index specifies what is included. Preserve each model's
image transform, observation history, control rate and action interface.

## Policy and execution studies

[WasserMan simulation studies](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3)
provides visual-transfer and physical-sensitivity evaluations, matched
history and demonstration-mixture checkpoints, complete expert candidate streams,
RGB controls, graded placement tests and full-episode physical analysis.
The [study guide](policy-studies.md) maps each comparison to its records.

The [control-study reproduction guide](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/blob/main/ras-closure-v4-20261012/REPRODUCE.md)
specifies the frozen source commit, exact runtime metadata, selective checkpoint
restoration and full-horizon evaluation commands. The
[reset and interval records](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3/tree/main/ras-strong-closure-v5-20261013)
document the task generators and exchange-pair cluster calculations.

## Runtime and generated data

The public code includes task experts, collection tools, dataset audits,
ACT/DP/BC trainers and evaluation contracts. Its installer restores the
checksummed scientific runtime bundle. Installation and a zero-action first
run require no learned-policy download.

Follow [collection](collect-demonstrations.md), [training](train-policies.md)
and [reproduction](reproduction.md) to generate a separate campaign. Historical
CAD and task-specific studies retain their own source and observation contracts;
the [historical-artifact guide](artifacts.md) describes those packages.
