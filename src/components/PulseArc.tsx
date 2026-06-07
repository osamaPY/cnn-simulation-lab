/**
 * PulseArc — an SVG animated arc / curved arrow that flows from (x1,y1) to
 * (x2,y2) with a glowing pulse dot running along it.
 * Replicates the "signal flowing through a connection" look from 3b1b.
 */
import React from 'react';

interface PulseArcProps {
  x1: number; y1: number;
  x2: number; y2: number;
  progress: number;        // 0..1 — how far along the arc the dot is
  color?: string;
  curvature?: number;      // control-point offset (default 40)
  width?: number;
  height?: number;
  dotRadius?: number;
  lineOpacity?: number;
  id?: string;
}

export const PulseArc: React.FC<PulseArcProps> = ({
  x1, y1, x2, y2,
  progress,
  color = '#34d399',
  curvature = 40,
  width = 400, height = 200,
  dotRadius = 5,
  lineOpacity = 0.35,
  id = 'arc',
}) => {
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - curvature;
  const path = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  const pathId = `path-${id}`;

  // Approximate point along quadratic bezier at t=progress
  const t = progress;
  const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
  const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden
    >
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Static arc line */}
      <path d={path} stroke={color} strokeOpacity={lineOpacity} strokeWidth={1.5} fill="none" strokeDasharray="4 4" />

      {/* Glowing dot that travels along the arc */}
      {progress > 0 && progress < 1 && (
        <circle
          cx={bx}
          cy={by}
          r={dotRadius}
          fill={color}
          filter={`url(#glow-${id})`}
        />
      )}
    </svg>
  );
};
