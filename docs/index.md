# WasserMan documentation

Build and extend the simulation benchmark for underwater manipulation.
Ten demonstrated environments include nine with learned-policy evaluations.
The shared six-task protocol compares ACT, DP and chunked BC; the SmolVLA
study covers three tasks. All results retain their declared contracts.

## Get started

1. [Install WasserMan](installation.md).
2. [Load and step an environment](first-run.md).
3. [Choose a task](task-reference.md).
4. [Collect demonstrations](collect-demonstrations.md).

## Use and reproduce

- [Train a reference policy](train-policies.md).
- [Run the complete source workflow](reproduction.md).
- [Read the frozen evaluation protocol](revision-v2-protocol.md).
- [Compare recorded results](benchmark-results.md).
- [Inspect data and model availability](revision-v2-packages.md).
- [Understand observations and action interfaces](data-and-interfaces.md).

## Configure and extend

- [Configure robots, controllers and physics](configuration.md).
- [Read physical-model assumptions](physical-model-scope.md).
- [Add a task](add-task.md), [robot or controller](add-robot-controller.md), or [policy](add-policy.md).
- [Troubleshoot](troubleshooting.md).

The code and documentation live in separate repositories. Protocols, runtime
references and scientific summaries are bundled with the code; the full internal
research archive is not part of installation. Precomputed canonical training
packages are not included in 0.1.0; generate data and train with the source workflow.
