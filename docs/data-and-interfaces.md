# Observations, actions and data

For the current open asset version, the
[revision protocol](revision-v2-protocol.md) and packaged `revision_audit.json`
records define the data contract. The table below describes historical protocols;
its configuration paths do not replace the new per-model training configurations.

The frozen release preserves task-specific schemas. It does not claim a single
canonical LeRobot dataset across all tasks. Pinned LeRobot ACT and AM-Bench-derived
Diffusion Policy components are adapted through the checked-in loaders.

## Policy inputs and outputs

| Protocol | Observation | Action interface | Authoritative source |
|---|---|---|---|
| Six-task visual core | Wrist RGB and measured robot state | Task-specific EE or base/joint targets | `benchmarks/core/configs/` |
| Native PushSlider/PullLever | Wrist RGB and eight measured coordinates | Eight normalized absolute actuator targets | `marine_visual_dataset.py` |
| EE interface study | Recorded image/state view for the EE protocol | EE pose and gripper targets through IK | `prepare_research_dataset.py` |
| HotStab v1 | Two fixed 384×384 robot cameras and eight measured coordinates | Its frozen command adapter | `benchmarks/hotstab-v1/PROTOCOL.md` |

Task coordinates, expert phase and contact-based success signals may be stored
for auditing; that does not make them model inputs. Verify the loader and adapter,
not only the presence of a field in a trajectory file.

## Native marine episode

`metadata.json` declares the schema, task, seed, image shape, sample count, physics
step and success contract. `trajectory.npz` stores measured state, command,
actuator packing, image alignment and physical replay evidence. `wrist.rgb` is
an uncompressed uint8 array whose dimensions come from metadata. The native
schema is `wasman-marine-rgb-actuator-v1`.

A sample must pair the current observation with its corresponding target. Chunks
remain inside one episode; no reset splicing, future image substitution or image
interpolation is allowed. Preserve the original padding and normalization rules
of the selected loader. Physical audit channels are excluded from model inputs.

## Collection, policy and physics rates

These rates are distinct. Native marine policy recordings use 30 Hz while
physics advances through multiple substeps. Other tasks retain their own rates.
An action chunk length is not a physics horizon. Read each config's observation
history, predicted horizon and number of executed actions before comparing methods.

## Available data versus training data

Eighty available episodes does not mean every learner updates on all 80. The
registry records both availability and actual splits. DP's core split is 76/4;
ACT core configs report 80 training episodes with no offline validation split.
Closed-loop selection, where used, is a separate protocol.

Retain raw datasets outside Git. Selected-model evaluation needs weights and
compatible code, not the raw training images. Use [artifact selection](artifacts.md)
to avoid transferring unrelated datasets and intermediate checkpoints.
