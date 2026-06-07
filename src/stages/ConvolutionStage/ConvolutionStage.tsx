import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { TimelineStepper } from '../../components/TimelineStepper';
import { KernelFrame } from '../../animations/KernelFrame';
import { getAuroraColor } from '../../canvas/heatScale';
import {
  getPatch,
  convolvePatch,
  computeValidConv2D,
  REPRESENTATIVE_BIAS
} from '../../math/convolution';
import { ConvolutionStory } from './ConvolutionStory';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
  const currentStageId = useLabStore(state => state.currentStageId);
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDrawnStepRef = useRef(-1);
  const shouldReduceMotion = useReducedMotion();
  const [kernelPreset, setKernelPreset] = useState<KernelPreset>('vertical');
  const activeKernel = useMemo(() => Array.from(KERNEL_PRESETS[kernelPreset].values), [kernelPreset]);

  // Total valid positions: (28-3+1) * (28-3+1) = 26 * 26 = 676 steps
  const totalSteps = 676;
  const { stepIndex, isPlaying, play } = useTimeline(totalSteps);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = window.setTimeout(play, 320);
    return () => window.clearTimeout(timer);
  }, [play, shouldReduceMotion]);

  // Pre-calculate full output map on mount/data change for quick rendering
  const outputMap = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeValidConv2D(preprocessedData, activeKernel, REPRESENTATIVE_BIAS);
  }, [activeKernel, preprocessedData]);

  // Extract active patch, coordinates, and convolve result at current stepIndex
  const { patch, row, col, activeVal } = useMemo(() => {
    if (!preprocessedData) {
      return { 
        patch: new Float32Array(9), 
        row: 0, 
        col: 0, 
        activeVal: 0 
      };
    }
    const r = Math.floor(stepIndex / 26);
    const c = stepIndex % 26;
    const p = getPatch(preprocessedData, r, c);
    const v = convolvePatch(p, activeKernel, REPRESENTATIVE_BIAS);
    return { patch: p, row: r, col: c, activeVal: v };
  }, [activeKernel, preprocessedData, stepIndex]);

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
        // Draw input pixels (white intensity on black background)
        const grayVal = Math.round(val * 255);
        ctx.fillStyle = `rgb(${grayVal}, ${grayVal}, ${grayVal})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.01)';
        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
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

  // Draw only newly revealed output cells unless the timeline moves backward.
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = 10; // 26 * 10 = 260px output map
    let start = lastDrawnStepRef.current + 1;

    if (stepIndex < lastDrawnStepRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      start = 0;
    }

    for (let i = start; i <= stepIndex; i++) {
      const r = Math.floor(i / 26);
      const c = i % 26;
      const val = outputMap[i];

      // Normalize output value to [0, 1] for heat scaling
      const norm = (val - outMin) / (outMax - outMin);
      const { r: cr, g: cg, b: cb } = getAuroraColor(norm);

      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      
      // Draw grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.01)';
      ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
    lastDrawnStepRef.current = stepIndex;
  }, [stepIndex, outputMap, outMin, outMax]);

  if (!preprocessedData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[360px] bg-bg-card/20">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          Awaiting Preprocessed Data
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[200px]">
          Draw a digit and click 'Run Simulation' to convolve.
        </p>
      </div>
    );
  }

  // Multiply values for the 3x3 grid display
  const products = Array.from(patch).map((v, i) => v * activeKernel[i]);
  const sumOfProducts = products.reduce((acc, curr) => acc + curr, 0);
  const scanProgress = stepIndex / (totalSteps - 1);
  const focusPhase = currentStageId === 5 ? 1 : currentStageId === 6 ? 2 : 0;

  return (
    <div className="flex w-full flex-col items-center gap-5 p-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <strong className="block text-xs text-text-primary">Change the question the kernel asks</strong>
          <p className="mt-1 text-[10px] text-text-muted">Choose a filter, then play or scrub the scan to compare its response.</p>
        </div>
        <div className="flex flex-wrap gap-1" aria-label="Convolution kernel preset">
          {(Object.keys(KERNEL_PRESETS) as KernelPreset[]).map((preset) => (
            <button
              aria-pressed={kernelPreset === preset}
              className={`btn-secondary px-2.5 py-1.5 text-[10px] ${kernelPreset === preset ? 'border-text-accent text-text-accent bg-text-accent/5' : ''}`}
              key={preset}
              onClick={() => setKernelPreset(preset)}
              type="button"
            >
              {KERNEL_PRESETS[preset].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-3 rounded border border-border-subtle bg-bg-deep/50 px-3 py-2">
        <p className="text-[10px] leading-relaxed text-text-secondary">
          {currentStageId === 4
            ? 'Watch the frame move across the image and write one result at every valid position.'
            : currentStageId === 5
              ? 'Focus on the nine aligned input and weight pairs while the scan continues.'
              : 'Focus on how nine products and one bias become a single feature-map value.'}
        </p>
        <button className="btn-primary flex-none px-3 py-1.5 text-[10px]" onClick={play} disabled={isPlaying} type="button">
          {isPlaying ? 'Scan playing' : 'Play kernel scan'}
        </button>
      </div>

      <div className="grid w-full gap-4 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="flex min-w-0 flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Input: 28x28 Tensor
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Patch Center: ({row + 1}, {col + 1})
            </span>
          </div>
          
          <div className="relative aspect-square w-full max-w-[280px] p-1 rounded border border-border-muted bg-bg-canvas">
            <canvas
              ref={inputCanvasRef}
              width={280}
              height={280}
              className="block h-full w-full rounded-lg bg-black border border-border-subtle select-none"
            />
            {/* SVG KernelFrame moving on top of input canvas */}
            <KernelFrame stepIndex={stepIndex} />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex min-w-0 flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Output: 26x26 Map
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Progress: {Math.round((stepIndex / totalSteps) * 100)}%
            </span>
          </div>

          <div className="relative aspect-square w-full max-w-[260px] p-1 rounded border border-border-muted bg-bg-canvas">
            <canvas
              ref={outputCanvasRef}
              width={260}
              height={260}
              className="block h-full w-full rounded-lg bg-black border border-border-subtle select-none"
            />
          </div>
        </div>

      </div>

      <ConvolutionStory
        bias={REPRESENTATIVE_BIAS}
        col={col}
        focusPhase={focusPhase}
        kernel={activeKernel}
        output={activeVal}
        patch={patch}
        products={products}
        progress={(scanProgress * 4) % 1}
        row={row}
        sum={sumOfProducts}
      />

      <TimelineStepper stageTotalSteps={totalSteps} />

      <div className="w-full text-center max-w-lg border border-border-subtle p-3.5 rounded-xl bg-bg-panel/40 flex flex-col items-center gap-1.5 text-xs text-text-secondary leading-relaxed">
        <span className="font-semibold text-text-accent font-mono">
          output(i, j) = Σ(patch_9 ⊙ kernel_9) + bias
        </span>
        <p className="text-[10px] text-text-muted">
          This is a <strong className="text-text-secondary">changeable educational kernel</strong>;
          the input pixels and displayed calculations are real.
        </p>
        <p className="text-[10px] text-text-muted">
          * Note: Convolution output size reduces from <strong className="text-text-secondary">28x28</strong> to <strong className="text-text-secondary">26x26</strong> because the 3x3 filter frame requires 1 border pixel padding on all edges to fit without padding.
        </p>
      </div>
    </div>
  );
};
