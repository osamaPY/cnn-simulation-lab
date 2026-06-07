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

  const chalkboardStyle = {
    backgroundColor: '#0c141a',
    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
    backgroundSize: '12px 12px'
  };

  return (
    <motion.div
      key={replayKey}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : quickTransition}
      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-5 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-aurora-mint shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Pre-activation Centering</span>
        </div>
        <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          Active Pixels: {nonzeroPixelCount}
        </span>
      </div>

      {/* Visual transformation steps comparison */}
      <div className="grid grid-cols-3 gap-4 justify-items-center py-2">
        {/* Step 1: Raw thumbnail */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">1. Raw Ink</span>
          <div 
            style={chalkboardStyle} 
            className="w-24 h-24 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative shadow-md"
          >
            {originalCanvasThumbnail ? (
              <img 
                src={originalCanvasThumbnail} 
                alt="Original thumbnail" 
                className="w-full h-full object-contain filter invert opacity-90 scale-95"
              />
            ) : (
              <span className="text-white/20 text-xs">-</span>
            )}
            <div className="absolute inset-1 border border-white/5 rounded-lg pointer-events-none" />
          </div>
        </div>

        {/* Step 2: Bounding Box Overlay */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">2. Bounding Box</span>
          <div 
            style={chalkboardStyle} 
            className="w-24 h-24 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md"
          >
            {originalCanvasThumbnail && (
              <>
                <img 
                  src={originalCanvasThumbnail} 
                  alt="Original BB" 
                  className="w-full h-full object-contain filter invert opacity-40 scale-95"
                />
                {boundingBox && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="absolute border border-dashed border-text-accent shadow-[0_0_8px_rgba(234,179,8,0.3)]"
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
            <div className="absolute inset-1 border border-white/5 rounded-lg pointer-events-none" />
          </div>
        </div>

        {/* Step 3: Shifted Center of Mass */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">3. Centered (28x28)</span>
          <div 
            style={chalkboardStyle} 
            className="w-24 h-24 border border-aurora-teal/30 rounded-xl flex items-center justify-center overflow-hidden relative shadow-md"
          >
            <canvas 
              ref={miniCanvasRef} 
              width={80} 
              height={80} 
              className="w-full h-full block"
            />
            {/* Centroid Crosshair Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-aurora-mint shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <div className="w-8 h-px bg-aurora-mint/20 absolute" />
              <div className="h-8 w-px bg-aurora-mint/20 absolute" />
            </div>
            <div className="absolute inset-1 border border-aurora-teal/10 rounded-lg pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Equations and details block styled like blackboard card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono bg-[#0c141a] border border-white/5 p-4 rounded-xl text-white/70 shadow-inner">
        {/* Left math */}
        <div className="flex flex-col gap-1.5 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-3">
          <span className="text-[9px] font-semibold text-text-accent uppercase tracking-wider leading-none">
            Bounding Coordinates
          </span>
          {boundingBox ? (
            <div className="flex flex-col gap-1 text-white/80 mt-1">
              <div className="flex justify-between">
                <span>width:</span>
                <span className="text-white font-semibold">{boundingBox.maxX - boundingBox.minX + 1}px</span>
              </div>
              <div className="flex justify-between">
                <span>height:</span>
                <span className="text-white font-semibold">{boundingBox.maxY - boundingBox.minY + 1}px</span>
              </div>
              <div className="flex justify-between text-[10px] text-white/50 border-t border-white/5 pt-1 mt-0.5">
                <span>bounds:</span>
                <span>X[{boundingBox.minX}, {boundingBox.maxX}] Y[{boundingBox.minY}, {boundingBox.maxY}]</span>
              </div>
            </div>
          ) : (
            <span className="text-white/30 mt-1">Empty bounding box</span>
          )}
        </div>

        {/* Right math */}
        <div className="flex flex-col gap-1.5 sm:pl-3">
          <span className="text-[9px] font-semibold text-aurora-mint uppercase tracking-wider leading-none">
            Center of Mass Shift
          </span>
          <div className="flex flex-col gap-1 text-white/80 mt-1">
            <div className="flex justify-between">
              <span>centroid (COM):</span>
              <span className="text-white font-semibold">({centerOfMass?.x.toFixed(1)}, {centerOfMass?.y.toFixed(1)})</span>
            </div>
            <div className="flex justify-between text-aurora-mint font-semibold">
              <span>shift vector Δ:</span>
              <span className="shadow-[0_0_8px_rgba(16,185,129,0.15)] bg-aurora-teal/15 px-1.5 py-0.5 rounded">
                ({shift?.dx.toFixed(1)}, {shift?.dy.toFixed(1)})
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-white/50 border-t border-white/5 pt-1 mt-0.5">
              <span>centering target:</span>
              <span>(14.0, 14.0)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button 
          className="btn-secondary text-[10px] py-1 px-3 border border-white/10 hover:bg-white/5 transition-all text-white/80" 
          onClick={() => setReplayKey((key) => key + 1)} 
          type="button"
        >
          Replay Centering Animation
        </button>

        {import.meta.env.DEV && tfMemoryDebug && (
          <div className="text-[9px] font-mono text-white/40 flex gap-4">
            <span>Tensors: <strong className="text-white/70">{tfMemoryDebug.numTensors}</strong></span>
            <span>GPU Memory: <strong className="text-white/70">{(tfMemoryDebug.numBytes / 1024).toFixed(1)} KB</strong></span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
