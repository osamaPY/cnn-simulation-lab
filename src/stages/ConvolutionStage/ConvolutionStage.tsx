import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { KernelFrame } from '../../animations/KernelFrame';
import { getAuroraColor } from '../../canvas/heatScale';
import { KernelZoomPanel } from './KernelZoomPanel';
import {
  computeConv2D,
  REPRESENTATIVE_BIAS
} from '../../math/convolution';
import { remap } from '../../animations/mathUtils';

const KERNEL_PRESETS = {
  vertical:   { label: 'Vertical edge',   values: [-1, 2, -1, -1, 2, -1, -1, 2, -1] },
  horizontal: { label: 'Horizontal edge', values: [-1, -1, -1, 2, 2, 2, -1, -1, -1] },
  sharpen:    { label: 'Sharpen',         values: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
} as const;

type KernelPreset = keyof typeof KERNEL_PRESETS;

export const ConvolutionStage: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const hyperparams = useLabStore(state => state.hyperparams);
  const inputCanvasRef  = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnStepRef = useRef(-1);

  const [kernelPreset, setKernelPreset] = useState<KernelPreset>('vertical');
  
  const activeKernel = useMemo(() => {
    const base = KERNEL_PRESETS[kernelPreset].values;
    // Adapt kernel to size
    const size = hyperparams.kernelSize;
    const values = new Float32Array(size * size).fill(0.1);
    // Copy base into center if possible, or just repeat
    for (let i = 0; i < Math.min(base.length, values.length); i++) {
      values[i] = base[i];
    }
    return values;
  }, [kernelPreset, hyperparams.kernelSize]);

  const outputDim = Math.floor((28 + 2 * hyperparams.padding - hyperparams.kernelSize) / hyperparams.stride) + 1;
  const totalSteps = outputDim * outputDim;
  const { stepIndex } = useTimeline(totalSteps, true);

  const outputMap = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeConv2D(
      preprocessedData, 
      28, 
      activeKernel, 
      hyperparams.kernelSize, 
      hyperparams.stride, 
      hyperparams.padding, 
      REPRESENTATIVE_BIAS
    );
  }, [activeKernel, preprocessedData, hyperparams, totalSteps]);

  const { row, col } = useMemo(() => ({
    row: Math.floor(stepIndex / outputDim),
    col: stepIndex % outputDim,
  }), [stepIndex, outputDim]);

  const { outMin, outMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < outputMap.length; i++) {
      if (outputMap[i] < min) min = outputMap[i];
      if (outputMap[i] > max) max = outputMap[i];
    }
    if (min === max) { min = 0; max = 1; }
    return { outMin: min, outMax: max };
  }, [outputMap]);

  const zoomProgress = remap(stepIndex % outputDim, 0, outputDim - 1, 0, 1);

  // Render Input Canvas
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas || !preprocessedData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 10;
    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        const val = preprocessedData[r * 28 + c];
        const grayVal = Math.round(val * 255);
        ctx.fillStyle = `rgb(${grayVal},${grayVal},${grayVal})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [preprocessedData]);

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
    const cellSize = 10;
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
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnStepRef.current = stepIndex;
  }, [stepIndex, outputMap, outMin, outMax, outputDim]);

  if (!preprocessedData) return null;

  // Clamp bubble position so it never overflows the 280×280 canvas
  const CANVAS_PX = 280;
  const CELL = 10;
  const BUBBLE_W = 110;
  const BUBBLE_H = 28;
  const frameWidth = hyperparams.kernelSize * CELL;
  const x = col * hyperparams.stride * CELL;
  const y = row * hyperparams.stride * CELL;
  const rawLeft = x + frameWidth / 2;
  const rawTop  = y;
  const bubbleLeft = Math.min(Math.max(rawLeft - BUBBLE_W / 2, 2), CANVAS_PX - BUBBLE_W - 2);
  const bubbleTop  = rawTop < BUBBLE_H + 8 ? rawTop + frameWidth + 4 : rawTop - BUBBLE_H - 4;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-5xl px-4 py-2">
      {/* Kernel Selection */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full border-b border-white/5 pb-2">
        <div className="flex gap-1.5 p-1 bg-black/20 rounded-lg">
          {(Object.keys(KERNEL_PRESETS) as KernelPreset[]).map((preset) => (
            <button
              key={preset}
              className={`px-4 py-2 rounded-md text-[10px] font-mono tracking-widest uppercase transition-all ${
                kernelPreset === preset
                  ? 'bg-[#1c1c1c] text-[#F5CD47] shadow-lg border border-white/5'
                  : 'text-white/30 hover:text-white/60'
              }`}
              onClick={() => setKernelPreset(preset)}
              type="button"
            >
              {KERNEL_PRESETS[preset].label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full py-2">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Input canvas */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Input Plane</span>
            <div className="relative p-1 border border-white/5 bg-[#161616] shadow-2xl">
              <canvas ref={inputCanvasRef} width={280} height={280}
                className="block h-[280px] w-[280px] bg-black"
              />
              <KernelFrame stepIndex={stepIndex} />
              {/* Math bubble */}
              <div
                className="absolute pointer-events-none z-30 bg-[#1c1c1c] border border-white/10 rounded-sm px-3 py-1.5 font-serif italic text-[11px] text-[#F5CD47] shadow-2xl flex items-center gap-2"
                style={{
                  left: `${bubbleLeft}px`,
                  top:  `${bubbleTop}px`,
                }}
              >
                <span className="opacity-60 text-white">Σ(x·w) =</span>
                <span className="font-bold">{outputMap[stepIndex]?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-[#F5CD47]/30" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[8px] font-mono mt-2 text-white/20 uppercase tracking-[0.4em]">Convolve</span>
          </div>

          {/* Output canvas */}
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Output Plane</span>
            <div className="relative p-1 border border-white/5 bg-[#161616] shadow-2xl">
              <canvas ref={outputCanvasRef} width={outputDim * 10} height={outputDim * 10}
                className="block h-[260px] w-[260px] bg-black"
              />
            </div>
          </div>
        </div>

        {/* 3b1b zoom panel */}
        <div className="lg:pl-4 lg:border-l lg:border-white/5">
          <KernelZoomPanel
            row={row}
            col={col}
            inputData={preprocessedData}
            kernel={activeKernel}
            outputValue={outputMap[stepIndex]}
            progress={zoomProgress}
          />
        </div>
      </div>
    </div>
  );
};
