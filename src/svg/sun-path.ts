import type { SurfaceMode } from '../types';

// the dashed day-arc spanning the card. Drawn in a fixed viewBox and
// stretched with preserveAspectRatio="none" so the arc always runs edge to
// edge; non-scaling-stroke keeps the dashes crisp at any card size.
// Quadratic bezier: endpoints near the bottom corners, peak above center.
const ARC_W = 320;
const ARC_H = 150;
const P0Y = 140;
const CTRL_Y = -64;

export const renderSunArc = (mode: SurfaceMode): string => {
  // dashes stay white against the sky and soften toward the lower zone the
  // arc ends dip into (slate on the light surface, faint white on the dark)
  const tailColor = mode === 'light' ? 'rgba(90,104,128,0.45)' : 'rgba(255,255,255,0.22)';
  return `<svg viewBox="0 0 ${ARC_W} ${ARC_H}" preserveAspectRatio="none"
    style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mwcArcFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
        <stop offset="55%" stop-color="rgba(255,255,255,0.75)"/>
        <stop offset="100%" stop-color="${tailColor}"/>
      </linearGradient>
    </defs>
    <path d="M 0 ${P0Y} Q ${ARC_W / 2} ${CTRL_Y} ${ARC_W} ${P0Y}"
      fill="none" stroke="url(#mwcArcFade)" stroke-width="1.6"
      stroke-dasharray="1.5 7.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
  </svg>`;
};

// point on the same bezier for a day progress 0..1, as percentages of the
// arc box — the marker is an HTML dot so it never distorts with the svg
export const getSunMarkerPos = (progress: number): { xPct: number; yPct: number } => {
  const t = Math.min(1, Math.max(0, progress));
  const oneMinusT = 1 - t;
  const x = 2 * oneMinusT * t * (ARC_W / 2) + t * t * ARC_W;
  const y = oneMinusT * oneMinusT * P0Y + 2 * oneMinusT * t * CTRL_Y + t * t * P0Y;
  return { xPct: (x / ARC_W) * 100, yPct: (y / ARC_H) * 100 };
};
