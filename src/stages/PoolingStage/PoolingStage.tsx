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
    for (const v of inputMap) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return min === max ? { inMin: 0, inMax: 1 } : { inMin: min, inMax: max };
  }, [inputMap]);

  const { outMin, outMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (const v of outputMap) {
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
    <div className="flex flex-col items-center gap-10 w-full max-w-4xl px-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 w-full py-4">
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Input Plane: {inputDim}×{inputDim}</span>
          <div className="relative p-1 border border-white/5 bg-[#161616] shadow-2xl">
            <canvas ref={inputCanvasRef} width={260} height={260} className="rounded-sm bg-black block" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 260 260">
              <rect x={frameX} y={frameY} width={frameWidth} height={frameWidth} rx="0" fill="rgba(88, 196, 221, 0.08)" stroke="#58C4DD" strokeWidth="2" className="transition-all duration-150 ease-out" />
            </svg>
            <div className="absolute pointer-events-none z-30 bg-[#1c1c1c] border border-white/10 rounded-sm px-2 py-1 font-serif italic text-[10px] text-[#58C4DD] shadow-2xl flex items-center gap-2 transition-all duration-150 ease-out" style={{ left: `${frameX + frameWidth / 2}px`, top: `${frameY}px`, transform: 'translate(-50%, -120%)' }}>
              <span className="text-white opacity-60">max({poolSize}×{poolSize}) =</span>
              <span className="font-bold">{outputMap[stepIndex]?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-[#58C4DD]/30" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[8px] font-mono mt-2 text-white/20 uppercase tracking-[0.4em]">Downsample</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Reduced Plane: {outputDim}×{outputDim}</span>
          <div className="relative p-1 border border-white/5 bg-[#161616] shadow-2xl">
            <canvas ref={outputCanvasRef} width={260} height={260} className="rounded-sm bg-black block" />
          </div>
        </div>
      </div>
    </div>
  );
};
