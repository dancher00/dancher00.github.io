# Build and publish the website

The website and its authoritative documentation live in
[dancher00.github.io](https://github.com/dancher00/dancher00.github.io).
The simulation code lives in [wasserman](https://github.com/dancher00/wasserman).
The configured project URL is `https://dancher00.github.io/wasserman/`.
Author information is left blank until the paper is published.

## Build

```bash
python3 scripts/restore_reproduction_sources.py
python3 scripts/fetch_website_media.py --destination .asset-cache/website-media.tar.gz
python3 scripts/prepare_website.py restore-media --archive .asset-cache/website-media.tar.gz
python3 -m pip install -r website/docs-requirements.txt
npm ci --prefix website
python3 scripts/verify_presentation.py
npm run build:publication --prefix website
```

Scientific presentation records are bundled with the checkout; no research-archive
download is required. The media fetcher verifies the 0.1.0 archive digest.
During private preparation it uses Git credentials or `GITHUB_TOKEN`; after the
repository is public, its published media release supports anonymous download.
Restoration preserves existing files that differ.

The build combines the React project page and static, searchable documentation.
It verifies media routes and refuses a Pages artifact of 950 MB or more.
All films retain their full timelines; the editorial overview stays at 1080p.
The media manifest records original and presentation hashes.

## Preview and verify

```bash
npm run preview --prefix website -- --host 127.0.0.1 --port 5188
WM_SITE_TEST_PUBLICATION=1 npm test --prefix website
python3 scripts/prepare_website.py pages
node website/scripts/verify-pages.mjs
```

The final artifact is `website/.publication/pages/`: the account root redirects
to `/wasserman/`, which contains the project, documentation and media.
See [asset sources](../website/ASSET_SOURCES.md) and
[overview provenance](../website/OVERVIEW_VIDEO.md).

## Deployment

Run **Build and optionally deploy website** with `deploy=false` to build and
check the artifact without publishing. Source checks and browser tests do not
launch the simulator or training.

When publication is authorized, make the code and site repositories public,
select GitHub Actions as the Pages source, and run the workflow with `deploy=true`.
Confirm `/wasserman/`, documentation, paper and video links. The workflow does
not change repository visibility. Precomputed research datasets and fitted
models remain separate from the source release; see [data and models](revision-v2-packages.md).
