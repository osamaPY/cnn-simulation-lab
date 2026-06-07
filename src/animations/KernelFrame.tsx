import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

interface KernelFrameProps {
  stepIndex: number;
  cellSize?: number;
  canvasSize?: number;
}

export const KernelFrame: React.FC<KernelFrameProps> = ({
  stepIndex,
  cellSize = 10,
  canvasSize = 280
}) => {
  const hyperparams = useLabStore(state => state.hyperparams);
  const { kernelSize, stride, padding } = hyperparams;

  const outputDim = Math.floor((28 + 2 * padding - kernelSize) / stride) + 1;
  const row = Math.floor(stepIndex / outputDim);
  const col = stepIndex % outputDim;

  const frameWidth = kernelSize * cellSize;
  const frameHeight = kernelSize * cellSize;

  const x = col * stride * cellSize;
  const y = row * stride * cellSize;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox={`0 0 ${canvasSize} ${canvasSize}`}
    >
      <defs>
        <filter id="kernel-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer sliding frame */}
      <rect
        x={x}
        y={y}
        width={frameWidth}
        height={frameHeight}
        rx="1"
        fill="rgba(245, 205, 71, 0.05)"
        stroke="#F5CD47"
        strokeWidth="1.5"
        filter="url(#kernel-glow)"
        className="transition-all duration-150 ease-out"
      />

      {/* Target output cell highlighted in the center */}
      <rect
        x={x + Math.floor(kernelSize / 2) * cellSize}
        y={y + Math.floor(kernelSize / 2) * cellSize}
        width={cellSize}
        height={cellSize}
        fill="rgba(131, 193, 103, 0.15)"
        stroke="#83C167"
        strokeWidth="1"
        className="transition-all duration-150 ease-out"
      />

      {/* Crosshair dot at the center */}
      <circle
        cx={x + Math.floor(kernelSize / 2) * cellSize + cellSize / 2}
        cy={y + Math.floor(kernelSize / 2) * cellSize + cellSize / 2}
        r="1"
        fill="#83C167"
        className="transition-all duration-150 ease-out"
      />
    </svg>
  );
};
