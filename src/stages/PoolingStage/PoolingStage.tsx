import React, { useRef, useEffect, useMemo } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { getAuroraColor } from '../../canvas/heatScale';
import {
  computeMaxPool2D
} from '../../math/pooling';

export const PoolingStage: React.FC = () => {
  const activations = useLabStore(state => state.activations);
  const selectedChannel = useLabStore(state => state.selectedChannel);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnStepRef = useRef(-1);

  // Output is 13x13 = 169 positions
  const totalSteps = 169;
  const { stepIndex } = useTimeline(totalSteps, true);

  // Extract a real 26x26 model activation map.
  const input26 = useMemo(() => {
    const convRecord = activations.find(
      r => r.layerType === 'Conv2D' && r.shape.length === 4 && r.shape[1] === 26
    );

    if (convRecord) {
      const numChannels = convRecord.shape[3];
      const data = new Float32Array(26 * 26);
      const activeCh = selectedChannel % numChannels;
      for (let i = 0; i < 26 * 26; i++) {
        data[i] = convRecord.values[i * numChannels + activeCh];
      }
      return data;
    }

    return new Float32Array(26 * 26);
  }, [activations, selectedChannel]);

  // Find min/max of input for visual scaling
  const { inMin, inMax } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < input26.length; i++) {
      const v = input26[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) {
      min = 0;
      max = 1;
    }
    return { inMin: min, inMax: max };
  }, [input26]);

  // Pre-calculate the pooled 13x13 output map
  const outputMap = useMemo(() => {
    return computeMaxPool2D(input26);
  }, [input26]);

  // Find min/max of output
  const { outMin, outMax } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < outputMap.length; i++) {
      const v = outputMap[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) {
      min = 0;
      max = 1;
    }
    return { outMin: min, outMax: max };
  }, [outputMap]);

  // Extract active window at current stepIndex
  const { row, col } = useMemo(() => {
    const r = Math.floor(stepIndex / 13);
    const c = stepIndex % 13;
    return { row: r, col: c };
  }, [stepIndex]);

  // Render 26x26 Input Canvas
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 10; // 260px input canvas

    for (let r = 0; r < 26; r++) {
      for (let c = 0; c < 26; c++) {
        const val = input26[r * 26 + c];
        const norm = (val - inMin) / (inMax - inMin || 1);
        const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
        
        ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [input26, inMin, inMax]);

  useEffect(() => {
    const canvas = outputCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    lastDrawnStepRef.current = -1;
  }, [outputMap, outMin, outMax]);

  // Draw pooled output map
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 20; // 13 * 20 = 260px output canvas
    let start = lastDrawnStepRef.current + 1;

    if (stepIndex < lastDrawnStepRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      start = 0;
    }

    for (let i = start; i <= stepIndex; i++) {
      const r = Math.floor(i / 13);
      const c = i % 13;
      const val = outputMap[i];

      const norm = (val - outMin) / (outMax - outMin || 1);
      const { r: cr, g: cg, b: cb } = getAuroraColor(norm);

      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnStepRef.current = stepIndex;
  }, [stepIndex, outputMap, outMin, outMax]);

  const frameX = col * 2 * 10;
  const frameY = row * 2 * 10;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl px-4">
      {/* Side-by-Side Grids */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full py-4">
        {/* Input Map */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
            Input Map: 26x26
          </span>
          <div className="relative p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
            <canvas
              ref={inputCanvasRef}
              width={260}
              height={260}
              className="rounded-xl bg-black block border border-white/5 select-none"
            />
            {/* Sliding 2x2 pooling frame */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 260 260"
            >
              <rect
                x={frameX}
                y={frameY}
                width={20}
                height={20}
                rx="1"
                fill="rgba(147, 51, 234, 0.15)"
                stroke="var(--aurora-purple)"
                strokeWidth="2.5"
                className="transition-all duration-150 ease-out"
              />
            </svg>
            {/* Floating Max Pool Math Bubble */}
            <div 
              className="absolute pointer-events-none z-30 bg-[#0c141a]/95 border border-white/15 rounded-lg px-2 py-1 font-mono text-[9px] text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-1.5 transition-all duration-150 ease-out"
              style={{ 
                left: `${col * 20 + 6 + 10}px`, 
                top: `${row * 20 + 6}px`,
                transform: 'translate(-50%, -120%)' 
              }}
            >
              <span className="text-aurora-purple font-semibold">max(2x2)</span>
              <span className="text-white/30">=</span>
              <span className="text-aurora-mint font-semibold">{outputMap[stepIndex].toFixed(2)}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            Window: ({row * 2}, {col * 2})
          </span>
        </div>

        {/* Transition Arrow */}
        <div className="flex flex-col items-center justify-center text-aurora-purple/40" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-[9px] font-mono mt-1 text-white/30 uppercase tracking-widest">Max Pool</span>
        </div>

        {/* Output Map */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
            Output Map: 13x13 (Pooled)
          </span>
          <div className="relative p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
            <canvas
              ref={outputCanvasRef}
              width={260}
              height={260}
              className="rounded-xl bg-black block border border-white/5 select-none"
            />
          </div>
          <span className="text-[10px] font-mono text-white/40">
            Progress: {Math.round((stepIndex / totalSteps) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
