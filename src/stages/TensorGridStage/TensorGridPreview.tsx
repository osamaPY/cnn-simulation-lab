import React, { useRef, useState, useEffect } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { tokens } from '../../styles/tokens';
import { motion } from 'framer-motion';

export const TensorGridPreview: React.FC = () => {
  const { preprocessedData } = useLabStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
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
      }
    }
  }, [preprocessedData]);

  // Handle tooltip on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !preprocessedData) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale mouse coordinates to [0..27] grid coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const col = Math.floor((x * scaleX) / 10);
    const row = Math.floor((y * scaleY) / 10);

    if (row >= 0 && row < 28 && col >= 0 && col < 28) {
      const val = preprocessedData[row * 28 + col];
      
      // Calculate tooltip position relative to client container
      const containerRect = containerRef.current?.getBoundingClientRect();
      const tooltipX = e.clientX - (containerRect?.left || 0);
      const tooltipY = e.clientY - (containerRect?.top || 0) - 40; // Hover slightly above pointer

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
  };

  const handleMouseLeave = () => {
    setTooltip(t => ({ ...t, show: false }));
  };

  if (!preprocessedData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[320px]">
        <span className="text-3xl mb-3">🔍</span>
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center w-full"
    >
      {/* Canvas container */}
      <div className="relative p-1 rounded-xl bg-gradient-to-br from-border-muted to-bg-card border border-border-muted shadow-lg shadow-black/50">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-lg cursor-crosshair block bg-black border border-border-subtle select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Hover Tooltip Overlay */}
        {tooltip.show && (
          <div
            className="absolute z-30 pointer-events-none bg-bg-card/95 border border-aurora-purple/40 px-2 py-1.5 rounded shadow-xl font-mono text-[10px] text-text-primary flex flex-col gap-0.5 backdrop-blur-md"
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
    </motion.div>
  );
};
