import { useState } from "react";
import { ExpertDemo } from "./ExpertDemo";
import catalog from "../public/static/task-demos/selected.json";

export const selectedTaskDemos = catalog;
type Task = keyof typeof catalog;
const cameras = ["overview", "base", "gripper"] as const;
const names = { overview: "External", base: "Base", gripper: "Gripper" };

/** Presentation cameras from one recorded episode; no policy input changes. */
export function SelectedTaskDemo({ taskId }: { taskId: Task }) {
  const [camera, setCamera] = useState<typeof cameras[number]>("overview");
  const demo = catalog[taskId];
  const stream = demo.streams[camera];
  return <div className="selected-task-demo" data-selected-demo={taskId}>
    <ExpertDemo key={camera} src={`${stream.src}?v=${stream.sha256.slice(0, 12)}`}
      poster={stream.src.replace(/\.mp4$/, ".png")}
      label={`${demo.title} expert · ${names[camera]} camera`} />
    <div className="selected-camera-controls" aria-label={`${demo.title} camera`}>
      {cameras.map(id => <button key={id} aria-pressed={camera === id} onClick={() => setCamera(id)}>{names[id]}</button>)}
      <a href={stream.src}>Original video ↗</a>
    </div>
  </div>;
}
