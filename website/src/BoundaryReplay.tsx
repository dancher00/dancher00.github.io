import { useEffect, useState } from "react";
import { CinemaPlayer } from "./CinemaPlayer";
import { MatchedBoundaryEvidence } from "./MatchedBoundaryEvidence";

type ReplayVariant = { id: "off" | "on"; video: string; poster: string; sha256: string; trace?: string; trace_sha256?: string };
export type BoundaryReplayMode = { id: "seabed" | "wall"; duration_s: number; fps: number; telemetry_offset_s: number; command_sha256: string; variants: ReplayVariant[]; maximum_position_difference_m?: number };
type ReplayManifest = { version: string; calibrated: false; feedback_compensation: false; modes: BoundaryReplayMode[] };
const manifestUrl = "./static/effects/boundary_replay_v1/manifest.json";
const stamped = (url: string, hash: string) => `${url}?v=${hash.slice(0, 12)}`;

function validMode(value: BoundaryReplayMode) {
  return value && Number.isFinite(value.duration_s) && value.duration_s > 0 && value.fps === 30 && Math.abs(value.telemetry_offset_s - 1 / 30) < 1e-8 &&
    /^[a-f0-9]{64}$/.test(value.command_sha256) && Array.isArray(value.variants) && value.variants.length === 2 &&
    ["off", "on"].every((id) => value.variants.some((entry) => entry && entry.id === id && typeof entry.video === "string" && entry.video && typeof entry.poster === "string" && entry.poster && /^[a-f0-9]{64}$/.test(entry.sha256)));
}

export function BoundaryReplayFilm({ experiment }: { experiment: BoundaryReplayMode }) {
  if (!validMode(experiment)) return null;
  const off = experiment.variants.find((variant) => variant.id === "off")!;
  const on = experiment.variants.find((variant) => variant.id === "on")!;
  const surface = experiment.id === "wall" ? "pool wall" : "pool floor";
  return <section className="boundary-replay" aria-label={`Matched boundary replay: ${surface}`}>
    <div className="boundary-replay-intro"><span>Matched motor-command replay</span><h4>Same commands. Boundary loss OFF / ON.</h4>
      <p>Identical motor commands · feedback not compensating boundary loss · uncalibrated.</p>
      <p>Two independent runs, one playback clock. The ON run receives the same recorded motor inputs as OFF; this is not a policy rollout or a closed-loop station-keeping comparison.</p>
      {Number.isFinite(experiment.maximum_position_difference_m) && experiment.maximum_position_difference_m! >= 0 && <p className="boundary-replay-finding">Measured maximum ON−OFF position separation: <strong>{(experiment.maximum_position_difference_m! * 1000).toFixed(1)} mm</strong> over this {experiment.duration_s} s pair. The recordings are shown at their original spatial scale.</p>}
    </div>
    <CinemaPlayer key={`${experiment.id}-${off.sha256}-${on.sha256}`} compact src={stamped(off.video, off.sha256)} poster={stamped(off.poster, off.sha256)}
      label={`Boundary loss OFF beside the ${surface}`} caption="MATCHED MOTOR COMMANDS · NOT A POLICY"
      cameraStreams={[{ id: "boundary-on", label: "Boundary loss ON", src: on.video, sha256: on.sha256, kind: "comparison", aspectRatio: 16 / 9 }]}
      overlay={<span className="boundary-replay-off-label">BOUNDARY LOSS OFF</span>} />
    <div className="boundary-replay-provenance"><span>Shared 120 Hz command sequence / <code title={experiment.command_sha256}>{experiment.command_sha256.slice(0, 12)}</code></span>
      <a href={off.video} download>OFF recording ↓</a><a href={on.video} download>ON recording ↓</a><a href={manifestUrl} download>Verification manifest ↓</a>
    </div>
  </section>;
}

// A missing manifest means the real replay has not been published. Never
// substitute unrelated clips, retry endlessly, or invent a comparison result.
export function BoundaryReplay({ mode }: { mode: "seabed" | "wall" }) {
  const [manifest, setManifest] = useState<ReplayManifest>();
  useEffect(() => {
    let active = true;
    fetch(manifestUrl, { cache: "no-cache" }).then((response) => response.ok ? response.json() : null).then((value) => {
      if (active && value?.calibrated === false && value?.feedback_compensation === false && Array.isArray(value.modes)) setManifest(value);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const experiment = manifest?.modes.find((entry) => entry?.id === mode);
  if (!experiment || !validMode(experiment)) return <MatchedBoundaryEvidence mode={mode} />;
  return <>
    <BoundaryReplayFilm experiment={experiment} />
    <details className="boundary-archived-evidence"><summary>Earlier closed-loop ON/OFF measurements · independent archived experiment</summary><MatchedBoundaryEvidence mode={mode} /></details>
  </>;
}
