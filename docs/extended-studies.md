# Corrected shipwreck evaluations and historical demonstrations

CabinRecovery and CargoRelease have completed ACT/DP evaluations on 30 matched,
independently reserved states per task (8000–8029). Together with the six-task
core and HotStab, this gives nine tasks with reported ACT/DP evaluations.
Different scene, data and observation protocols are kept separate; the original
six-task macro-average is unchanged.

| Corrected scene | ACT | DP |
|---|---:|---:|
| CargoRelease | 3/30 | 1/30 |
| CabinRecovery | 0/30 | 0/30 |

Cabin uses 80 fresh accepted demonstrations after the door, hinge and handle
corrections, split into 76 training and four validation episodes. The collection
retains all 160 attempts and excludes failed/audit-rejected trajectories from
training. Historical collision-defective recordings are not reused. Expert
command replay passes 12/12 for each task on development states.

Cabin's door/HDD–hinge geometry audits pass 27/30 ACT and 30/30 DP test episodes.
Those audits inspect recorded 30 Hz frames with the unchanged 0.5 mm tolerance;
they do not cover all contacts or physics substeps. Audit failures remain in the
30-episode denominator. Low policy success is a completed benchmark outcome,
not evidence that the expert or scene has not been implemented.

[Per-state outcomes and reports](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/wreck-corrected-v3/README.md) and
[the import manifest](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#research/wreck-corrected-import.json) pin the evidence to
`handoff/openchest-base` commit `3f8a5fb073362112977b237052612ea7511cc555`.
The evaluated runtime is `df188e9b5e51e0cc6c7291c5eeb0e76499ce84b4`.
This PC checked archival consistency and presentation; it did not retrain or
repeat these physical evaluations. Original reports retain their historical
paths and links.

## Reproduce and obtain artifacts

The [publication release](https://dancher00.github.io/wasserman/docs/artifacts/)
mirrors all four selected checkpoint files, the upstream evidence/video archives
and their original SHA-256 values. Its runtime-source archive exports the exact
upstream commit above without merging it into the frozen core runtime.

Extract `wreck-corrected-v3-runtime-source.tar.gz` under
`work/.maintenance/checkouts/` (or a fresh contained directory on another PC).
Install the dependencies and licensed Reach Alpha meshes according to the
snapshot's README and `docs/openchest-second-machine.md`, then follow the
[archived evaluation commands](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/wreck-corrected-v3/REPRODUCTION.md).
Run from that extracted runtime's root, using the checkpoint filenames specified
there. This source export is a reproduction input, not a new clean-machine
replication claim. Raw RGB is not included or needed for checkpoint evaluation;
training requires the original recordings or separately regenerated data.

## Website and task status

Results → High-level policies → Shipwreck tasks contains the corrected curves
and all four complete scored first-test-state recordings. Historical v1 tables
and development diagnostics remain explicitly labelled in the appendix.
Water-appearance films are expert recordings, not learned-policy robustness tests.

The tray-based Toss Ball at `3f8a5fb` is historical. The wall-only v2 variant
from `f16b6cf` is now included as [Wall Toss](wall-toss.md): one paired expert
example in still water and cross-current, with identical high-level commands.
It appears in the paper and Physical effects section, without ACT/DP scores
or inclusion in the nine evaluated model tasks.
