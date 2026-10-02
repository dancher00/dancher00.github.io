# Second-workstation results · 28 September 2026

One full RotateValve expert episode and one full DP episode succeeded on a
second workstation. This closes the bounded installation/execution check.
It does **not** reproduce training, bitwise trajectories or a 30-state success rate.

| Run | Reset | Success | First crossing | Maximum signed angle |
|---|---:|---|---:|---:|
| Expert | 2500 | Yes | Step 850 | 170.023865° |
| DP | 2500 | Yes | Step 994 | 170.108521° |
| Original DP reference | 2500 | Yes | Step 980 | See original summary |

Both new runs used the original 2240-control-step maximum and exited successfully.
The DP threshold crossing is 14 steps, or 0.466667 s at 30 Hz, later than the
original record. No training, physics changes, tuning or replacement reset occurred.

## Evidence and environment

- [Returned records](https://github.com/dancher00/wasserman/releases/download/v0.1.0/wasserman-reproduction-sources-v0.1.0.tar.gz#handoffs/second-machine-aida-20260928/README.md), commit `6fcbd80`.
- Frozen core runtime: `33a35ecb5b35ad6a95df629a395a99cc0fb83d11`.
- RTX 5090, driver 595.84; Python 3.12.3, Isaac Sim 6.1.0.0, Torch 2.12.0+cu130.
- Separate checkout/environment and simulator/Warp cache; reused download cache
  and authorized robot meshes. This was not an empty-machine installation.
- The selected DP weights and original evaluator hashes agree with the reference.
- All 29 handoff checksums verified. `paper/build_second_machine.py` independently
  recomputes each first signed 170° crossing and checks terminal success/no reset.
- The [original RGB archive](https://dancher00.github.io/wasserman/docs/artifacts/)
  was streamed and verified, including the raw RGB payload; no dataset was retained
  or used for training by this integration.

Archive SHA-256: `4465c83f6aacaef627e85e699a8e5b0b91c12e0619d28d871d3a8b9efd487060`.
Raw RGB SHA-256: `aee225e36b83a6669bcabfac332af2aa8bfc3b6813aeb4c7dfb8aefd528f9ad3`.

## Interpretation

The chosen checkpoint can execute successfully in another recorded GPU/software
environment on this reset. Timing differs slightly, so no bitwise reproducibility
claim follows. Two outcomes do not justify extrapolation to other tasks, model
training or aggregate rates. Existing benchmark scores remain unchanged.

[Executed protocol](reproduction.md) · [Submission status](reproduction.md)
