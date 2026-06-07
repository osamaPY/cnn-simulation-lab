/**
 * AnimatedFormula — renders a formula that "draws on" from left to right,
 * 3Blue1Brown style. Uses CSS clip-path animation.
 *
 * Props:
 *   formula   — string, e.g. "output = Σ(x·w) + b"
 *   progress  — 0..1  (control externally or let it self-animate)
 *   color     — CSS color string
 */
import React, { useEffect, useRef } from 'react';

interface AnimatedFormulaProps {
  formula: string;
  progress?: number;       // 0..1 — if omitted the component self-animates
  color?: string;
  fontSize?: string;
  durationMs?: number;
  className?: string;
}

export const AnimatedFormula: React.FC<AnimatedFormulaProps> = ({
  formula,
  progress,
  color = '#34d399',
  fontSize = '1.1rem',
  durationMs = 1400,
  className = '',
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  /* If caller controls progress, apply it directly */
  useEffect(() => {
    if (progress === undefined) return;
    if (!spanRef.current) return;
    const pct = Math.min(1, Math.max(0, progress)) * 100;
    spanRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  }, [progress]);

  return (
    <span
      className={`relative inline-block font-mono font-bold select-none ${className}`}
      style={{ fontSize }}
    >
      {/* Ghost layer — very faint skeleton */}
      <span style={{ color, opacity: 0.10, letterSpacing: '0.04em', pointerEvents: 'none' }}>
        {formula}
      </span>

      {/* Animated reveal layer on top */}
      <span
        ref={spanRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color,
          letterSpacing: '0.04em',
          clipPath: progress !== undefined ? undefined : 'inset(0 100% 0 0)',
          animation:
            progress !== undefined
              ? 'none'
              : `formulaReveal ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
          filter: `drop-shadow(0 0 6px ${color}66)`,
        }}
      >
        {formula}
      </span>

      <style>{`
        @keyframes formulaReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
      `}</style>
    </span>
  );
};
