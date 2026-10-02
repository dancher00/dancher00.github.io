# Website asset sources

The project page is implemented for WasserMan. The layout and publication
workflow are informed by [AM-Bench](https://github.com/ambench/ambench.github.io):
project overview, task groups, embodiments, physical effects,
results and citation, followed by static documentation. AM-Bench branding,
author information, benchmark scores and aerial-robot footage are not reused.

## Fonts and identity

Manrope and DM Mono are self-hosted under `src/assets/fonts/`. Their SIL Open
Font License notices are included beside the font files. The project logo is the lower-right wave-and-gripper mark selected by the
project owner from `Nautical Robotics Icon Collection.png`, extracted onto a
transparent background. `logo-provenance.json` identifies the source and final
asset hashes. The overview figure is a local project asset. The social preview
is a capture of the project page with the selected logo.

The dark logo uses a generated ice-white/blue palette and an SVG mask from the
original logo's alpha channel. The mask preserves the original silhouette and
transparent holes. The built-in imagegen prompt and asset hashes are recorded
in `logo-provenance.json`. Both teaser variants are rendered from the editable
`paper/build_revision_overview.py` figure by `scripts/build_website_teaser.py`.
Their embedded images are identical; only panel and label colors differ.
`src/assets/project-overview-themes.json` records the figure sources and hashes.
The README uses their PNG exports in a theme-aware `<picture>` element; the
embedded simulator images are the same in both themes.

## Simulator media

Task films, policy rollouts, optical comparisons and physical-effect recordings
come from the versioned WasserMan studies identified in their source reports.
Project-page films show recorded trajectories; benchmark results use graphs
and numerical tables. Historical learned-policy movies remain in the evidence
package. CAD-profile films remain separate from the
open procedural learning results. Pool presentation replays do not rerun the
physical simulation. Sampled failures and audit limitations remain visible.

The publication media are presentation derivatives of the complete research
snapshot. They retain full duration and frame rate at up to 1280×720, encoded
with H.264 CRF 28. No frames are selected to change an outcome or a contact
timeline. Audio streams, if present, are copied. Source and web byte hashes,
sizes and encoding methods are recorded separately in `media-manifest.json`.
Scientific report hashes identify the original bytes, not these web copies.
JSON measurements, posters and the current manuscript are copied without
changes. Original videos and historical manuscripts stay in the complete
website-source release; duplicate archive storage is excluded from Pages.

The new `publication/overview-v2/` movie is an editorial overview assembled from
these recordings. Its already compact 1080p master is copied byte for byte so
titles, camera panels and measured-result labels retain their native resolution.
Cuts, playback rates, source hashes and separate study scopes are recorded in
`overview-video-provenance.json`; [OVERVIEW_VIDEO.md](OVERVIEW_VIDEO.md) describes
its narrative and rebuilding procedure. This montage does not replace any full
expert or evaluation recording.

Simulator runtime binaries and restricted robot CAD are not included in the
website package. Third-party attribution is recorded in
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## Recorded trajectories and camera views

`src/taskDemonstrations.json` selects one external view and two robot streams
for each of the ten task environments. Playback uses the external recording's
clock; camera views are shown together, without selecting a learned policy.
Cabin recovery uses the corrected three-camera episode in `task-demos/cabin/`.
Cargo release pairs its external recording with the same expert trajectory's
reference robot-camera streams; all three contain 699 frames at 10 Hz.

Push slider, Pull lever and Collect shell use fresh expert presentation takes
recorded with `scripts/record_expert_multiview.py`. Their per-task summaries
identify controller, success contract, frame counts, source runs and video
hashes. These takes do not replace scored benchmark episodes. The marine
observer starts after one warmup step; that frame is excluded from both robot
streams in the selected presentation copies. Raw takes are retained separately.

The embodiments section shows the custom twin-Oberon Rex configuration during cooperative valve manipulation. Its
expert film retains the separate bimanual study's protocol.
