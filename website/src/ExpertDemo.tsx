import { useEffect, useRef, useState } from "react";

/** Clean rollout player. Labels are accessible names, never video overlays. */
export function ExpertDemo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);
  return <div className={`expert-film ${playing ? "is-playing" : "is-paused"}`}>
    <video ref={ref} className="expert-demo" src={src} poster={poster}
      aria-label={label} muted loop playsInline preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <button className="expert-film-toggle" aria-label={`${playing ? "Pause" : "Play"} ${label}`}
      onClick={() => { if (ref.current?.paused) void ref.current.play().catch(() => {}); else ref.current?.pause(); }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor">
        {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z" /> : <path d="M6 3v18l16-9z" />}
      </svg>
    </button>
  </div>;
}
