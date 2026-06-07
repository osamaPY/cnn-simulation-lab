/**
 * ReluGraphCanvas — draws the ReLU hinge graph on a <canvas> with a
 * 3b1b-style animated reveal: the axis draws on first, then the negative
 * flat line, then the positive slope rises up.
 *
 * progress: 0..1
 */
import React, { useEffect, useRef } from 'react';
import { remap, easeOutExpo } from '../../animations/mathUtils';

interface ReluGraphCanvasProps {
  progress: number;
  width?: number;
  height?: number;
  currentX?: number;   // -3..3 — marks a vertical probe line
}

export const ReluGraphCanvas: React.FC<ReluGraphCanvasProps> = ({
  progress,
  width = 280,
  height = 180,
  currentX,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const PAD = 28;
    const xScale = (width - PAD * 2) / 6;  // -3..3 maps to canvas x
    const yScale = (height - PAD * 2) / 4;  // -1..3 maps to canvas y
    const toX = (v: number) => PAD + (v + 3) * xScale;
    const toY = (v: number) => height - PAD - v * yScale;

    // ── Phase 1 (0–0.2): draw axes
    const axisP = Math.min(1, remap(progress, 0, 0.2, 0, 1));
    ctx.strokeStyle = `rgba(255,255,255,${0.18 * axisP})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    // x-axis
    ctx.beginPath();
    ctx.moveTo(PAD, toY(0));
    ctx.lineTo(PAD + axisP * (width - PAD * 2), toY(0));
    ctx.stroke();
    // y-axis
    ctx.beginPath();
    ctx.moveTo(toX(0), height - PAD);
    ctx.lineTo(toX(0), height - PAD - axisP * (height - PAD * 2));
    ctx.stroke();

    // Axis labels
    if (axisP > 0.8) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px monospace';
      ctx.fillText('x', width - PAD + 2, toY(0) + 4);
      ctx.fillText('f(x)', toX(0) + 4, PAD - 4);
    }

    // ── Phase 2 (0.2–0.55): flat part x < 0
    const flatP = easeOutExpo(Math.min(1, remap(progress, 0.2, 0.55, 0, 1)));
    if (flatP > 0) {
      ctx.strokeStyle = `rgba(255,128,102,${0.7 * flatP})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toX(-3), toY(0));
      ctx.lineTo(toX(-3 + 3 * flatP), toY(0));
      ctx.stroke();
    }

    // ── Phase 3 (0.55–1.0): rising slope x > 0
    const riseP = easeOutExpo(Math.min(1, remap(progress, 0.55, 1.0, 0, 1)));
    if (riseP > 0) {
      const endX = 3 * riseP;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(0));
      ctx.lineTo(toX(endX), toY(endX));
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Corner hinge dot
    if (progress > 0.5) {
      ctx.beginPath();
      ctx.arc(toX(0), toY(0), 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f2c14e';
      ctx.fill();
    }

    // Optional probe line
    if (currentX !== undefined && progress > 0.8) {
      const cx = Math.max(-3, Math.min(3, currentX));
      const cy = Math.max(0, cx);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(242,193,78,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(toX(cx), toY(0));
      ctx.lineTo(toX(cx), toY(cy));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(toX(cx), toY(cy), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f2c14e';
      ctx.fill();
    }
  }, [progress, width, height, currentX]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
      aria-label="ReLU hinge graph animation"
    />
  );
};
