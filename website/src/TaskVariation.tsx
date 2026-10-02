import { useState } from "react";

const poolCloseup = "ee50e5ca1067a6606f2fbb8d4c2e089dd7b27bafa678a3d72f389b9c313d8aa8";
const poolOverview = "./static/variations/pool_overview.jpg?v=bdd2349b65fd02f1e4c87b5778373abd7769efe9d4520f7f5168c666ac251ca6";
const poolStandard = "https://resources.fina.org/fina/document/2026/02/18/e6815ecc-06d9-4f0b-98e9-4c441cf5e6a3/2026-02-18_World-Aquatics_CR-Final.pdf";

function PoolOverview() {
  const [open, setOpen] = useState(false);
  return <details className="pool-overview" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>Pool overview · 25 × 25 m</summary>
    {open && <>
      <a href={poolOverview} target="_blank" rel="noreferrer" aria-label="Open full-resolution finite pool overview">
        <img src={poolOverview} alt="Elevated overview of the same finite 25 by 25 metre pool, with four walls, ten lane markings and a water surface" width="960" height="960" />
        <span className="variation-enlarge" aria-hidden="true">↗</span>
      </a>
      <p>25 × 25 m interior · 2.5 m water depth. Four physical walls and a finite floor; the robot works near one corner.</p>
      <p>Dimensions follow <a className="pool-source" href={poolStandard} target="_blank" rel="noreferrer">World Aquatics · February 2026 ↗</a> (§15.1.2, §15.6.2.1, §15.4.2). This is a robotics scene, not a certified competition facility.</p>
      <p className="pool-overview-limit">The water surface is visual geometry, not a free-surface fluid solver. Demonstrations remain submerged.</p>
    </>}
  </details>;
}

const panels = [
  {
    id: "appearance", label: "Appearance", task: "Press Button",
    captions: ["Weathered green paint · 2K", "Harbor concrete · 4K", "Coarse rust · 4K", "Blue-green paint tint · 2K"],
    note: "Fixture-only views, with the same camera and geometry. Only the surface changes; the fourth view tints the green paint.",
  },
  {
    id: "geometry", label: "Geometry", task: "Rotate Valve",
    captions: ["Wall tilt −25°", "Wall tilt −10°", "Wall tilt +10°", "Wall tilt +25°"],
    note: "The wall and attached valve tilt together. The valve stays the same size. Illustration only: training and normal scenes use upright walls with centered fixtures.",
  },
  {
    id: "placement", label: "Placement", task: "Press Button",
    captions: ["Lower left", "Lower right", "Upper left", "Upper right"],
    note: "Four fixture locations on the same fixed wall, viewed from the same camera. Illustration only: normal scenes and training keep the object centered.",
  },
  {
    id: "environment", label: "Environment", task: "Underwater settings",
    captions: ["Pool · manipulation walls", "Sandy seabed · submarine hatch", "Sunken ship interior · chest"],
    note: "BlueROV2 + Alpha 5 at standoff in each setting: manipulation walls in a tiled pool, a hatch in sand, and a chest inside a bounded timber ship compartment. Illustration only: normal scenes and training retain their default floors. The chest is a visual candidate, not an implemented opening task.",
  },
  {
    id: "cabins", label: "Cabins", task: "HDD recovery · rope cutting",
    captions: ["Sunken cabin · recover the HDD", "Cargo hold · cut the retaining rope"],
    note: "Implemented intervention tasks in two ship interiors: open a cabinet and retrieve its hard drive, or cut the rope securing cargo. Frames come from the recorded task trajectories.",
  },
];

export function TaskVariation({ compact = false }: { compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const panel = panels[index];
  const advance = (direction: number) => setIndex((current) => (current + direction + panels.length) % panels.length);
  return (
    <section className="task-variation" id="task-variation" aria-labelledby="variation-title">
      <div className="variation-heading">
        <h3 id="variation-title">Task-level variation</h3>
        {!compact && <span>{panel.id === "environment" ? "A setting for each task" : "One variable at a time"}</span>}
      </div>
      <div id="variation-panel" role="group" aria-roledescription="slide" aria-label={`${panel.label}, ${index + 1} of ${panels.length}`}>
        <div className={`variation-row${panel.id === "environment" ? " variation-row-three" : panel.id === "cabins" ? " variation-row-cabins" : ""}`}>
          {panel.captions.map((caption, imageIndex) => {
            const alt = panel.id === "environment" ? `BlueROV2 with folded Alpha 5: ${caption}` : panel.id === "cabins" ? caption : `${panel.task}: ${panel.label.toLowerCase()} variant ${imageIndex + 1}`;
            const version = panel.id === "environment" ? (imageIndex === 0 ? poolCloseup : "grounded-presentation-v1") : "grounded-presentation-v1";
            const src = `./static/variations/${panel.id}_${imageIndex + 1}.jpg?v=${version}`;
            return (
              <figure key={`${panel.id}-${imageIndex}`}>
                <a href={src} target="_blank" rel="noreferrer" aria-label={`Open full-resolution ${alt}`}>
                  <img src={src} width={panel.id === "cabins" ? 1280 : 960} height={panel.id === "cabins" ? 720 : 960} alt={alt} loading="lazy" />
                  <span className="variation-enlarge" aria-hidden="true">↗</span>
                </a>
                {(!compact || panel.id === "cabins") && <figcaption>{caption}</figcaption>}
                {!compact && panel.id === "environment" && imageIndex === 0 && <PoolOverview />}
              </figure>
            );
          })}
        </div>
      </div>
      <div className="variation-navigation">
        <button type="button" aria-label="Previous variation panel" aria-controls="variation-panel" onClick={() => advance(-1)}>←</button>
        <p aria-live="polite"><strong>{panel.label}</strong><span>{panel.task} · {index + 1} / {panels.length}</span></p>
        <button type="button" aria-label="Next variation panel" aria-controls="variation-panel" onClick={() => advance(1)}>→</button>
      </div>
      {compact ? <p className="variation-note">Scene previews, not policy evaluations. <a href="./?view=explore#task-variation">Setup and asset credits ↗</a></p> : <p className="variation-note">{panel.note} All images are simulator scene previews, not policy evaluations.</p>}
      {!compact && panel.id === "environment" && <p className="variation-note">CC0 assets: <a href="https://ambientcg.com/view?id=Tiles107">pool mosaic tiles · ambientCG Tiles107</a>, <a href="https://polyhaven.com/a/sand_03">sand</a>, <a href="https://polyhaven.com/a/weathered_planks">weathered planks</a>, <a href="https://polyhaven.com/a/treasure_chest">Treasure Chest — Rico Cilliers</a>. The ship compartment is an original modeled environment, not a shipwreck scan.</p>}
    </section>
  );
}
