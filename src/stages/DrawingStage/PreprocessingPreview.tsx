import React, { useRef, useEffect, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { tokens } from '../../styles/tokens';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { quickTransition } from '../../animations/motion';

export const PreprocessingPreview: React.FC = () => {
  const originalCanvasThumbnail = useLabStore(state => state.originalCanvasThumbnail);
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const preprocessingDebug = useLabStore(state => state.preprocessingDebug);
  const tfMemoryDebug = useLabStore(state => state.tfMemoryDebug);
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

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
  }, [preprocessedData, replayKey]);

  if (!preprocessedData || !preprocessingDebug) {
    return null;
  }

  const { boundingBox, centerOfMass, shift, nonzeroPixelCount } = preprocessingDebug;

  return (
    <motion.div
      key={replayKey}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : quickTransition}
      className="w-full bg-bg-deep/50 border border-border-muted rounded-lg p-4 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-text-accent" />
          How the drawing is centered
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
                    className="absolute border border-dashed border-text-accent/80"
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
          <div className="w-16 h-16 bg-black border border-text-accent/40 rounded flex items-center justify-center overflow-hidden">
            <canvas 
              ref={miniCanvasRef} 
              width={64} 
              height={64} 
              className="w-full h-full block"
            />
          </div>
        </div>
      </div>
      <button className="btn-secondary self-center text-[10px]" onClick={() => setReplayKey((key) => key + 1)} type="button">
        Replay preprocessing
      </button>

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
      {import.meta.env.DEV && tfMemoryDebug && (
        <div className="text-[9px] font-mono text-text-muted flex justify-between border-t border-border-subtle pt-2 px-1">
          <span>Active Tensors: <strong className="text-text-secondary">{tfMemoryDebug.numTensors}</strong></span>
          <span>GPU Memory: <strong className="text-text-secondary">{(tfMemoryDebug.numBytes / 1024).toFixed(1)} KB</strong></span>
        </div>
      )}
    </motion.div>
  );
};
