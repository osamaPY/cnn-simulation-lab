import React, { useRef, useState, useEffect } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { tokens } from '../../styles/tokens';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { sceneTransition } from '../../animations/motion';

export const TensorGridPreview: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const currentStageId = useLabStore(state => state.currentStageId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoverFrameRef = useRef<number | null>(null);
  const pendingHoverRef = useRef<React.MouseEvent<HTMLCanvasElement> | null>(null);
  const [showValues, setShowValues] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Tooltip tracking state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    row: number;
    col: number;
    val: number;
    show: boolean;
  }>({ x: 0, y: 0, row: 0, col: 0, val: 0, show: false });

  // Draw 28x28 pixel grid on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !preprocessedData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 10; // 28 * 10 = 280px canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        const val = preprocessedData[r * 28 + c];
        
        // Map value to heatScale colors (0.0 to 1.0)
        const heatScale = tokens.colors.heatScale;
        const colorIdx = Math.min(heatScale.length - 1, Math.floor(val * heatScale.length));
        ctx.fillStyle = heatScale[colorIdx];
        
        // Draw the pixel square
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);

        // Draw very subtle grid lines for non-black pixels
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);

        if (showValues && val >= 0.1) {
          ctx.fillStyle = val > 0.55 ? '#071018' : '#f1f5ef';
          ctx.font = '7px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val.toFixed(1).replace('0.', '.'), c * cellSize + 5, r * cellSize + 5);
        }
      }
    }
  }, [preprocessedData, showValues]);

  // Handle tooltip on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    pendingHoverRef.current = e;
    if (hoverFrameRef.current !== null) return;

    hoverFrameRef.current = requestAnimationFrame(() => {
      hoverFrameRef.current = null;
      const pendingEvent = pendingHoverRef.current;
      if (!pendingEvent) return;

    const canvas = canvasRef.current;
    if (!canvas || !preprocessedData) return;

    const rect = canvas.getBoundingClientRect();
      const x = pendingEvent.clientX - rect.left;
      const y = pendingEvent.clientY - rect.top;

    // Scale mouse coordinates to [0..27] grid coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((x * scaleX) / 10);
    const row = Math.floor((y * scaleY) / 10);

    if (row >= 0 && row < 28 && col >= 0 && col < 28) {
      const val = preprocessedData[row * 28 + col];
      
      // Calculate tooltip position relative to client container
      const containerRect = containerRef.current?.getBoundingClientRect();
        const tooltipX = pendingEvent.clientX - (containerRect?.left || 0);
        const tooltipY = pendingEvent.clientY - (containerRect?.top || 0) - 40;

      setTooltip({
        x: tooltipX,
        y: tooltipY,
        row,
        col,
        val,
        show: true
      });
    } else {
      setTooltip(t => ({ ...t, show: false }));
    }
    });
  };

  const handleMouseLeave = () => {
    pendingHoverRef.current = null;
    if (hoverFrameRef.current !== null) {
      cancelAnimationFrame(hoverFrameRef.current);
      hoverFrameRef.current = null;
    }
    setTooltip(t => ({ ...t, show: false }));
  };

  if (!preprocessedData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[320px]">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          No Preprocessed Tensor
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[200px]">
          Draw a digit and click 'Run Simulation' to inspect the grid.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      ref={containerRef}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
      className="relative flex flex-col items-center w-full"
    >
      {/* Canvas container */}
      <div className="relative p-1 rounded border border-border-muted bg-bg-canvas">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-lg cursor-crosshair block bg-black border border-border-subtle select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleMouseMove}
        />

        {/* Hover Tooltip Overlay */}
        {tooltip.show && (
          <div
            className="absolute z-30 pointer-events-none bg-bg-card border border-text-accent/40 px-2 py-1.5 rounded font-mono text-[10px] text-text-primary flex flex-col gap-0.5"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="flex justify-between gap-3 border-b border-white/5 pb-0.5 mb-0.5">
              <span className="text-text-accent font-semibold">Coord:</span>
              <span>[{tooltip.row}, {tooltip.col}]</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-aurora-mint font-semibold">Value:</span>
              <span>{tooltip.val.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid footer metrics */}
      <div className="w-full max-w-[288px] flex items-center justify-between mt-3 px-1">
        <span className="text-[10px] font-mono text-text-muted uppercase">
          Grid: 28x28 Pixels
        </span>
        <span className="text-[10px] font-mono py-0.5 px-1.5 rounded bg-aurora-teal/15 text-aurora-mint border border-aurora-mint/20 uppercase">
          Tensor: [1, 28, 28, 1]
        </span>
      </div>
      {currentStageId === 2 && (
        <button className="btn-secondary mt-3 text-[10px]" onClick={() => setShowValues((value) => !value)} type="button">
          {showValues ? 'Show intensity heatmap' : 'Show numeric values'}
        </button>
      )}
      {currentStageId === 3 && (
        <p className="mt-3 text-center text-[10px] text-text-muted">Hover or tap a cell to inspect its coordinate and exact value.</p>
      )}
    </motion.div>
  );
};
