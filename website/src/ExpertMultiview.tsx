import { useEffect, useRef, useState, type CSSProperties } from "react";

export type DemoStream = { src: string; poster?: string; aspectRatio?: number };
export type DemoViews = { external: DemoStream; base: DemoStream; gripper: DemoStream };

/** One expert episode, three real cameras and a shared playback clock. */
export function ExpertMultiview({ views, label }: { views: DemoViews; label: string }) {
  const master = useRef<HTMLVideoElement>(null);
  const followers = useRef(new Map<string, HTMLVideoElement>());
  const frame = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const video = master.current;
    if (!video || !frame.current) return;
    let animation: number;
    const synchronize = () => {
      followers.current.forEach(camera => {
        camera.playbackRate = video.playbackRate;
        if (camera.readyState > 0 && Math.abs(camera.currentTime - video.currentTime) > .08) camera.currentTime = video.currentTime;
        if (video.paused || video.ended) camera.pause();
        else if (camera.paused) void camera.play().catch(() => {});
      });
      animation = requestAnimationFrame(synchronize);
    };
    synchronize();
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!started && !interacted.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) { started = true; void video.play().catch(() => {}); }
    }, { threshold: .25 });
    observer.observe(frame.current);
    return () => { cancelAnimationFrame(animation); observer.disconnect(); video.pause(); followers.current.forEach(camera => camera.pause()); };
  }, [views]);
  return <div className="expert-multiview" ref={frame} style={{ "--external-aspect": 16 / 9 } as CSSProperties} onPointerDownCapture={() => { interacted.current = true; }} onKeyDownCapture={() => { interacted.current = true; }}>
    <figure className="demo-external">
      <video ref={master} src={views.external.src} poster={views.external.poster} aria-label={`${label} · external camera`} controls muted loop playsInline preload="metadata" onSeeking={() => { interacted.current = true; }} onPause={() => { interacted.current = true; }} onError={() => setError(true)} />
    </figure>
    <div className="demo-camera-streams">{(["base", "gripper"] as const).map(camera => <figure key={camera}>
      <video ref={element => { if (element) followers.current.set(camera, element); else followers.current.delete(camera); }} src={views[camera].src} poster={views[camera].poster} aria-label={`${label} · ${camera} camera`} muted playsInline preload="metadata" onError={() => setError(true)} />
    </figure>)}</div>
    {error && <p role="alert">A recording could not load. <a href={views.external.src}>Open the recording ↗</a></p>}
  </div>;
}
