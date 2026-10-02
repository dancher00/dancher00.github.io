# Wall Toss: one matched expert-command pair

The wall-only v2 task is an recording of current sensitivity,
**not a tenth ACT/DP benchmark**. A 50 mm, 100 g capsule passes through the wall
in still water (success at 7.80 s); a +Y 0.2 m/s current causes a rim strike under
identical high-level commands. Both 324 × 8 command arrays match byte for byte.

The website's Physical effects section presents full paired movies, three camera
choices and recorded lateral-position curves. Task cards retain clean expert
movies; learned-policy outcomes remain in Results.

## Evidence and runtime

- [Original report and immutable checksums](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#benchmarks/wall-toss-v2/README.md).
- [Full task contract and model assumptions](tasks/wall-toss.md).
- Import: `f16b6cff9f12d8d11f7f973d99ab55b8be31979c` in the private development repository.
- `research/wall-toss-media-import.json` identifies all original evidence/media bytes.
- `research/wall-toss-runtime.json` identifies the separate source archive.

Fetch artifact `wall-toss-runtime` using `scripts/fetch_paper_artifacts.py` and
extract it into a fresh maintenance directory. Follow that runtime's installation
requirements, including authorized Reach meshes, then use the commands in the
full task contract. Never extract it over a pinned core, HotStab or bimanual runtime.

The comparison changes the current acting on **both robot and capsule**. It does
not isolate capsule drag alone. Matching low-level feedback activity does not
imply identical realized forces. The source also contains separately labeled
contact-free calculations; they are not extra simulated task successes.

## Selected expert cameras

Fresh CabinRecovery and HotStab external/base/gripper recordings are imported
from the same upstream commit. These are presentation episodes with their own
sampled audits, not replacements for benchmark trajectories. The website retains
our completed PullLever/PushSlider experts and core films: the upstream branch's
zero-action previews and older core presentation versions are not substituted.

The sphere model and optical variants are uncalibrated simulation approximations.
This update introduces no new training, random-reset success rate or hardware claim.
