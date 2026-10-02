# WasserMan project website

React/TypeScript serves the project page and study viewers. Task demonstrations
show an expert episode in three synchronized views. Results use graphs and
numerical tables, with an explicit VLA / SmolVLA tab. Lighting and water
appearance share one Underwater imaging section. Zensical builds
the authoritative repository `docs/` into static guides at `/docs/`, with search,
navigation and copyable commands. Both ship in the same Pages artifact.

The header theme button switches between light and dark palettes. The initial
theme follows the system; a manual choice is saved and shared with the static
documentation. Logos, the favicon and the editable teaser have matching theme
variants. `scripts/build_website_teaser.py` renders both SVG versions from the
existing paper figure without changing its source photographs or manuscript.

The [overview film](OVERVIEW_VIDEO.md) presents recorded recorded trajectories,
underwater effects and ACT/DP/BC and SmolVLA results in 1 min 48 s. Its Full HD
master loads when the viewer plays the film or chooses a chapter. The editable
storyboard and source provenance are included in this directory.

```bash
npm ci
npm run dev
npm run build
```

For the complete publication build, install `docs-requirements.txt` in an isolated
Python environment and restore the pinned media package, then run:

```bash
npm run build:publication
npm run preview -- --host 127.0.0.1 --port 5188 --strictPort
```

`WM_SITE_PYTHON` and `WM_SITE_ZENSICAL` can point to an isolated documentation
environment. `WM_SITE_PUBLIC_DIR=.publication/public` selects compact local
media. See [build and publication instructions](../docs/website-publication.md)
for restoration, the Pages size budget and manual deployment. The default
development build retains the legacy `?view=docs` portal.

Run browser checks with `npm test`. `WM_SITE_TEST_PORT` selects an unused port.
Source checks and publication builds never start the simulator or train policies.
Generated `dist/`, `.publication/`, caches and reports stay out of Git.

Credits and media qualifications are in [ASSET_SOURCES.md](ASSET_SOURCES.md).
