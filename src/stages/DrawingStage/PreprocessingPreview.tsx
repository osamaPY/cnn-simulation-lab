import React, { useRef, useEffect } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { tokens } from '../../styles/tokens';
import { motion } from 'framer-motion';

export const PreprocessingPreview: React.FC = () => {
  const { originalCanvasThumbnail, preprocessedData, preprocessingDebug, tfMemoryDebug } = useLabStore();
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draw a scaled representation of the preprocessed 28x28 grid
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas || !preprocessedData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cellSize = size / 28;
    ctx.clearRect(0, 0, size, size);

    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        const val = preprocessedData[r * 28 + c];
        const heatScale = tokens.colors.heatScale;
        const colorIdx = Math.min(heatScale.length - 1, Math.floor(val * heatScale.length));
        ctx.fillStyle = heatScale[colorIdx];
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [preprocessedData]);

  if (!preprocessedData || !preprocessingDebug) {
    return null;
  }

  const { boundingBox, centerOfMass, shift, nonzeroPixelCount } = preprocessingDebug;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-bg-deep/50 border border-border-muted rounded-xl p-4 flex flex-col gap-4 shadow-inner"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <h4 className="text-xs font-display font-bold uppercase tracking-wider text-text-accent flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-purple animate-pulse" />
          MNIST Preprocessing Telemetry
        </h4>
        <span className="text-[9px] font-mono text-text-muted">
          Active Pixels: {nonzeroPixelCount}
        </span>
      </div>

      {/* Visual transformation steps comparison */}
      <div className="grid grid-cols-3 gap-3 items-center justify-items-center">
        {/* Step 1: Raw thumbnail */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-text-muted uppercase">1. Raw Ink</span>
          <div className="w-16 h-16 bg-black border border-border-subtle rounded flex items-center justify-center overflow-hidden">
            {originalCanvasThumbnail ? (
              <img 
                src={originalCanvasThumbnail} 
                alt="Original thumbnail" 
                className="w-full h-full object-contain filter invert opacity-90"
              />
            ) : (
              <span className="text-text-muted text-[10px]">-</span>
            )}
          </div>
        </div>

        {/* Step 2: Bounding Box Overlay */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-text-muted uppercase">2. Bounding Box</span>
          <div className="w-16 h-16 bg-black border border-border-subtle rounded flex items-center justify-center relative overflow-hidden">
            {originalCanvasThumbnail && (
              <>
                <img 
                  src={originalCanvasThumbnail} 
                  alt="Original BB" 
                  className="w-full h-full object-contain filter invert opacity-50"
                />
                {boundingBox && (
                  <div 
                    className="absolute border border-dashed border-aurora-purple/80 shadow-[0_0_4px_rgba(139,92,246,0.3)]"
                    style={{
                      left: `${(boundingBox.minX / 280) * 100}%`,
                      top: `${(boundingBox.minY / 280) * 100}%`,
                      width: `${((boundingBox.maxX - boundingBox.minX) / 280) * 100}%`,
                      height: `${((boundingBox.maxY - boundingBox.minY) / 280) * 100}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Step 3: Shifted Center of Mass */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] font-mono text-text-muted uppercase">3. Centered (28x28)</span>
          <div className="w-16 h-16 bg-black border border-aurora-mint/30 rounded flex items-center justify-center overflow-hidden shadow-inner">
            <canvas 
              ref={miniCanvasRef} 
              width={64} 
              height={64} 
              className="w-full h-full block"
            />
          </div>
        </div>
      </div>

      {/* Numeric Metadata logs */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-bg-deep/80 border border-border-subtle p-3 rounded-lg text-text-secondary">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-display font-semibold text-text-muted uppercase leading-none">
            Bounding Box
          </span>
          {boundingBox ? (
            <div className="flex flex-col text-text-primary mt-1">
              <span>X: [{boundingBox.minX}, {boundingBox.maxX}] (W: {boundingBox.maxX - boundingBox.minX + 1}px)</span>
              <span>Y: [{boundingBox.minY}, {boundingBox.maxY}] (H: {boundingBox.maxY - boundingBox.minY + 1}px)</span>
            </div>
          ) : (
            <span className="text-text-muted mt-1">Empty canvas</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-display font-semibold text-text-muted uppercase leading-none">
            Center of Mass Shift
          </span>
          <div className="flex flex-col text-text-primary mt-1">
            <span>Centroid: ({centerOfMass?.x.toFixed(1)}, {centerOfMass?.y.toFixed(1)})</span>
            <span className="text-aurora-mint">Shift: Δ({shift?.dx.toFixed(1)}, {shift?.dy.toFixed(1)})</span>
          </div>
        </div>
      </div>
      {/* Dev Memory telemetry */}
      {tfMemoryDebug && (
        <div className="text-[9px] font-mono text-text-muted flex justify-between border-t border-border-subtle pt-2 px-1">
          <span>Active Tensors: <strong className="text-text-secondary">{tfMemoryDebug.numTensors}</strong></span>
          <span>GPU Memory: <strong className="text-text-secondary">{(tfMemoryDebug.numBytes / 1024).toFixed(1)} KB</strong></span>
        </div>
      )}
    </motion.div>
  );
};
