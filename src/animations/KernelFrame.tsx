import React from 'react';

interface KernelFrameProps {
  stepIndex: number;
}

export const KernelFrame: React.FC<KernelFrameProps> = ({ stepIndex }) => {
  // Translate 1D stepIndex (0 to 675) to 2D coordinates
  // Stride = 1, valid convolution output size is 26x26
  const row = Math.floor(stepIndex / 26);
  const col = stepIndex % 26;

  // Grid cell size is 10px, so 3x3 kernel size is 30px
  const cellSize = 10;
  const frameWidth = 30;
  const frameHeight = 30;

  const x = col * cellSize;
  const y = row * cellSize;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox="0 0 280 280"
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

      {/* Outer 3x3 sliding frame */}
      <rect
        x={x}
        y={y}
        width={frameWidth}
        height={frameHeight}
        rx="2"
        fill="rgba(245, 158, 11, 0.08)"
        stroke="#f59e0b"
        strokeWidth="2"
        filter="url(#kernel-glow)"
        className="transition-all duration-150 ease-out"
      />

      {/* Target output cell highlighted in the center */}
      <rect
        x={x + cellSize}
        y={y + cellSize}
        width={cellSize}
        height={cellSize}
        fill="rgba(16, 185, 129, 0.25)"
        stroke="#10b981"
        strokeWidth="1"
        className="transition-all duration-150 ease-out"
      />

      {/* Crosshair dot at the center */}
      <circle
        cx={x + cellSize + cellSize / 2}
        cy={y + cellSize + cellSize / 2}
        r="1.2"
        fill="#10b981"
        className="transition-all duration-150 ease-out"
      />
    </svg>
  );
};
