# Reproduce from source

Install the [open procedural runtime](installation.md), including the policy
overlay, public encoder weights and media requirements. Validate the frozen source
before starting a sustained GPU experiment:

```bash
python3 scripts/verify_publication.py
export WASMAN_ASSET_PROFILE=open-procedural-v1
.venv/bin/python scripts/run_revision_campaign.py \
  --root artifacts/open-core --stage all --training-workers 1 --evaluation-workers 1
.venv/bin/python scripts/score_revision_campaign.py \
  --root artifacts/open-core --output artifacts/open-core/scores.json
```

The campaign collects successful, audited demonstrations using fixed candidate
streams; trains ACT, DP and BC with seeds 17, 43 and 101; evaluates full ordered
30-reset cohorts; and runs the declared diagnostics. The
[frozen protocol](revision-v2-protocol.md) defines splits, budgets, physical success
and checkpoint selection. It requires substantial GPU time and disk space and is
not an installation smoke test.

The orchestrator stores receipts, hashes and failed attempts. It skips completed
jobs on resume and refuses unexplained partial outputs. Completed raw RGB is
archived losslessly after training. Concurrency changes execution scheduling;
it does not change the scientific cohorts. Scores may vary across workstation
stacks; see [execution sensitivity](revision-v2-execution-impact.md).

## Individual stages

Use `--stage collect-train`, `--stage evaluate` or `--stage diagnostics` with the
same output root and scheduling configuration. For a single model, follow
[training](train-policies.md). Use development states for engineering checks.
Do not select checkpoints or tune parameters using the published test resets.

## Scope

This is a self-contained source workflow. Original precomputed packages remain
in the private research archive, as explained in [data and models](revision-v2-packages.md).
The procedure preserves source pins and protocols; it does not promise bitwise
identical fitted weights or success-rate replication. Historical CAD, HotStab,
shipwreck and two-arm studies retain their separate contracts.
