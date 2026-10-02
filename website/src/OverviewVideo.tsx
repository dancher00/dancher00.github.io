import { useRef, useState } from "react";
import overview from "./overviewVideo.json";

export function OverviewVideo() {
  const player = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  return <section className="landing-width overview-video" id="overview-video" aria-labelledby="overview-video-title">
    <div className="landing-heading"><h2 id="overview-video-title">Overview video</h2><p>Underwater intervention, synchronized cameras and cooperative manipulation.</p></div>
    <div className="overview-player-wrap">
    <video ref={player} className="overview-player" controls={started} playsInline preload="none" poster={overview.poster} width="1920" height="1080" tabIndex={0} onPlay={() => setStarted(true)} aria-label="WasserMan overview: underwater tasks, two-arm manipulation, camera views, physical effects and policy results">
      <source src={overview.src} type="video/mp4" />
      <track kind="captions" src={overview.captions} srcLang="en" label="English" />
      <a href={overview.src}>Watch the WasserMan overview video</a>.
    </video>
    {!started && <button className="overview-start" type="button" aria-label="Play overview video" onClick={() => {
      setStarted(true);
      const video = player.current;
      if (video) void video.play().catch(() => video.focus());
    }}><img src={overview.poster} alt="" width="1920" height="1080" /><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7Z" /></svg>Play video</span></button>}
    </div>
    <div className="overview-caption"><p>{Math.floor(overview.duration_seconds / 60)} min {overview.duration_seconds % 60} s · Full HD</p><a href={overview.src} download>Download video ↗</a></div>
    <details className="overview-chapters"><summary>Jump to a chapter</summary><ol>{overview.chapters.map(chapter => <li key={chapter.start}><button type="button" onClick={() => {
      if (!player.current) return;
      setStarted(true);
      const video = player.current;
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) video.currentTime = chapter.start;
      else {
        video.preload = "metadata";
        video.addEventListener("loadedmetadata", () => { video.currentTime = chapter.start; }, { once: true });
        video.load();
      }
      video.focus();
      video.scrollIntoView({ block: "center" });
    }}><span>{Math.floor(chapter.start / 60)}:{String(chapter.start % 60).padStart(2, "0")}</span>{chapter.title}</button></li>)}</ol></details>
  </section>;
}
