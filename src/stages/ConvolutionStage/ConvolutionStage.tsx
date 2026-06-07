import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { KernelFrame } from '../../animations/KernelFrame';
import { getAuroraColor } from '../../canvas/heatScale';
import {
  computeValidConv2D,
  REPRESENTATIVE_BIAS
} from '../../math/convolution';

const KERNEL_PRESETS = {
  vertical: {
    label: 'Vertical edge',
    values: [-1, 2, -1, -1, 2, -1, -1, 2, -1],
  },
  horizontal: {
    label: 'Horizontal edge',
    values: [-1, -1, -1, 2, 2, 2, -1, -1, -1],
  },
  sharpen: {
    label: 'Sharpen',
    values: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  },
} as const;

type KernelPreset = keyof typeof KERNEL_PRESETS;

export const ConvolutionStage: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnStepRef = useRef(-1);

  const [kernelPreset, setKernelPreset] = useState<KernelPreset>('vertical');
  const activeKernel = useMemo(() => Array.from(KERNEL_PRESETS[kernelPreset].values), [kernelPreset]);

  // Total valid positions: 26 * 26 = 676 steps
  const totalSteps = 676;
  const { stepIndex } = useTimeline(totalSteps, true);

  // Pre-calculate full output map
  const outputMap = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeValidConv2D(preprocessedData, activeKernel, REPRESENTATIVE_BIAS);
  }, [activeKernel, preprocessedData]);

  // Extract active patch coordinates
  const { row, col } = useMemo(() => {
    const r = Math.floor(stepIndex / 26);
    const c = stepIndex % 26;
    return { row: r, col: c };
  }, [stepIndex]);

  // Find min/max of outputs for heat scale normalization
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
        ctx.fillStyle = `rgb(${grayVal}, ${grayVal}, ${grayVal})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [preprocessedData]);

  useEffect(() => {
    const canvas = outputCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    lastDrawnStepRef.current = -1;
  }, [outputMap, outMin, outMax]);

  // Draw convolved output map
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

      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnStepRef.current = stepIndex;
  }, [stepIndex, outputMap, outMin, outMax]);

  if (!preprocessedData) return null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl px-4">
      {/* Kernel Selection Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full border-b border-white/10 pb-4">
        <div>
          <strong className="block text-sm text-white font-display">Kernel Filter Presets</strong>
          <p className="text-xs text-white/50">Change the edge detector to see the convolved feature map update.</p>
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

      {/* Main Side-by-Side Visuals */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full py-4">
        {/* Input Panel */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
            Input: 28x28 Tensor
          </span>
          <div className="relative aspect-square w-[280px] h-[280px] p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
            <canvas
              ref={inputCanvasRef}
              width={280}
              height={280}
              className="block h-full w-full rounded-xl bg-black border border-white/5 select-none"
            />
            {/* SVG KernelFrame moving on top of input canvas */}
            <KernelFrame stepIndex={stepIndex} />
          </div>
          <span className="text-[10px] font-mono text-white/40">
            Scanning: ({row + 1}, {col + 1})
          </span>
        </div>

        {/* Dynamic Transition Graphic */}
        <div className="flex flex-col items-center justify-center text-aurora-mint/40" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="text-[9px] font-mono mt-1 text-white/30 uppercase tracking-widest">Convolve</span>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
            Output: 26x26 Feature Map
          </span>
          <div className="relative aspect-square w-[260px] h-[260px] p-1.5 rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
            <canvas
              ref={outputCanvasRef}
              width={260}
              height={260}
              className="block h-full w-full rounded-xl bg-black border border-white/5 select-none"
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
