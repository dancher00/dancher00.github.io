import { useState } from "react";

export function OpticsGallery({ embedded = false }: { embedded?: boolean }) {
  const [lighting, setLighting] = useState("ambient");
  const [water, setWater] = useState("clear");
  const prefix = lighting === "dark" ? "dark" : `${lighting}_${water}`;
  return (
    <article className="optics-gallery" id="lighting-water">
      {!embedded && <div className="variation-heading">
        <h3>Light and water, isolated.</h3>
        <span>Same pose · same scene</span>
      </div>}
      <p>Fixed comparison pose. Change scene lighting, vehicle lamps and water clarity; both robot cameras are shown together.</p>
      <div className="optics-options" role="group" aria-label="Lighting condition">
        {[["ambient", "Scene lighting"], ["dark", "All lights off"], ["robot_lamps", "Vehicle lamps only"]].map(([id, label]) =>
          <button key={id} aria-pressed={lighting === id} onClick={() => { setLighting(id); if (id === "dark") setWater("clear"); }}>{label}</button>,
        )}
      </div>
      <div className="optics-options" role="group" aria-label="Water clarity">
        {[["clear", "Clear"], ["coastal", "Coastal"], ["harbor", "Turbid harbor"]].map(([id, label]) =>
          <button key={id} disabled={lighting === "dark"} aria-pressed={water === id} onClick={() => setWater(id)}>{label}</button>,
        )}
      </div>
      <div className="optics-images">
        {["base", "gripper"].map((camera) => <figure key={camera}>
          <img src={`./static/optics/${prefix}_${camera}.png?v=grounded-presentation-v1`} width="512" height="512" loading="lazy" alt={`${camera} camera, ${lighting.replaceAll("_", " ")}, ${lighting === "dark" ? "clear" : water} water, fixed comparison pose`} />
          <figcaption>{camera.toUpperCase()} / RGB</figcaption>
        </figure>)}
      </div>
      {lighting === "robot_lamps" && <p className="optics-finding"><strong>Observed limitation:</strong> the base lamps illuminate the worksite, but leave the close-range wrist view in shadow in this pose. A dedicated wrist light remains future work.</p>}
      <p className="variation-note">Controlled sensor comparison, not a policy evaluation or a video. Vehicle-mounted lamps are simulated light sources. Water attenuation and backscatter use the rendered depth in linear RGB; the coefficients are illustrative, not calibrated to a real dive. This is not full volumetric light transport. <a href="./static/optics/report.json" download>Capture parameters and provenance ↓</a></p>
    </article>
  );
}
