import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { TimelineStepper } from '../../components/TimelineStepper';
import { getAuroraColor } from '../../canvas/heatScale';
import { getFlatIndex, getOriginFromFlatIndex } from '../../math/flatten';
import { computeMaxPool2D } from '../../math/pooling';
import { computeValidConv2D, REPRESENTATIVE_KERNEL, REPRESENTATIVE_BIAS } from '../../math/convolution';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Set up 10 representative cells that peel and fly
const REPRESENTATIVE_CELLS = [
  { row: 0, col: 0, channel: 0, startPct: 0.0, durationPct: 0.25 },
  { row: 2, col: 3, channel: 1, startPct: 0.08, durationPct: 0.25 },
  { row: 5, col: 6, channel: 2, startPct: 0.16, durationPct: 0.25 },
  { row: 8, col: 9, channel: 3, startPct: 0.24, durationPct: 0.25 },
  { row: 11, col: 12, channel: 4, startPct: 0.32, durationPct: 0.25 },
  { row: 1, col: 10, channel: 5, startPct: 0.40, durationPct: 0.25 },
  { row: 12, col: 1, channel: 6, startPct: 0.48, durationPct: 0.25 },
  { row: 4, col: 7, channel: 7, startPct: 0.56, durationPct: 0.25 },
  { row: 9, col: 5, channel: 4, startPct: 0.64, durationPct: 0.25 },
  { row: 6, col: 11, channel: 2, startPct: 0.72, durationPct: 0.25 },
];

/**
 * Calculates a point on a quadratic Bezier curve at parameter t [0, 1]
 */
function getBezierPoint(
  t: number,
  start: [number, number],
  ctrl: [number, number],
  end: [number, number]
): [number, number] {
  const mt = 1 - t;
  const x = mt * mt * start[0] + 2 * mt * t * ctrl[0] + t * t * end[0];
  const y = mt * mt * start[1] + 2 * mt * t * ctrl[1] + t * t * end[1];
  return [x, y];
}

