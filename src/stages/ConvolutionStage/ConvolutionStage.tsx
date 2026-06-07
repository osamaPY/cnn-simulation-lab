import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { KernelFrame } from '../../animations/KernelFrame';
import { getAuroraColor } from '../../canvas/heatScale';
import { KernelZoomPanel } from './KernelZoomPanel';
import {
  computeValidConv2D,
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
  const inputCanvasRef  = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnStepRef = useRef(-1);

  const [kernelPreset, setKernelPreset] = useState<KernelPreset>('vertical');
  const activeKernel = useMemo(() => Array.from(KERNEL_PRESETS[kernelPreset].values), [kernelPreset]);

  const totalSteps = 676;
  const { stepIndex } = useTimeline(totalSteps, true);

  const outputMap = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeValidConv2D(preprocessedData, activeKernel, REPRESENTATIVE_BIAS);
  }, [activeKernel, preprocessedData]);

  const { row, col } = useMemo(() => ({
    row: Math.floor(stepIndex / 26),
    col: stepIndex % 26,
  }), [stepIndex]);

  const { outMin, outMax } = useMemo(() => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < outputMap.length; i++) {
      if (outputMap[i] < min) min = outputMap[i];
      if (outputMap[i] > max) max = outputMap[i];
    }
    if (min === max) { min = 0; max = 1; }
    return { outMin: min, outMax: max };
  }, [outputMap]);

  // Zoom panel progress: driven by stepIndex cycling
  const zoomProgress = remap(stepIndex % 26, 0, 25, 0, 1);

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
      const r = Math.floor(i / 26);
      const c = i % 26;
      const val = outputMap[i];
      const norm = (val - outMin) / (outMax - outMin || 1);
      const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnStepRef.current = stepIndex;
  }, [stepIndex, outputMap, outMin, outMax]);

  if (!preprocessedData) return null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl px-4">
      {/* Kernel Selection */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-b border-white/10 pb-4">
        <div>
          <strong className="block text-sm text-white font-display">Kernel Filter Presets</strong>
          <p className="text-xs text-white/50">Change the filter to see how different kernels extract different features.</p>
        </div>
        <div className="flex gap-2">
          {(Object.keys(KERNEL_PRESETS) as KernelPreset[]).map((preset) => (
            <button
              key={preset}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                kernelPreset === preset
                  ? 'border-aurora-mint text-aurora-mint bg-aurora-teal/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5'
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
      <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full py-2">

        {/* Input + Output canvases */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Input */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Input: 28×28</span>
            <div className="relative w-[280px] h-[280px] p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
              <canvas ref={inputCanvasRef} width={280} height={280}
                className="block h-full w-full rounded-xl bg-black border border-white/5"
              />
              <KernelFrame stepIndex={stepIndex} />
              {/* Floating math bubble */}
              <div
                className="absolute pointer-events-none z-30 bg-[#0c141a]/95 border border-white/15 rounded-lg px-2 py-1 font-mono text-[9px] text-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex items-center gap-1.5 transition-all duration-150 ease-out"
                style={{
                  left: `${col * 10 + 6 + 15}px`,
                  top: `${row * 10 + 6}px`,
                  transform: 'translate(-50%, -120%)'
                }}
              >
                <span className="text-aurora-mint">Σ(x·w)+b</span>
                <span className="text-white/30">=</span>
                <span className="text-text-accent font-semibold">{outputMap[stepIndex].toFixed(2)}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-white/40">Scanning: ({row + 1}, {col + 1})</span>
          </div>

          <div className="flex flex-col items-center justify-center text-aurora-mint/40" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-[9px] font-mono mt-1 text-white/30 uppercase tracking-widest">Convolve</span>
          </div>

          {/* Output */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Output: 26×26</span>
            <div className="relative w-[260px] h-[260px] p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
              <canvas ref={outputCanvasRef} width={260} height={260}
                className="block h-full w-full rounded-xl bg-black border border-white/5"
              />
            </div>
            <span className="text-[10px] font-mono text-white/40">Progress: {Math.round((stepIndex / totalSteps) * 100)}%</span>
          </div>
        </div>

        {/* 3b1b zoom panel */}
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
  );
};
