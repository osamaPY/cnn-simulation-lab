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
      <rect
        x={x}
        y={y}
        width={frameWidth}
        height={frameHeight}
        rx="2"
        fill="rgba(80, 201, 230, 0.10)"
        stroke="var(--aurora-purple)"
        strokeWidth="2"
        className="transition-all duration-150 ease-out"
      />

      {/* Target output cell highlighted in the center */}
      <rect
        x={x + cellSize}
        y={y + cellSize}
        width={cellSize}
        height={cellSize}
        fill="rgba(242, 193, 78, 0.35)"
        stroke="var(--text-accent)"
        strokeWidth="0.75"
        className="transition-all duration-150 ease-out"
      />
    </svg>
  );
};