export const FlattenStage: React.FC = () => {
  const { preprocessedData, activations } = useLabStore();
  const stackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const totalSteps = 100;
  const { stepIndex } = useTimeline(totalSteps);
  const progress = stepIndex / (totalSteps - 1 || 1); // 0.0 to 1.0

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // 1. Retrieve or generate the flat 13x13x8 volume (1352 elements)
  const volumeValues = useMemo(() => {
    // Check for real MaxPooling2D activations (which precedes Flatten)
    const maxPoolRecord = activations.find(
      r => r.layerType === 'MaxPooling2D' || 
           (r.shape.length === 4 && r.shape[1] === 13 && r.shape[2] === 13 && r.shape[3] === 8)
    );
    if (maxPoolRecord) {
      return maxPoolRecord.values; // Size is 1352
    }

    // Check for real Flatten activations
    const flattenRecord = activations.find(
      r => r.layerType === 'Flatten' || (r.shape.length === 2 && r.shape[1] === 1352)
    );
    if (flattenRecord) {
      return flattenRecord.values; // Size is 1352
    }

    // Fallback: convolve drawing + pool + channel expand in JS
    const input26 = preprocessedData
      ? computeValidConv2D(preprocessedData, REPRESENTATIVE_KERNEL, REPRESENTATIVE_BIAS)
      : new Float32Array(26 * 26);
    const pool13 = computeMaxPool2D(input26);
    
    const mockVol = new Float32Array(13 * 13 * 8);
    for (let r = 0; r < 13; r++) {
      for (let c = 0; c < 13; c++) {
        const baseVal = pool13[r * 13 + c];
        for (let ch = 0; ch < 8; ch++) {
          const idx = (r * 13 + c) * 8 + ch;
          // Generate deterministic variations per channel so they look distinct
          const factor = 0.45 + 0.55 * Math.sin(ch * 0.9 + r * 0.15 - c * 0.08);
          mockVol[idx] = Math.max(0, baseVal * factor);
        }
      }
    }
    return mockVol;
  }, [activations, preprocessedData]);

  // Find min/max values of volume for visual scaling
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < volumeValues.length; i++) {
      const v = volumeValues[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) {
      min = 0;
      max = 1;
    }
    return { minVal: min, maxVal: max };
  }, [volumeValues]);

  // Coordinate projection from 3D stack coordinate (row, col, channel) to 2D canvas coordinates
  const project = useMemo(() => {
    return (row: number, col: number, channel: number): [number, number] => {
      const centerX = 400; // Horizontal center of stack
      const centerY = 190; // Vertical center of stack
      
      // Channel stacking offsets (back to front)
      const chSpacingX = -20;
      const chSpacingY = 15;
      
      // Cell offsets within grid
      const cellSpacingRowX = 8.5;
      const cellSpacingRowY = 4.2;
      const cellSpacingColX = -8.5;
      const cellSpacingColY = 4.2;
      
      const ox = centerX + (channel - 3.5) * chSpacingX;
      const oy = centerY + (channel - 3.5) * chSpacingY;
      
      const rx = ox + (row - 6) * cellSpacingRowX + (col - 6) * cellSpacingColX;
      const ry = oy + (row - 6) * cellSpacingRowY + (col - 6) * cellSpacingColY;
      
      return [rx, ry];
    };
  }, []);

  // Draw 3D Stack onto background canvas
  useEffect(() => {
    const canvas = stackCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw channels back-to-front (channel 0 to 7)
    for (let ch = 0; ch < 8; ch++) {
      // 1. Draw boundary outline plate
      ctx.beginPath();
      const c1 = project(-0.5, -0.5, ch);
      const c2 = project(-0.5, 12.5, ch);
      const c3 = project(12.5, 12.5, ch);
      const c4 = project(12.5, -0.5, ch);
      ctx.moveTo(c1[0], c1[1]);
      ctx.lineTo(c2[0], c2[1]);
      ctx.lineTo(c3[0], c3[1]);
      ctx.lineTo(c4[0], c4[1]);
      ctx.closePath();
      
      ctx.fillStyle = 'rgba(8, 4, 16, 0.75)';
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 2. Draw grid cells
      for (let r = 0; r < 13; r++) {
        for (let c = 0; c < 13; c++) {
          const idx = (r * 13 + c) * 8 + ch;
          const val = volumeValues[idx];
          const norm = (val - minVal) / (maxVal - minVal || 1);
          
          const p1 = project(r - 0.5, c - 0.5, ch);
          const p2 = project(r - 0.5, c + 0.5, ch);
          const p3 = project(r + 0.5, c + 0.5, ch);
          const p4 = project(r + 0.5, c - 0.5, ch);
          
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.lineTo(p3[0], p3[1]);
          ctx.lineTo(p4[0], p4[1]);
          ctx.closePath();
          
          const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
          ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
          ctx.fill();
          
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }, [volumeValues, minVal, maxVal, project]);

  // Draw 1D Vector strip progressively
  useEffect(() => {
    const canvas = vectorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 1352; i++) {
      const isRevealed = (i / 1351) <= progress;
      const val = volumeValues[i];
      const norm = (val - minVal) / (maxVal - minVal || 1);
      
      if (isRevealed) {
        const { r, g, b } = getAuroraColor(norm);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      } else {
        ctx.fillStyle = 'rgba(12, 7, 23, 0.6)';
      }
      
      ctx.fillRect(i, 0, 1, 24);
      
      // Draw small vertical divider lines to show groups of 8 elements (pixels)
      if (i % 8 === 0 && i > 0 && !isRevealed) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.fillRect(i, 0, 1, 24);
      }
    }
  }, [volumeValues, minVal, maxVal, progress]);

  // Mouse move handler on the SVG (snap hover to 3D stack cells)
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 480 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    // Ignore if mouse is near the vector canvas at the bottom
    if (mouseY > 380) {
      return;
    }
    
    let closestIndex = -1;
    let minDistance = 22; // Snapping radius
    
    for (let ch = 0; ch < 8; ch++) {
      for (let r = 0; r < 13; r++) {
        for (let c = 0; c < 13; c++) {
          const [cx, cy] = project(r, c, ch);
          const dist = Math.hypot(mouseX - cx, mouseY - cy);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = (r * 13 + c) * 8 + ch;
          }
        }
      }
    }
    
    if (closestIndex !== -1) {
      setHoveredIndex(closestIndex);
    } else {
      setHoveredIndex(null);
    }
  };

  // Mouse move handler on the 1D vector canvas
  const handleVectorMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const idx = Math.floor(pct * 1351);
    setHoveredIndex(idx);
  };

  // Hover telemetry details
  const hoverDetails = useMemo(() => {
    if (hoveredIndex === null) return null;
    const { row, col, channel } = getOriginFromFlatIndex(hoveredIndex, [1, 13, 13, 8]);
    const value = volumeValues[hoveredIndex];
    return { index: hoveredIndex, row, col, channel, value };
  }, [hoveredIndex, volumeValues]);

  return (
    <div className="flex flex-col gap-5 w-full items-center">
      
      {/* Inline styles for keyframe animations (Aurora Shimmer) */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
      `}</style>

      {/* Main Visualizer Board */}
      <div className="relative w-full max-w-[800px] aspect-[800/480] bg-bg-canvas rounded-xl border border-border-muted overflow-hidden shadow-2xl">
        
        {/* Background Grid Canvas */}
        <canvas
          ref={stackCanvasRef}
          width={800}
          height={480}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* SVG Interactive Overlay */}
        <svg
          viewBox="0 0 800 480"
          className="absolute inset-0 w-full h-full select-none z-10"
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Representative Cell Trajectories */}
          {REPRESENTATIVE_CELLS.map((cell, idx) => {
            const targetIdx = getFlatIndex(cell.row, cell.col, cell.channel, [1, 13, 13, 8]);
            const startPt = project(cell.row, cell.col, cell.channel);
            const endPt: [number, number] = [50 + (targetIdx / 1351) * 700, 410];
            const ctrlX = (startPt[0] + endPt[0]) / 2;
            const ctrlY = Math.min(startPt[1], endPt[1]) - 100;
            
            return (
              <path
                key={`traj-${idx}`}
                d={`M ${startPt[0]} ${startPt[1]} Q ${ctrlX} ${ctrlY} ${endPt[0]} ${endPt[1]}`}
                stroke="rgba(139, 92, 246, 0.22)"
                strokeWidth="1"
                strokeDasharray="3 3"
                fill="none"
              />
            );
          })}

          {/* Flying Representative Cells */}
          {!shouldReduceMotion && REPRESENTATIVE_CELLS.map((cell, idx) => {
            const targetIdx = getFlatIndex(cell.row, cell.col, cell.channel, [1, 13, 13, 8]);
            const startPt = project(cell.row, cell.col, cell.channel);
            const endPt: [number, number] = [50 + (targetIdx / 1351) * 700, 422];
            const ctrlX = (startPt[0] + endPt[0]) / 2;
            const ctrlY = Math.min(startPt[1], endPt[1]) - 100;

            let t = 0;
            if (progress > cell.startPct) {
              t = Math.min(1, (progress - cell.startPct) / cell.durationPct);
            }

            // Ease flight
            const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const [currX, currY] = getBezierPoint(easeT, startPt, [ctrlX, ctrlY], endPt);

            const cellVal = volumeValues[targetIdx];
            const norm = (cellVal - minVal) / (maxVal - minVal || 1);
            const color = getAuroraColor(norm);

            // Hide dot if not yet peeling
            if (t <= 0) return null;

            return (
              <g key={`flying-${idx}`}>
                {/* Glow ring */}
                {easeT > 0 && easeT < 1 && (
                  <circle
                    cx={currX}
                    cy={currY}
                    r={7}
                    fill="none"
                    stroke={`rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`}
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}
                {/* Core particle */}
                <circle
                  cx={currX}
                  cy={currY}
                  r={4}
                  fill={`rgb(${color.r}, ${color.g}, ${color.b})`}
                  stroke="white"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Active Hover Highlight in 3D Stack */}
          {hoveredIndex !== null && (() => {
            const { row, col, channel } = getOriginFromFlatIndex(hoveredIndex, [1, 13, 13, 8]);
            const p1 = project(row - 0.5, col - 0.5, channel);
            const p2 = project(row - 0.5, col + 0.5, channel);
            const p3 = project(row + 0.5, col + 0.5, channel);
            const p4 = project(row + 0.5, col - 0.5, channel);
            const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}`;
            
            return (
              <g>
                <polygon
                  points={points}
                  fill="rgba(52, 211, 153, 0.25)"
                  stroke="var(--aurora-mint)"
                  strokeWidth="2.5"
                />
                {/* Trace Line */}
                {(() => {
                  const [cellX, cellY] = project(row, col, channel);
                  const vecX = 50 + (hoveredIndex / 1351) * 700;
                  const vecY = 410;
                  const ctrlX = (cellX + vecX) / 2;
                  const ctrlY = Math.min(cellY, vecY) - 60;
                  
                  return (
                    <path
                      d={`M ${cellX} ${cellY} Q ${ctrlX} ${ctrlY} ${vecX} ${vecY}`}
                      stroke="var(--aurora-mint)"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      fill="none"
                      className="animate-pulse"
                    />
                  );
                })()}
              </g>
            );
          })()}

          {/* Active Hover Highlight in 1D Vector */}
          {hoveredIndex !== null && (() => {
            const x = 50 + (hoveredIndex / 1351) * 700;
            return (
              <rect
                x={x - 1.5}
                y={408}
                width={3}
                height={28}
                fill="#ffffff"
                stroke="var(--aurora-mint)"
                strokeWidth={0.5}
              />
            );
          })()}

          {/* Vector Canvas Container */}
          <foreignObject x={50} y={410} width={700} height={24}>
            <div className="relative w-full h-full rounded border border-aurora-teal/35 overflow-hidden shadow-inner bg-bg-deep/90 select-none">
              <canvas
                ref={vectorCanvasRef}
                width={1352}
                height={24}
                className="w-full h-full block cursor-crosshair"
                onMouseMove={handleVectorMouseMove}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* Aurora Ambient Shimmer Overlay */}
              <div className="absolute inset-0 pointer-events-none rounded overflow-hidden">
                <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-aurora-mint/10 to-transparent animate-shimmer" />
              </div>
            </div>
          </foreignObject>

          {/* Scale Labels & Badges */}
          <text x={50} y={400} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">0</text>
          <text x={390} y={400} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">676</text>
          <text x={725} y={400} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">1351</text>
          <text x={50} y={450} fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-sans)">* 1D Flattened Connection Vector (1352 Neurons)</text>

          {/* Stack labels */}
          <text x={260} y={115} fill="rgba(139, 92, 246, 0.7)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">Ch 0 (Back)</text>
          <text x={110} y={350} fill="rgba(52, 211, 153, 0.8)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">Ch 7 (Front)</text>
        </svg>

        {/* Hover Traceback Tooltip Overlay */}
        {hoverDetails && (
          <div 
            className="absolute top-4 left-4 p-3 rounded-lg bg-bg-card/90 border border-aurora-mint/30 shadow-lg text-[11px] font-mono text-text-primary backdrop-blur-md z-20 flex flex-col gap-1 w-52 select-none animate-fadeIn"
            style={{ pointerEvents: 'none' }}
          >
            <div className="border-b border-border-muted pb-1 mb-1 font-bold text-aurora-mint uppercase tracking-wider text-[10px]">
              Connection Telemetry
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Flat Index:</span>
              <span className="text-text-primary font-semibold">{hoverDetails.index}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Feature Map:</span>
              <span className="text-aurora-purple font-semibold">Ch {hoverDetails.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Coordinates:</span>
              <span className="text-text-primary font-semibold">({hoverDetails.row}, {hoverDetails.col})</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border-subtle mt-1">
              <span className="text-text-secondary">Activation:</span>
              <span className="text-aurora-mint font-bold">{hoverDetails.value.toFixed(4)}</span>
            </div>
          </div>
        )}

        {/* General Instruction Overlay */}
        {!hoverDetails && (
          <div className="absolute top-4 left-4 p-2.5 rounded-lg bg-bg-card/75 border border-border-muted text-[10px] font-mono text-text-secondary backdrop-blur-sm z-20 pointer-events-none select-none max-w-[200px]">
            Hover over the 3D volume or the 1D vector below to trace neural connections.
          </div>
        )}

        {/* Shape Badge Overlay */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none select-none">
          <div className="flex items-center gap-1.5 bg-bg-card/85 border border-border-muted rounded-md px-2.5 py-1 font-mono text-[10px]">
            <span className="text-text-muted">Shape:</span>
            <span className="text-aurora-purple font-bold">13×13×8</span>
            <span className="text-text-secondary">➔</span>
            <span className="text-aurora-mint font-bold">1352</span>
          </div>
        </div>
      </div>

      {/* Progress & Timeline Controls */}
      <div className="w-full max-w-[800px] flex flex-col items-center gap-4">
        <TimelineStepper stageTotalSteps={totalSteps} />
        
        {/* Architectural Explainer */}
        <div className="w-full border border-border-subtle p-3.5 rounded-xl bg-bg-panel/40 flex flex-col items-center gap-2 text-xs text-text-secondary leading-relaxed">
          <div className="flex items-center gap-2 font-mono text-text-accent font-semibold">
            <span>Vector Length: 13 × 13 × 8 = 1352 Connections</span>
          </div>
          <p className="text-[10px] text-text-muted text-center max-w-lg">
            * Representative Animation: 10 sample paths are animated peeling and arcing from the grids to show unrolling sequence. The entire vector is flattened simultaneously.
          </p>
          <p className="text-[10px] text-text-muted text-center max-w-lg border-t border-border-subtle/50 pt-2 mt-1">
            <strong>Tensor layout:</strong> In channel-last format (NHWC), adjacent vector indices represent the 8 channels of a single pixel consecutively, followed by the next pixel along the row.
          </p>
        </div>
      </div>
    </div>
  );
};
