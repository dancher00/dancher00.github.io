import { useEffect, useRef, useState, type ReactNode } from "react";

export function CinemaPlayer({
  src,
  poster,
  label,
  compact = false,
  caption,
  chapters = [],
  cameraStreams = [],
  onTimeChange,
  overlay,
}: {
  src: string;
  poster: string;
  label: string;
  compact?: boolean;
  caption?: string;
  chapters?: { time: number; label: string }[];
  cameraStreams?: { id: string; label: string; src: string; sha256?: string; kind?: "onboard" | "external" | "comparison"; aspectRatio?: number; overlay?: ReactNode }[];
  onTimeChange?: (seconds: number) => void;
  overlay?: ReactNode;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(1);
  const [showCameras, setShowCameras] = useState(true);
  const updateDuration = () => {
    const seconds = video.current?.duration;
    if (seconds !== undefined && Number.isFinite(seconds) && seconds > 0) setDuration(seconds);
  };
  // A cached video can have metadata before a lazy-mounted player attaches.
  useEffect(() => { updateDuration(); }, [src]);
  const cameras = useRef(new Map<string, HTMLVideoElement>());
  const externalCamera = cameraStreams.some((camera) => camera.kind === "external");
  const comparison = cameraStreams.some((camera) => camera.kind === "comparison");
  const cameraBankLabel = comparison ? "Synchronized comparison replays" : externalCamera ? "Synchronized external camera" : "Synchronized robot cameras";
  useEffect(() => {
    if (!onTimeChange) return;
    let frameId: number;
    const tick = () => { onTimeChange(video.current?.currentTime ?? 0); frameId = requestAnimationFrame(tick); };
    tick();
    return () => cancelAnimationFrame(frameId);
  }, [onTimeChange]);
  const synchronize = (force = false) => {
    const master = video.current;
    if (!master) return;
    cameras.current.forEach((camera) => {
      camera.playbackRate = master.playbackRate;
      if (camera.readyState > 0 && (force || Math.abs(camera.currentTime - master.currentTime) > 0.06)) {
        camera.currentTime = Math.min(master.currentTime, camera.duration || master.currentTime);
      }
      if (master.paused || master.ended || !showCameras) camera.pause();
      else if (camera.paused) void camera.play().catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(comparison ? "The comparison recording could not play. Open the recordings below." : "A camera feed could not play. The observer recording remains available.");
      });
    });
  };
  useEffect(() => {
    if (!cameraStreams.length) return;
    let id: number;
    const tick = () => { synchronize(); id = requestAnimationFrame(tick); };
    tick();
    return () => cancelAnimationFrame(id);
  }, [showCameras]);
  const currentChapter = chapters.reduce((selected, chapter, index) => chapter.time <= time + 0.05 ? index : selected, 0);
  const format = (t: number) =>
    `${Math.floor(t / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(t % 60)
      .toString()
      .padStart(2, "0")}`;
  useEffect(() => {
    const element = video.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) element?.pause();
    });
    if (element) observer.observe(element);
    return () => {
      observer.disconnect();
      element?.pause();
    };
  }, []);
  const toggle = async () => {
    if (!video.current) return;
    if (!video.current.paused) {
      video.current.pause();
      return;
    }
    try {
      await video.current.play();
      setError("");
    } catch (cause) {
      // Pausing or scrolling out of view can cancel a pending play() promise.
      // That is normal interaction, not a broken recording.
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError("Playback could not start. Open the recording below.");
    }
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frame.current?.requestFullscreen();
    } catch {
      setError(
        "Fullscreen is unavailable in this browser. The recording can still play here.",
      );
    }
  };
  return (
    <div
      ref={frame}
      className={`cinema-player ${compact ? "compact" : ""} ${playing ? "playing" : "paused"}`}
    >
      <video
        ref={video}
        className="cinema-observer"
        src={src}
        poster={cameraStreams.length || onTimeChange ? undefined : poster}
        playsInline
        muted
        preload="metadata"
        aria-label={label}
        onCanPlay={updateDuration}
        onPlay={() => { updateDuration(); setPlaying(true); setError(""); synchronize(true); }}
        onPause={() => { setPlaying(false); synchronize(true); }}
        onEnded={() => setPlaying(false)}
        onSeeked={() => synchronize(true)}
        onTimeUpdate={() => { const seconds = video.current?.currentTime ?? 0; setTime(seconds); onTimeChange?.(seconds); }}
        onLoadedMetadata={() => {
          updateDuration();
          if ((cameraStreams.length || onTimeChange) && video.current) video.current.currentTime = 0.001;
        }}
        onDurationChange={updateDuration}
        onError={() =>
          setError("Recording unavailable. Open the file directly below.")
        }
      />
      {overlay}
      {cameraStreams.length > 0 && (
        <div className={`cinema-camera-bank${comparison ? " comparison-stream-bank" : ""}${externalCamera ? " external-camera-bank" : ""}${showCameras ? "" : " camera-bank-hidden"}`} aria-label={cameraBankLabel} aria-hidden={!showCameras}>
          {cameraStreams.map((camera) => (
            <figure key={camera.id} style={camera.aspectRatio ? { aspectRatio: camera.aspectRatio } : undefined}>
              <video
                ref={(element) => { if (element) cameras.current.set(camera.id, element); else cameras.current.delete(camera.id); }}
                src={camera.sha256 ? `${camera.src}?v=${camera.sha256.slice(0, 12)}` : camera.src}
                muted playsInline preload="metadata"
                aria-label={camera.kind === "comparison" ? `${camera.label}: matched motor commands with ${label}` : `${camera.label} camera: same episode as ${label}`}
                onLoadedMetadata={() => synchronize(true)}
                onError={() => setError(`${camera.label}${camera.kind === "comparison" ? "" : " camera"} recording unavailable.`)}
              />
              {camera.overlay}
              <figcaption>{camera.label.toUpperCase()} <span>{camera.kind === "comparison" ? "MATCHED RUN" : "RGB"}</span></figcaption>
            </figure>
          ))}
        </div>
      )}
      <div className="cinema-top">
        <span className="cinema-signal" />
        <span>{caption ?? (compact ? "SCENE RECORDING" : "WasserMan / OBSERVATION PORT")}</span>
        {chapters.length > 0 && (
          <select
            className="cinema-chapters"
            aria-label={`Jump to stage of ${label}`}
            value={currentChapter}
            onChange={(event) => {
              const chapter = chapters[Number(event.target.value)];
              if (video.current) {
                video.current.currentTime = chapter.time;
                setTime(chapter.time);
              }
            }}
          >
            {chapters.map((chapter, index) => (
              <option key={chapter.label} value={index}>{format(chapter.time)} · {chapter.label}</option>
            ))}
          </select>
        )}
        <span className="cinema-top-right">
          {playing
            ? "PLAYING"
            : time >= duration && duration > 0
              ? "COMPLETE"
              : "STANDBY"}
        </span>
      </div>
      {!playing && (
        <button
          className="cinema-start"
          aria-label={`Play ${label}`}
          onClick={toggle}
        >
          <span aria-hidden="true">▷</span>
          <small>
            {time >= duration && duration > 0 ? "REPLAY" : "VIEW RECORDING"}
          </small>
        </button>
      )}
      <div className="cinema-controls">
        <button
          onClick={toggle}
          aria-label={`${playing ? "Pause" : "Play"} recording`}
        >
          {playing ? "Ⅱ" : "▷"}
        </button>
        <span className="cinema-time">{format(time)}</span>
        <input
          type="range"
          min="0"
          max={duration || 1}
          disabled={duration <= 0}
          step="0.01"
          value={Math.min(time, duration || 1)}
          aria-label={`Seek ${label}`}
          style={
            {
              "--progress": `${duration ? (time / duration) * 100 : 0}%`,
            } as React.CSSProperties
          }
          onChange={(e) => {
            if (video.current) {
              video.current.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }
          }}
        />
        <span className="cinema-time">{format(duration)}</span>
        {cameraStreams.length > 0 && !comparison && <button
          className="cinema-camera-toggle"
          aria-label={`Show ${cameraBankLabel.toLowerCase()}`}
          aria-pressed={showCameras}
          onClick={() => setShowCameras(!showCameras)}
        >CAM</button>}
        <button
          className="cinema-speed"
          aria-label={`Playback speed ${speed}x`}
          onClick={() => {
            const next = speed === 1 ? 0.5 : 1;
            if (video.current) video.current.playbackRate = next;
            setSpeed(next);
          }}
        >
          {speed}×
        </button>
        <button onClick={fullscreen} aria-label={`Fullscreen ${label}`}>
          ⛶
        </button>
      </div>
      {error && (
        <p className="cinema-error" role="status">
          {error} <a href={src}>Open recording ↗</a>
        </p>
      )}
    </div>
  );
}
