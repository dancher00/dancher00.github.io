# Overview video

The publication overview is a 1920×1080, 30 fps H.264 movie with an original
procedural score. It presents recorded WasserMan simulation footage: recorded
trajectories, water-rendering comparisons, physical-effect examples and
graphs of frozen learned-policy outcomes. It does not present hardware validation.

The editing reference was the
[AM-Bench overview](https://ambench.github.io/static/publication/overview/ambench-overview-v13.mp4):
large explanatory titles, visible task actions and paired comparisons. Its footage,
hardware experiments, branding and results are not used in the WasserMan film.

## Narrative

- Open on the complete twin-arm vehicle, then move to a close view of both grippers.
- Explain the floating-base interaction and the policy–control–simulation loop.
- Show cabinet opening, hard-drive recovery, rope cutting, connector insertion and object delivery.
- Introduce the remaining contact tasks and the complete ten-task catalogue.
- Compare three water appearances through both robot cameras, then currents,
  optional proximity models and actuator response.
- Present ACT/DP/BC and SmolVLA results as graphs of all three independent trainings.
- Close with the project identity and project website link.

Every individual task cut uses an external view plus the base and gripper cameras
from the same expert episode, with the same source interval and playback rate.
The task catalogue mosaic uses equal 16:9 external-view tiles; the two 3:2
recordings are cropped centrally, with no stretching. Individual camera
views retain their native proportions. Camera names are not printed over
the footage. Model colors are consistent across the two result graphs. The bimanual section uses its
separate expert study. The water comparison is a rendering study, not an
evaluation of learned policies in those water appearances. Expert CAD-profile
footage and the open procedural learning results retain their separate protocols.

Playback at 2× is labelled in the film. Original aspect ratios are retained.
The source recordings are not color filtered; the titles and diagrams are native
graphics using the project's Manrope font and selected logo. Music is synthesized
sound design reused from the project's preserved previous overview, not recorded
simulator audio. The previous movie and all source evidence remain intact.

## Rebuild

For the exact recorded source bytes, restore the complete original website
snapshot described in [the archive guide](../docs/paper-and-website.md), together
with the later expert recordings referenced in `src/taskDemonstrations.json`.
The pinned compact media package described in [README](README.md) is sufficient
to view the selected film or make a new edit from presentation derivatives;
its compressed input clips produce a different master hash.
The renderer uses Pillow and imageio-ffmpeg from the media dependencies; it does
not launch the simulator. The editable cuts and titles are in
[overview-storyboard.json](overview-storyboard.json).

The physical-effect layers use the same `ProjectedEffects.tsx` component and CSS
as the website, driven by recorded telemetry and camera projections. Render them
first, with Playwright's Chromium installed:

```bash
node website/scripts/render-overview-overlays.mjs /path/to/maintenance/physics-overlays /path/to/ffmpeg
.venv/bin/python scripts/build_website_overview.py \
  --output-dir /path/to/maintenance/overview-review \
  --annotations-dir /path/to/maintenance/physics-overlays
```

Choose a maintenance output directory appropriate to the checkout; the command
does not replace the website's selected movie. It produces the full movie,
poster, WebVTT captions, per-shot intermediates and an edit manifest, then decodes
the completed movie and checks its frame count. Review the output before
promoting its four publication files into `public/static/publication/overview-v8/`.

[overview-video-provenance.json](overview-video-provenance.json) records the selected
master hash, source hashes, source intervals, camera layouts, font, logo,
renderer and frozen result files. The Manrope TTF is a native export of the
existing WOFF2; the font's SIL Open Font License is retained in `src/assets/fonts/`.
The small overlay logo is a rendering of the existing dark SVG.

The website package preserves this compact editorial master byte for byte in
1080p so that captions, camera views and graph labels remain legible. Ordinary
expert recording derivatives continue to retain their full timelines and frame
rates at up to 720p. These are distinct presentation assets.

HDD task footage and the `wreck-water-v3` comparison both use the corrected
handle geometry (`4d2e8cecbc075f49eb3ad883acb62b531789fe67d876e6fe54347bb4a8e726e2`).
The withdrawn v1 water footage is excluded from the selected film and current
media package. Learning results remain under their original protocols.
