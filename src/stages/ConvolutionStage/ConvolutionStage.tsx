import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
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
  vertical:   { label: 'Vertical Edge',   values: [-1, 2, -1, -1, 2, -1, -1, 2, -1] },
  horizontal: { label: 'Horizontal Edge', values: [-1, -1, -1, 2, 2, 2, -1, -1, -1] },
  sharpen:    { label: 'Sharpen',         values: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
} as const;

type KernelPreset = keyof typeof KERNEL_PRESETS;

export const ConvolutionStage: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const hyperparams = useLabStore(state => state.hyperparams);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const verticalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const horizontalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sharpenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const lastDrawnVertical = useRef(-1);
  const lastDrawnHorizontal = useRef(-1);
  const lastDrawnSharpen = useRef(-1);

  const [focusedPreset, setFocusedPreset] = useState<KernelPreset>('vertical');

  // Generate Kernels for each preset
  const verticalKernel = useMemo(() => {
    const base = KERNEL_PRESETS.vertical.values;
    const size = hyperparams.kernelSize;
    const values = new Float32Array(size * size).fill(0.1);
    for (let i = 0; i < Math.min(base.length, values.length); i++) values[i] = base[i];
    return values;
  }, [hyperparams.kernelSize]);

  const horizontalKernel = useMemo(() => {
    const base = KERNEL_PRESETS.horizontal.values;
    const size = hyperparams.kernelSize;
    const values = new Float32Array(size * size).fill(0.1);
    for (let i = 0; i < Math.min(base.length, values.length); i++) values[i] = base[i];
    return values;
  }, [hyperparams.kernelSize]);

  const sharpenKernel = useMemo(() => {
    const base = KERNEL_PRESETS.sharpen.values;
    const size = hyperparams.kernelSize;
    const values = new Float32Array(size * size).fill(0.1);
    for (let i = 0; i < Math.min(base.length, values.length); i++) values[i] = base[i];
    return values;
  }, [hyperparams.kernelSize]);

  const activeKernel = useMemo(() => {
    if (focusedPreset === 'vertical') return verticalKernel;
    if (focusedPreset === 'horizontal') return horizontalKernel;
    return sharpenKernel;
  }, [focusedPreset, verticalKernel, horizontalKernel, sharpenKernel]);

  const outputDim = Math.floor((28 + 2 * hyperparams.padding - hyperparams.kernelSize) / hyperparams.stride) + 1;
  const totalSteps = outputDim * outputDim;
  const { stepIndex } = useTimeline(totalSteps, true);

  // Compute three parallel output maps
  const outputMapVertical = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeConv2D(preprocessedData, 28, verticalKernel, hyperparams.kernelSize, hyperparams.stride, hyperparams.padding, REPRESENTATIVE_BIAS);
  }, [verticalKernel, preprocessedData, hyperparams, totalSteps]);

  const outputMapHorizontal = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeConv2D(preprocessedData, 28, horizontalKernel, hyperparams.kernelSize, hyperparams.stride, hyperparams.padding, REPRESENTATIVE_BIAS);
  }, [horizontalKernel, preprocessedData, hyperparams, totalSteps]);

  const outputMapSharpen = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeConv2D(preprocessedData, 28, sharpenKernel, hyperparams.kernelSize, hyperparams.stride, hyperparams.padding, REPRESENTATIVE_BIAS);
  }, [sharpenKernel, preprocessedData, hyperparams, totalSteps]);

  const activeOutputMap = useMemo(() => {
    if (focusedPreset === 'vertical') return outputMapVertical;
    if (focusedPreset === 'horizontal') return outputMapHorizontal;
    return outputMapSharpen;
  }, [focusedPreset, outputMapVertical, outputMapHorizontal, outputMapSharpen]);

  const getMinMax = (map: Float32Array) => {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < map.length; i++) {
      if (map[i] < min) min = map[i];
      if (map[i] > max) max = map[i];
    }
    if (min === max) { min = 0; max = 1; }
    return { min, max };
  };

  const verticalRange = useMemo(() => getMinMax(outputMapVertical), [outputMapVertical]);
  const horizontalRange = useMemo(() => getMinMax(outputMapHorizontal), [outputMapHorizontal]);
  const sharpenRange = useMemo(() => getMinMax(outputMapSharpen), [outputMapSharpen]);

  const { row, col } = useMemo(() => ({
    row: Math.floor(stepIndex / outputDim),
    col: stepIndex % outputDim,
  }), [stepIndex, outputDim]);

  const zoomProgress = remap(stepIndex % outputDim, 0, outputDim - 1, 0, 1);

  // Render Input Canvas
  useEffect(() => {
    const canvas = inputCanvasRef.current;
    if (!canvas || !preprocessedData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 12;
    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        const val = preprocessedData[r * 28 + c];
        const grayVal = Math.round(val * 255);
        ctx.fillStyle = `rgb(${grayVal},${grayVal},${grayVal})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [preprocessedData]);

  // Reset canvases on filter/dimension change
  useEffect(() => {
    [verticalCanvasRef, horizontalCanvasRef, sharpenCanvasRef].forEach((ref) => {
      const canvas = ref.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    lastDrawnVertical.current = -1;
    lastDrawnHorizontal.current = -1;
    lastDrawnSharpen.current = -1;
  }, [outputMapVertical, outputMapHorizontal, outputMapSharpen]);

  // Helper to draw output pixels
  const drawOutput = useCallback((
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    lastDrawnRef: React.MutableRefObject<number>,
    map: Float32Array,
    range: { min: number; max: number }
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cellSize = 5; // Compact cell size for 140x140 canvases
    let start = lastDrawnRef.current + 1;
    if (stepIndex < lastDrawnRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      start = 0;
    }
    for (let i = start; i <= stepIndex; i++) {
      const r = Math.floor(i / outputDim);
      const c = i % outputDim;
      const val = map[i];
      const norm = (val - range.min) / (range.max - range.min || 1);
      const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
      ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnRef.current = stepIndex;
  }, [stepIndex, outputDim]);

  // Run draws for all three in parallel
  useEffect(() => {
    drawOutput(verticalCanvasRef, lastDrawnVertical, outputMapVertical, verticalRange);
    drawOutput(horizontalCanvasRef, lastDrawnHorizontal, outputMapHorizontal, horizontalRange);
    drawOutput(sharpenCanvasRef, lastDrawnSharpen, outputMapSharpen, sharpenRange);
  }, [drawOutput, outputMapVertical, outputMapHorizontal, outputMapSharpen, verticalRange, horizontalRange, sharpenRange]);

  if (!preprocessedData) return null;

  // Math bubble details
  const CANVAS_PX = 336;
  const CELL = 12;
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
    <div className="flex flex-col items-center gap-6 w-full max-w-6xl px-4 py-2">
      {/* Title / Description */}
      <div className="flex flex-col items-center gap-1 text-center select-none w-full">
        <h4 className="text-xs font-mono text-aurora-teal uppercase tracking-widest">Parallel Filtering Simulation</h4>
        <p className="text-[10px] text-white/40 max-w-md mt-0.5 leading-normal">
          One convolutional layer runs multiple kernels in parallel. Click any output feature map below to focus and inspect its mathematical calculation.
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 w-full py-2">
        {/* Left Column: Input plane */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]">Input Plane</span>
          <div className="relative p-1 border border-white/5 bg-[#161616] shadow-2xl rounded-lg">
            <canvas ref={inputCanvasRef} width={336} height={336}
              className="block h-[336px] w-[336px] bg-black rounded-md"
            />
            <KernelFrame stepIndex={stepIndex} cellSize={12} canvasSize={336} />
            {/* Math bubble */}
            <div
              className="absolute pointer-events-none z-30 bg-[#1c1c1c]/95 border border-white/10 rounded px-2 py-1 font-serif italic text-[10px] text-[#F5CD47] shadow-2xl flex items-center gap-1.5"
              style={{
                left: `${bubbleLeft}px`,
                top:  `${bubbleTop}px`,
              }}
            >
              <span className="opacity-60 text-white font-sans text-[8px]">Σ(x·w)=</span>
              <span className="font-bold">{activeOutputMap[stepIndex]?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Convolve arrow (hide on small screens) */}
        <div className="hidden lg:flex flex-col items-center justify-center text-[#F5CD47]/20" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[7px] font-mono mt-1 text-white/20 uppercase tracking-[0.4em]">Convolve</span>
        </div>

        {/* Middle Column: Three Parallel Output Canvases */}
        <div className="flex flex-row lg:flex-col gap-4 items-center justify-center">
          {(Object.keys(KERNEL_PRESETS) as KernelPreset[]).map((preset) => {
            const isFocused = focusedPreset === preset;
            const canvasRef = 
              preset === 'vertical' ? verticalCanvasRef :
              preset === 'horizontal' ? horizontalCanvasRef :
              sharpenCanvasRef;
            
            return (
              <button
                key={preset}
                onClick={() => setFocusedPreset(preset)}
                className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 border relative ${
                  isFocused
                    ? 'border-[#F5CD47] bg-[#F5CD47]/5 shadow-[0_0_20px_rgba(245,205,71,0.15)] scale-105'
                    : 'border-white/5 bg-black/20 hover:border-white/15'
                }`}
                type="button"
                title={`Click to inspect ${KERNEL_PRESETS[preset].label}`}
              >
                {/* Active Indicator Dot */}
                {isFocused && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F5CD47] animate-pulse" />
                )}

                <span className={`text-[8px] font-mono uppercase tracking-widest font-bold ${isFocused ? 'text-[#F5CD47]' : 'text-white/40'}`}>
                  {KERNEL_PRESETS[preset].label}
                </span>

                <div className="p-0.5 bg-black rounded border border-white/5">
                  {/* outputDim * 5 is 140px */}
                  <canvas
                    ref={canvasRef}
                    width={outputDim * 5}
                    height={outputDim * 5}
                    className="block h-[140px] w-[140px] bg-black rounded"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: 3b1b zoom panel */}
        <div className="lg:pl-6 lg:border-l lg:border-white/5">
          <div className="mb-2 text-[9px] font-mono text-white/30 uppercase text-center lg:text-left tracking-wider">
            focused: <span className="text-[#F5CD47] font-bold">{KERNEL_PRESETS[focusedPreset].label}</span>
          </div>
          <KernelZoomPanel
            row={row}
            col={col}
            inputData={preprocessedData}
            kernel={activeKernel}
            outputValue={activeOutputMap[stepIndex] ?? 0}
            progress={zoomProgress}
          />
        </div>
      </div>
    </div>
  );
};
