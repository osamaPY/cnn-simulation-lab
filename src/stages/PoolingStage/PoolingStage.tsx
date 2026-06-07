import React, { useRef, useEffect, useMemo } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { getAuroraColor } from '../../canvas/heatScale';
import { computeMaxPool2D } from '../../math/pooling';

export const PoolingStage: React.FC = () => {
  const activations = useLabStore(state => state.activations);
  const selectedChannel = useLabStore(state => state.selectedChannel);
  const hyperparams = useLabStore(state => state.hyperparams);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnStepRef = useRef(-1);

  const poolSize = hyperparams.poolingSize;

  // Extract a real model activation map.
  const inputMap = useMemo(() => {
    const convRecord = activations.find(r => r.layerType === 'Conv2D');
    if (convRecord) {
      const numChannels = convRecord.shape[3];
      const dim = convRecord.shape[1];
      const data = new Float32Array(dim * dim);
      const activeCh = selectedChannel % numChannels;
      for (let i = 0; i < dim * dim; i++) {
        data[i] = convRecord.values[i * numChannels + activeCh];
      }
      return data;
    }
    return new Float32Array(26 * 26);
  }, [activations, selectedChannel]);

  const inputDim = Math.sqrt(inputMap.length);
  const outputDim = Math.floor(inputDim / poolSize);
  const totalSteps = outputDim * outputDim;
  const { stepIndex } = useTimeline(totalSteps, true);

  const outputMap = useMemo(() => {
    return computeMaxPool2D(inputMap, inputDim, poolSize);
  }, [inputMap, inputDim, poolSize]);

  const { inMin, inMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let v of inputMap) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return min === max ? { inMin: 0, inMax: 1 } : { inMin: min, inMax: max };
  }, [inputMap]);

  const { outMin, outMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let v of outputMap) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return min === max ? { outMin: 0, outMax: 1 } : { outMin: min, outMax: max };
  }, [outputMap]);

  const row = Math.floor(stepIndex / outputDim);
  const col = stepIndex % outputDim;

  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 260 / inputDim;
    for (let r = 0; r < inputDim; r++) {
      for (let c = 0; c < inputDim; c++) {
        const val = inputMap[r * inputDim + c];
        const norm = (val - inMin) / (inMax - inMin || 1);
        const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
        ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [inputMap, inMin, inMax, inputDim]);

  useEffect(() => {
    const canvas = outputCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastDrawnStepRef.current = -1;
  }, [outputMap, outMin, outMax]);

  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cellSize = 260 / outputDim;
    let start = lastDrawnStepRef.current + 1;
    if (stepIndex < lastDrawnStepRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      start = 0;
    }
    for (let i = start; i <= stepIndex; i++) {
      const r = Math.floor(i / outputDim);
      const c = i % outputDim;
      const val = outputMap[i];
      const norm = (val - outMin) / (outMax - outMin || 1);
      const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnStepRef.current = stepIndex;
  }, [stepIndex, outputMap, outMin, outMax, outputDim]);

  const frameCellSize = 260 / inputDim;
  const frameX = col * poolSize * frameCellSize;
  const frameY = row * poolSize * frameCellSize;
  const frameWidth = poolSize * frameCellSize;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl px-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full py-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Input Map: {inputDim}x{inputDim}</span>
          <div className="relative p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
            <canvas ref={inputCanvasRef} width={260} height={260} className="rounded-xl bg-black block border border-white/5 select-none" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 260 260">
              <rect x={frameX} y={frameY} width={frameWidth} height={frameWidth} rx="1" fill="rgba(147, 51, 234, 0.15)" stroke="var(--aurora-purple)" strokeWidth="2.5" className="transition-all duration-150 ease-out" />
            </svg>
            <div className="absolute pointer-events-none z-30 bg-[#0c141a]/95 border border-white/15 rounded-lg px-2 py-1 font-mono text-[9px] text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-1.5 transition-all duration-150 ease-out" style={{ left: `${frameX + frameWidth / 2}px`, top: `${frameY}px`, transform: 'translate(-50%, -120%)' }}>
              <span className="text-aurora-purple font-semibold">max({poolSize}x{poolSize})</span>
              <span className="text-white/30">=</span>
              <span className="text-aurora-mint font-semibold">{outputMap[stepIndex]?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-white/40">Window: ({row * poolSize}, {col * poolSize})</span>
        </div>

        <div className="flex flex-col items-center justify-center text-aurora-purple/40" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><polyline points="9 18 15 12 9 6" /></svg>
          <span className="text-[9px] font-mono mt-1 text-white/30 uppercase tracking-widest">Max Pool</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Output Map: {outputDim}x{outputDim}</span>
          <div className="relative p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
            <canvas ref={outputCanvasRef} width={260} height={260} className="rounded-xl bg-black block border border-white/5 select-none" />
          </div>
          <span className="text-[10px] font-mono text-white/40">Progress: {Math.round((stepIndex / totalSteps) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
