# Troubleshooting

## Missing Reach Alpha geometry

Eight licensed visual meshes are intentionally excluded. Obtain them through an
authorized channel, review their terms and run `scripts/install_reach_meshes.sh`
with the explicit license acknowledgment from [installation](installation.md).
A random replacement mesh is not a valid reproduction of the frozen geometry.

## Isaac Lab revision mismatch

The installer refuses to replace a different existing dependency checkout.
Keep that environment intact and use a fresh project checkout for the pinned
revision. Do not combine an editable install from one runtime with another.

## First launch appears idle

The first RTX launch may compile shaders for several minutes. Inspect the
simulator log and process activity before treating it as a failure. A short
16-step installation check can take longer to start than to execute. Avoid
starting concurrent simulators while diagnosing memory or startup failures.

## Artifact download reports unavailable

The repository is private. Use an authorized GitHub account with Git's credential
helper. The downloader does not embed a token in URLs. Check the artifact ID and
release access; do not paste credentials into logs. Files are verified by size
and SHA-256. Different existing files are preserved, so choose a fresh destination.

## Policy imports or encoder initialization fail

Run `scripts/setup_policy_dependencies.py --verify` in the intended core runtime.
Use the separate HotStab dependency procedure for HotStab. Training may require
pretrained encoder initialization even when inference from a full saved checkpoint
does not require the raw dataset. Do not let a package upgrade replace the pinned
Torch/NumPy stack while fixing an optional import.

## Dataset audit or training fails

Check the task/schema, whole-episode success, unique seeds, camera timing,
image shape and final audit selection. A pilot audit cannot authorize final
training. Audit failure is evidence to inspect, not permission to relax success.
See [collection](collect-demonstrations.md).

## Repeated score differs

Check runtime revision, model hash, evaluator, resets, horizon, precision,
renderer and dependencies. OpenHatch ACT has a documented 10/30 original and
16/30 instrumented repeat; numerical sensitivity is not a complete explanation.
Keep the discrepancy and traces. Do not overwrite the recorded benchmark or call
a tuned repeat on the same states an independent test.

## Website source is missing static media

The Git checkout keeps code and documentation; the complete site archive includes
local films, images and result JSON. Follow [website restoration](reproduction.md)
and build the archive as a unit. A successful build is not a public deployment.
