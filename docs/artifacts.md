# Scientific records and artifacts

Scientific runtime manifests, physical outcomes and selected-model identities
are preserved in the bundled source records. Restore and verify them with:

```bash
python3 scripts/restore_reproduction_sources.py
python3 scripts/verify_publication.py
```

`research/paper-results-index.json` records historical model identities and
per-state counts. `research/revision-v2-primary-results.json` records the shared
ACT/DP/BC comparison. Original paths and hashes identify the retained experiments;
they are not promises that every historical binary is part of this source release.

For available source workflows and precomputed package scope, see
[data and models](revision-v2-packages.md). The site includes the
[recorded results](benchmark-results.md) and explanatory films. To produce a new
campaign, follow [reproduction](reproduction.md).
