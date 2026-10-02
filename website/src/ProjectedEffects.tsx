import { useId } from "react";

type ProjectedSegment = { start_px: number[]; end_px: number[]; valid: boolean };
type ProjectedPath = { points_px: number[][]; valid: boolean[]; closed?: boolean };
type Hemisphere = { valid: boolean; radius_m: number; silhouette: ProjectedPath; base_ring: ProjectedPath; meridians: ProjectedPath[] };
export type EffectAnnotations = {
  schema_version: number;
  viewport_px: number[];
  rotor_rays: (ProjectedSegment & { motor_index: number; clearance_m?: number; normal_clearance_m?: number; ray_length_m?: number; hemisphere?: Hemisphere })[];
  commanded_distance?: ProjectedSegment & { value_m: number };
  measured_distance?: ProjectedSegment & { value_m: number };
  commanded_line: ProjectedSegment[];
  measured_line: ProjectedSegment[];
  current_arrows: ProjectedSegment[];
  current_arrow_horizon_s?: number;
  gripper_trajectory?: ProjectedPath & { current_px: number[]; current_valid: boolean };
  gripper_reference?: { point_px: number[]; valid: boolean; label: string };
};

const visible = (segment: ProjectedSegment) => segment.valid &&
  segment.start_px.length === 2 && segment.end_px.length === 2 &&
  [...segment.start_px, ...segment.end_px].every(Number.isFinite);

// Invalid camera projections break the path; never connect across the camera
// plane or fabricate missing positions. All history is reprojected by the recorder.
function pathData(path: ProjectedPath) {
  let connected = false;
  const parts = path.points_px.map((point, i) => {
    if (!path.valid[i] || point.length !== 2 || !point.every(Number.isFinite)) { connected = false; return ""; }
    const command = connected ? "L" : "M";
    connected = true;
    return `${command}${point[0]} ${point[1]}`;
  });
  return parts.join(" ") + (path.closed && path.valid.every(Boolean) ? " Z" : "");
}

