# Bundled scientific records

The code repository includes `assets/wasserman-runtime-v0.1.0.tar.gz` and its
per-file manifest `assets/reproduction-package.json`. It contains task protocols,
runtime dependency records, the PressButton reference and scientific evidence.
Manuscript drafts, reviews and handoffs are excluded.

```bash
python3 scripts/restore_reproduction_sources.py
python3 scripts/verify_publication.py
```

No GitHub release download or credentials are needed. The restorer checks archive
membership, size, SHA-256 and every destination before writing. Conflicting
existing files are preserved. Immutable provenance retains its original paths
and historical source identifiers.

The website repository has its own bundled evidence package and checks:

```bash
python3 scripts/restore_reproduction_sources.py
python3 scripts/verify_presentation.py
```

Run these commands in their respective repositories. Dataset and fitted-model
availability is described in [data and models](revision-v2-packages.md).
