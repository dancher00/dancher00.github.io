# WasserMan website

Project website and documentation for [WasserMan](https://github.com/dancher00/wasserman).

To our knowledge, WasserMan is the first multi-task simulation benchmark focused on visuomotor policy learning for manipulating articulated underwater mechanisms.

[Project page](https://dancher00.github.io/wasserman/) · [Benchmark code](https://github.com/dancher00/wasserman) · [Build guide](docs/website-publication.md)

Version **0.1.0**.

## Build

```bash
python3 scripts/restore_reproduction_sources.py
python3 scripts/fetch_website_media.py --destination .asset-cache/website-media.tar.gz
python3 scripts/prepare_website.py restore-media --archive .asset-cache/website-media.tar.gz
python3 -m pip install -r website/docs-requirements.txt
npm ci --prefix website
npm run build:publication --prefix website
```

The build combines the project page with the documentation and verifies its media and size budgets. Scientific records are bundled in the checkout; publication media comes from its pinned 0.1.0 release archive. Existing files with different contents are preserved.

## Preview

```bash
npm run preview --prefix website -- --host 127.0.0.1 --port 5188
```

## Checks and deployment

```bash
python3 scripts/verify_presentation.py
WM_SITE_TEST_PUBLICATION=1 npm test --prefix website
```

The Pages workflow builds and checks the site. Deployment is an explicit workflow option, disabled by default.

## License

[Apache License 2.0](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md).

## Policy and execution studies

Fixed-policy evaluations vary water appearance, lighting, RGB feedback, contact
parameters, actuator delay, arm properties and mechanism pose. Matched expert
references establish feasibility under the same physical task tests. Controlled
training ablations compare observation history and expert trajectory mixtures;
graded placement tests expose their condition-dependent effects.

Complete expert candidate streams make demonstration selection inspectable.
Contact, tracking, actuator and full-episode contract records explain execution
beyond a completion score. The [study guide](https://dancher00.github.io/wasserman/docs/policy-studies/)
links every comparison to its public [datasets, models and evaluation records](https://huggingface.co/datasets/dancher00/WasserMan-Review-v3).
