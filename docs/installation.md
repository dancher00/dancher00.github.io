# Installation

Use native Linux, Python 3.12 and a compatible NVIDIA GPU/driver. WasserMan 0.1.0
pins Isaac Sim 6.1, PyTorch 2.12 and Isaac Lab commit
`76c7c60de65eb5196dbfacac91d3febbff6044d2` in `uv.lock`.
Install Git and [uv](https://docs.astral.sh/uv/getting-started/installation/), then:

```bash
git clone https://github.com/dancher00/wasserman.git
cd wasserman
./scripts/bootstrap.sh --asset-profile open-procedural-v1
export WASMAN_ASSET_PROFILE=open-procedural-v1
```

The installer verifies the bundled runtime protocols and PressButton reference,
fetches the exact Isaac Lab source and installs locked simulator dependencies.
It does not download manuscript drafts, reviews, datasets or learned policies.
The open procedural profile requires no restricted Reach CAD.

For visual-policy collection and training, install the pinned policy overlay and
public encoder weights:

```bash
.venv/bin/python scripts/setup_policy_dependencies.py
.venv/bin/python scripts/setup_training_backbones.py
uv pip install --python .venv/bin/python --no-deps -r research/media-requirements.txt
```

The setup verifies upstream source and weight digests. Keep the asset environment
variable set for every simulator command. Inference with a fitted model does not
download encoder initializations. Continue with [Verify installation](first-run.md).

## Historical CAD profile

Historical CAD studies use different images and finger collisions. Obtain the
original assets through an authorized channel and review their terms before:

```bash
./scripts/install_reach_meshes.sh /path/to/authorized/alpha/meshes --acknowledge-license
./scripts/bootstrap.sh --asset-profile historical-cad-v1
export WASMAN_ASSET_PROFILE=historical-cad-v1
```

Do not mix its checkpoints or scores with the open procedural protocol.
The first GPU launch can take several minutes to compile shaders. Each checkout
needs its own environment; avoid editable installations pointing at another tree.
