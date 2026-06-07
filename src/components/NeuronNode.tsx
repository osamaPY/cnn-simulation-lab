/**
 * NeuronNode — a single animated neuron circle that pulses / glows based on
 * its activation value.  The fill & glow intensity are driven by `value`.
 */
import React from 'react';

interface NeuronNodeProps {
  cx: number;
  cy: number;
  r?: number;
  value: number;          // 0..1 normalised activation
  label?: string;
  isHighlighted?: boolean;
  color?: string;
  dimColor?: string;
  onClick?: () => void;
}

export const NeuronNode: React.FC<NeuronNodeProps> = ({
  cx, cy, r = 10,
  value,
  label,
  isHighlighted = false,
  color = '#34d399',
  dimColor = 'rgba(255,255,255,0.12)',
  onClick,
}) => {
  const clampedValue = Math.min(1, Math.max(0, value));
  const fillAlpha = 0.08 + clampedValue * 0.85;
  const strokeColor = isHighlighted ? color : 'rgba(255,255,255,0.22)';
  const strokeWidth = isHighlighted ? 1.8 : 1;

  return (
    <g
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Outer glow halo — visible only when activated */}
      {clampedValue > 0.3 && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 5}
          fill={color}
          fillOpacity={clampedValue * 0.18}
        />
      )}

      {/* Main body */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={isHighlighted ? color : `rgba(52,211,153,${fillAlpha})`}
        fillOpacity={isHighlighted ? 1 : undefined}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Label */}
      {label && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isHighlighted ? '#0f172a' : 'rgba(255,255,255,0.75)'}
          fontSize={9}
          fontWeight="bold"
          fontFamily="monospace"
        >
          {label}
        </text>
      )}
    </g>
  );
};