// Endpoints come from recorded camera projections (USD observer/live Fabric inset). Styling and
// label padding are screen-space choices; line geometry is never invented here.
export function ProjectedEffects({ annotations, time, motorIndices, showToolTrajectory = false, deltaMm, deltaLabel = "Δ", deltaBadgeAtTop = false }: { annotations: EffectAnnotations; time: number; motorIndices?: number[]; showToolTrajectory?: boolean; deltaMm?: number | null; deltaLabel?: string; deltaBadgeAtTop?: boolean }) {
  const marker = `water-direction-${useId().replaceAll(":", "")}`;
  const clip = `${marker}-viewport`;
  if (![1, 2].includes(annotations.schema_version) || annotations.viewport_px.length !== 2) return null;
  const [width, height] = annotations.viewport_px;
  if (!(width > 0 && height > 0)) return null;
  const target = annotations.commanded_distance?.value_m;
  const actual = annotations.measured_distance?.value_m;
  const measured = annotations.measured_line?.find(visible);
  // An explicit override is measured pair separation supplied by the caller,
  // not tracking error. Null/non-finite means unavailable, never a fallback.
  const trackingDelta = target != null && actual != null && Number.isFinite(target + actual) ? (actual - target) * 1000 : null;
  const delta = deltaMm === undefined ? trackingDelta : deltaMm != null && Number.isFinite(deltaMm) ? deltaMm : null;
  const badgeWidth = deltaLabel === "Δ" ? 212 : Math.max(212, 212 + (deltaLabel.length - 1) * 15);
  const labelAnchor = measured && ([measured.end_px, measured.start_px].find(([x, y]) => x >= 0 && x <= width && y >= 0 && y <= height) ?? measured.end_px);
  const labelX = labelAnchor ? Math.max(12, Math.min(width - badgeWidth - 16, labelAnchor[0] + 12)) : 0;
  // Matched-delta badges stay clear of the lower live HUD on narrow screens.
  const labelY = deltaBadgeAtTop ? 100 : labelAnchor ? Math.max(46, Math.min(height - 95, labelAnchor[1] - 16)) : 0;
  const line = (segment: ProjectedSegment, key: number, className: string) => visible(segment) &&
    <line key={key} className={className} vectorEffect={className === "projected-rotor-ray" ? "non-scaling-stroke" : undefined} x1={segment.start_px[0]} y1={segment.start_px[1]} x2={segment.end_px[0]} y2={segment.end_px[1]} />;
  return <svg className="effects-projected-geometry" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Projected physical-effect geometry from the recorded camera" data-recorded-time={time}>
    <defs>
      <linearGradient id={`${marker}-dome`} x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#ffe8a0" /><stop offset="0.55" stopColor="#edc45f" /><stop offset="1" stopColor="#a77927" /></linearGradient>
      <marker id={marker} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M1 1L11 6L1 11Z" className="water-arrow-head" /></marker>
      <clipPath id={clip}><rect width={width} height={height} /></clipPath>
    </defs>
    <g clipPath={`url(#${clip})`}>
    <g className="projected-rotor-rays">
      {(annotations.rotor_rays ?? []).filter((ray) => visible(ray) && (!motorIndices || motorIndices.includes(ray.motor_index))).map((ray) => <g key={ray.motor_index} data-motor-index={ray.motor_index} data-clearance-m={ray.normal_clearance_m ?? ray.clearance_m}>
        {line(ray, ray.motor_index, "projected-rotor-ray")}
        {ray.hemisphere?.valid ? <g className="projected-hemisphere" data-radius-m={ray.hemisphere.radius_m}>
          <path className="hemisphere-silhouette" vectorEffect="non-scaling-stroke" fill={`url(#${marker}-dome)`} d={pathData(ray.hemisphere.silhouette)} />
          <path className="hemisphere-base" vectorEffect="non-scaling-stroke" d={pathData(ray.hemisphere.base_ring)} />
          {ray.hemisphere.meridians.slice(0, 1).map((arc, i) => <path key={i} className="hemisphere-meridian" vectorEffect="non-scaling-stroke" d={pathData(arc)} />)}
        </g> : annotations.schema_version === 1 && <circle cx={ray.end_px[0]} cy={ray.end_px[1]} r="6" />}
      </g>)}
    </g>
    <g className="projected-reference-lines">{(annotations.commanded_line ?? []).map((segment, i) => line(segment, i, "projected-commanded-line"))}</g>
    <g className="projected-measured-lines">{(annotations.measured_line ?? []).map((segment, i) => line(segment, i, "projected-measured-line"))}</g>
    <g className="projected-current-arrows">{(annotations.current_arrows ?? []).filter((segment) => visible(segment) && Math.hypot(segment.end_px[0] - segment.start_px[0], segment.end_px[1] - segment.start_px[1]) > 1e-5).map((segment, i) => <line key={i} x1={segment.start_px[0]} y1={segment.start_px[1]} x2={segment.end_px[0]} y2={segment.end_px[1]} markerEnd={`url(#${marker})`} />)}</g>
    {showToolTrajectory && annotations.gripper_trajectory && <g className="projected-gripper-trajectory">
      <path className="gripper-trail" vectorEffect="non-scaling-stroke" d={pathData(annotations.gripper_trajectory)} />
      {annotations.gripper_trajectory.current_valid && <circle className="gripper-current" cx={annotations.gripper_trajectory.current_px[0]} cy={annotations.gripper_trajectory.current_px[1]} r={width / 160} />}
    </g>}
    {showToolTrajectory && annotations.gripper_reference?.valid && <circle className="gripper-reference" cx={annotations.gripper_reference.point_px[0]} cy={annotations.gripper_reference.point_px[1]} r={width / 180}><title>Initial tool position</title></circle>}
    {measured && delta != null && <g className="projected-error-badge" transform={`translate(${labelX} ${labelY})`}>
      <rect x="0" y="-30" width={badgeWidth} height="42" rx="5" />
      <text x="10" y="0">{deltaLabel} {delta >= 0 ? "+" : ""}{delta.toFixed(1)} mm</text>
    </g>}
    </g>
  </svg>;
}
