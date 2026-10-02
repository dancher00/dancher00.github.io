# Realistic underwater assets — reviewed 2026-09-21

Use real scans or high-quality authored assets before generating new geometry.
Do not substitute stylized props, generated pictures or game-extracted models
for physically usable 3D assets. Candidate status means the source was reviewed,
not that the mesh has passed simulator validation.

| Task / object | Primary source | Source license | Assessment / remaining work |
|---|---|---|---|
| RotateValve | [Modular Industrial Pipes 01 — Jorge Camacho / Poly Haven](https://polyhaven.com/a/modular_industrial_pipes_01) | CC0 | Integrated valve module with retained 2K PBR maps. Uniform 0.65 scale: 246 mm height, 126 mm wheel. Separate wheel articulation and open compound collision proxies; physical parameters assumed. Scripted expert completed grasp/turn/hold/release in 54/64 calm-water development attempts; learned-policy and hardware validation remain pending. |
| CollectShell | [Manila Clam — ffish.asia / floraZia](https://sketchfab.com/3d-models/manila-clam-ruditapes-philippinarum-b8e09b60b70944018dd15e50ca80b9d9) | CC0 | Biologically identified bivalve, 1.6M triangles; promising detailed visual source. Requires legal download, scale verification, LODs and a separate contact mesh. |
| CollectShell backup | [Sea Shell PHOTOGRAMMETRY — MrDavids1](https://sketchfab.com/3d-models/sea-shell-photogrammetry-3f8be0b7260d4519a660389402e3e022) | CC BY | Reconstruction from 78 photos; 45k triangles. Preserve attribution and check underside completeness. |
| OpenChest | [Treasure Chest — Rico Cilliers / Poly Haven](https://polyhaven.com/a/treasure_chest) | CC0 | Weathered wood and metal, approximately 1 m wide, 103k triangles; USD/glTF and PBR textures available. Needs separate lid/body, hinge/latch and validated collision/inertia. A visual model is not automatically an articulated mechanism. |
| Seabed | [Coast Rocks 01 — Poly Haven](https://polyhaven.com/a/coast_rocks_01) | CC0 | Photographic coastal rock asset, roughly 59.5 m wide and 1M triangles. Too large to casually rescale into a small rock; use verified-scale sections/LODs for environment scenery. |
| CutNet visual reference | [Fishing net — cozee4sure](https://sketchfab.com/3d-models/fishing-net-cbb4bfc4e5654500a70dfe72ffc0ce0a) | CC BY | 86.1k triangles. Download candidate, not a validated deformable/cuttable net. Physical strand topology must be constructed separately. |
| CutKelp visual candidate | [Animated Kelp — JosephWPugsley](https://sketchfab.com/3d-models/animated-kelp-74c400fd4d81469199268ac27451d03f) | CC BY | Rigged 7.1k-triangle plant with authored animation. Review appearance and species plausibility; replace animation with force-driven motion for interaction tasks. |

## Explicit rejections and caveats

- [Kelp by crammyberry](https://sketchfab.com/3d-models/kelp-d0a48e3e3b27461f99435d3b3c09fd1d):
  creator describes it as fictional/not realistic; reject for this benchmark.
- [Crab Claw Kelp](https://sketchfab.com/3d-models/crab-claw-kelp-e0fda0a4a85b4affad8a5f74078b0f86):
  description says extracted from Subnautica. Reject regardless of the uploader's CC badge.
- A Smithsonian shell page marks metadata CC0 but restricts the downloadable scan:
  do not assume metadata licensing grants mesh redistribution.
- Royalty-free marketplace assets are not automatically redistributable in a
  benchmark repository. Prefer CC0 or verified CC BY, retaining notices.
- Sketchfab authentication/download requirements must be respected; do not scrape
  viewer geometry or use an unofficial mirror to evade them.

## Acceptance gate before a scene uses an asset

1. Record original URL, author, exact license, download date and file hashes.
2. Inspect the actual geometry and PBR textures; compare all sides to the reference.
3. Verify metre scale, axes, normals, closed surfaces where displaced volume is
   computed, and graspable dimensions for the Alpha 5. Rescale assets when needed
   for this robot, preserving plausible proportions and documenting the conversion.
4. Keep visual detail separate from collision geometry. Validate the proxy around
   gripper contact regions; a single convex hull is inadequate for a socket or open chest.
5. Supply defensible mass, inertia, material friction and displaced volume.
   Shape alone does not establish density, lid torque or biological break strength.
6. For kelp/net cutting, build and test a force-driven strand/connection model,
   collision filtering, cutter contact and a reproducible break criterion. No
   "cut" success triggered only by a distance check or pre-recorded animation.
7. Run penetration/reset, grasp/release and dynamics tests before publishing a
   rollout. Until then, show the object as a candidate, not an implemented task.

Procedural geometry is justified for the *physical strand network* or a custom
robot-compatible fixture when no suitable asset exists. It must follow real
dimensions and material references, not an aesthetic guess. No new AI-generated
underwater object has been substituted for these source assets.

## Robot-compatible scaling

Uniform rescaling is explicitly allowed. Choose dimensions against the measured
usable gripper opening (with clearance), reachable tool workspace and collision-free
approach, not against how large the object looks on camera. Check these dimensions
on the actual simulated robot before accepting an asset. Keep shells and plants
within a plausible range for their species; choose a different specimen if necessary.
A chest can become a smaller manufactured chest, but hardware must remain usable.

Record source units, original bounding box in metres, uniform scale factor, final
bounding box, grasp/interaction dimensions and the reason for the scale. Apply the
same transform to visual and collision geometry and to hinge/handle locations.
Rebuild collision proxies and check joint limits and contact tolerances after scaling.
Avoid non-uniform distortion of recognizable biological objects.

For geometrically similar, constant-density solids, scaling lengths by s scales
volume and mass by s^3 and inertia by s^5; recompute drag geometry and hydrodynamic
coefficients as well. Hollow/flooded chests, shells and porous nets need a separate
material/displaced-volume model: the enclosing bounding box is not displaced water.
Joint drives, hinge friction and cutting forces need physical parameters appropriate
to the final object, not arbitrary copying of the original values.

### Downloaded chest inspection

`uv run python scripts/fetch_chest_asset.py` downloads the checksum-pinned 2k USD
and four PBR textures into the ignored `.asset-cache/polyhaven/treasure_chest/`.
File provenance is recorded in `artifacts/chest_asset_manifest.json`.
USD inspection found metre units, Z-up, dimensions 0.959 × 0.523 × 0.619 m and
five separate meshes: bottom, lid, lock and two handles. Separation is suitable
for further hinge preparation, but no articulation or validated collision model
has been added. Final robot-compatible scale remains to be measured and tested.

### CollectShell hoop prototype (2026-09-23)

The new task currently uses an original procedural closed-bivalve surrogate and
an open segmented hoop, generated by `scripts/prepare_shell_collection_assets.py`.
No external shell scan or its license is implicitly substituted. Each shell is
an independent0.080kg dynamic body with convex collision; the hoop uses64 short
convex segments so the centre remains physically open. Full parameters and
SHA256 are in `src/wasman/assets/data/objects/shell_collection/manifest.json`.
The original sand texture attribution remains unchanged. These are development
assets, pending physical expert acceptance and visual inspection.
