import { useRef, useState } from "react";
import { OpticsGallery } from "./OpticsGallery";
import waterRecordings from "../public/static/wreck-water/results.json";

function WaterRecording() {
  const [task, setTask] = useState("cabin");
  const [water, setWater] = useState("clear");
  const base = useRef<HTMLVideoElement>(null);
  const gripper = useRef<HTMLVideoElement>(null);
  const synchronize = () => {
    const master = base.current, follower = gripper.current;
    if (!master || !follower) return;
    if (follower.readyState > 0 && Math.abs(follower.currentTime - master.currentTime) > .08) follower.currentTime = master.currentTime;
    follower.playbackRate = master.playbackRate;
    if (master.paused || master.ended) follower.pause();
    else if (follower.paused) void follower.play().catch(() => {});
  };
  return <div className="imaging-recording">
    <p>One expert trajectory per task, rendered under four water conditions. The two robot cameras share a playback clock.</p>
    <div className="optics-options" role="group" aria-label="Imaging task">{[["cabin", "Cabin recovery"], ["rope", "Cargo release"]].map(([id, label]) => <button key={id} aria-pressed={task === id} onClick={() => setTask(id)}>{label}</button>)}</div>
    <div className="optics-options" role="group" aria-label="Recorded water clarity">{[["reference", "RTX reference"], ["clear", "Clear"], ["coastal", "Coastal"], ["silt", "Silty"]].map(([id, label]) => <button key={id} aria-pressed={water === id} onClick={() => setWater(id)}>{label}</button>)}</div>
    <div className="imaging-camera-pair" key={`${task}-${water}`}>{["base", "gripper"].map(camera => <figure key={camera}>
      <figcaption>{camera === "base" ? "Base camera" : "Gripper camera"}</figcaption>
      <video ref={camera === "base" ? base : gripper} src={`./static/wreck-water/${task}/${camera}_${water}.mp4?v=${waterRecordings.model}`} poster={`./static/wreck-water/${task}/${camera}_${water}.jpg?v=${waterRecordings.model}`} controls={camera === "base"} muted playsInline preload="metadata" aria-label={`${task === "cabin" ? "Cabin recovery" : "Cargo release"} expert · ${camera} camera · ${water} water`} onPlay={synchronize} onPause={synchronize} onTimeUpdate={synchronize} onSeeking={synchronize} onRateChange={synchronize} onLoadedMetadata={synchronize} />
    </figure>)}</div>
    <p className="landing-note">Vehicle lamps only. Paired RGB-D renderings use illustrative optical coefficients. These recorded trajectories do not measure learned-policy robustness to water appearance. <a href="./static/wreck-water/results.json">Recording parameters and provenance ↗</a></p>
  </div>;
}

export function UnderwaterImaging() {
  const [view, setView] = useState(0);
  return <section className="underwater-imaging" id="underwater-imaging" aria-labelledby="imaging-heading">
    <div className="landing-heading"><h3 id="imaging-heading">Underwater imaging</h3><p>Lighting, attenuation, refraction, backscatter and suspended particles affect what the robot sees.</p></div>
    <div className="imaging-tabs" role="tablist" aria-label="Underwater imaging">{["Lighting and clarity", "Water during manipulation"].map((label, i) => <button key={label} role="tab" id={`imaging-tab-${i}`} aria-selected={view === i} aria-controls="imaging-panel" tabIndex={view === i ? 0 : -1} onClick={() => setView(i)} onKeyDown={event => {
      if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - i; setView(next); document.getElementById(`imaging-tab-${next}`)?.focus(); }
    }}>{label}</button>)}</div>
    <div id="imaging-panel" role="tabpanel" aria-labelledby={`imaging-tab-${view}`} tabIndex={0}>{view === 0 ? <OpticsGallery embedded /> : <WaterRecording />}</div>
  </section>;
}
