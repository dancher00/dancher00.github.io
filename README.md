# WasserMan website

Project website and documentation for [WasserMan](https://github.com/dancher00/wasserman).

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
