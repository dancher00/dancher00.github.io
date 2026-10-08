# Data and models

## Public demonstration dataset

The original six-task demonstrations are available on
[Hugging Face: dancher00/WasserMan](https://huggingface.co/datasets/dancher00/WasserMan).
The dataset retains all 504 collection attempts and the 480 selected demonstrations
(76 training and 4 validation episodes per task), including lossless RGB,
commands, measured state, physical traces and original audit records.
The download is 35.69 GiB; one-task and one-episode downloads are supported.
Follow the dataset card for checksummed download and restoration.
This publication contains demonstrations; fitted models and complete policy
evaluation packages have separate availability.


WasserMan 0.1.0 provides the runtime, task experts, collection tools, dataset audits,
ACT/DP/BC trainers and evaluation contracts. Installation and first run require
no pretrained visual-policy download.

## Generate data and train

Follow [collection](collect-demonstrations.md) for a development episode and
[reproduction](reproduction.md) for the fixed six-task campaign. It collects
and audits demonstrations before training final-budget policies from public
encoder initializations. Generated outputs remain in your chosen `artifacts/` tree.

## What is bundled

The checked code contains the original protocol texts, dependency manifests,
PressButton reference checkpoint and scientific result records in
`assets/wasserman-runtime-v0.1.0.tar.gz`. The installer verifies their file hashes
and restores their original paths. This reference is used by the task expert;
it is not an ACT, DP, BC or VLA benchmark model.

The separate website repository bundles scientific presentation evidence and
provides the films and paper in its 0.1.0 release.

## Precomputed campaign packages

The 60 fitted models and complete raw evaluation packages remain in the private
research archive. They are not downloadable from the public 0.1.0 code release.
The six-task demonstrations are now available separately on Hugging Face above. The recorded tables describe that retained campaign;
a newly generated dataset or training run is a new reproduction, not an identical
copy of the original artifacts. Historical CAD and task-specific studies use
separate source and observation contracts.
