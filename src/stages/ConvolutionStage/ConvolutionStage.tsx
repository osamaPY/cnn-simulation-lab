import React, { useRef, useEffect, useMemo } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { TimelineStepper } from '../../components/TimelineStepper';
import { KernelFrame } from '../../animations/KernelFrame';
import { getAuroraColor } from '../../canvas/heatScale';
import {
  getPatch,
  convolvePatch,
  computeValidConv2D,
  REPRESENTATIVE_KERNEL,
  REPRESENTATIVE_BIAS
} from '../../math/convolution';

export const ConvolutionStage: React.FC = () => {
  const { preprocessedData } = useLabStore();
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Total valid positions: (28-3+1) * (28-3+1) = 26 * 26 = 676 steps
  const totalSteps = 676;
  const { stepIndex } = useTimeline(totalSteps);

  // Pre-calculate full output map on mount/data change for quick rendering
  const outputMap = useMemo(() => {
    if (!preprocessedData) return new Float32Array(totalSteps);
    return computeValidConv2D(preprocessedData, REPRESENTATIVE_KERNEL, REPRESENTATIVE_BIAS);
  }, [preprocessedData]);

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
    const v = convolvePatch(p, REPRESENTATIVE_KERNEL, REPRESENTATIVE_BIAS);
    return { patch: p, row: r, col: c, activeVal: v };
  }, [preprocessedData, stepIndex]);

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

  // Render Output Feature Map progressively up to stepIndex
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 10; // 26 * 10 = 260px output map

    // Draw all calculated cells up to the current stepIndex
    for (let i = 0; i <= stepIndex; i++) {
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
  }, [stepIndex, outputMap, outMin, outMax]);

  if (!preprocessedData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[360px] bg-bg-card/20">
        <span className="text-3xl mb-3">🔍</span>
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
  const products = Array.from(patch).map((v, i) => v * REPRESENTATIVE_KERNEL[i]);
  const sumOfProducts = products.reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      {/* 1. Main visualizer panels (Input -> Scan -> Output) */}
      <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 w-full">
        {/* Input Panel */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Input: 28x28 Tensor
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Patch Center: ({row + 1}, {col + 1})
            </span>
          </div>
          
          <div className="relative p-1 rounded-xl bg-gradient-to-br from-border-muted to-bg-card border border-border-muted shadow-lg shadow-black/40">
            <canvas
              ref={inputCanvasRef}
              width={280}
              height={280}
              className="rounded-lg bg-black block border border-border-subtle select-none"
            />
            {/* SVG KernelFrame moving on top of input canvas */}
            <KernelFrame stepIndex={stepIndex} />
          </div>
        </div>

        {/* Math Operations center column */}
        <div className="flex flex-col items-center justify-center gap-4 bg-bg-panel border border-border-muted p-4 rounded-xl max-w-sm w-full shadow-inner text-center">
          <div className="border-b border-border-subtle pb-2 w-full text-center">
            <span className="text-[10px] font-mono text-text-accent uppercase tracking-wider font-semibold">
              3x3 Kernel dot-product
            </span>
          </div>

          {/* 3x3 grids showing patch, weights, and products */}
          <div className="flex flex-col gap-3 w-full">
            {/* Row 1: Patch and Weights */}
            <div className="grid grid-cols-2 gap-4">
              {/* Patch grid */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-text-muted uppercase mb-1">Patch (x)</span>
                <div className="grid grid-cols-3 gap-0.5 p-1 bg-black rounded border border-border-subtle w-24 h-24">
                  {Array.from(patch).map((v, i) => (
                    <div key={i} className="flex items-center justify-center text-[9px] font-mono rounded-sm bg-bg-deep text-text-primary">
                      {v.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kernel grid */}
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-text-muted uppercase mb-1">Weights (W)</span>
                <div className="grid grid-cols-3 gap-0.5 p-1 bg-black rounded border border-border-subtle w-24 h-24">
                  {REPRESENTATIVE_KERNEL.map((v, i) => (
                    <div key={i} className="flex items-center justify-center text-[9px] font-mono rounded-sm bg-aurora-indigo/55 text-text-primary font-bold">
                      {v}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hadamard products */}
            <div className="flex flex-col items-center bg-black/40 border border-border-subtle p-2 rounded-lg">
              <span className="text-[8px] font-mono text-text-muted uppercase mb-1">Hadamard Product (x ⊙ W)</span>
              <div className="grid grid-cols-3 gap-1 w-full max-w-[150px]">
                {products.map((p, i) => (
                  <div key={i} className={`flex items-center justify-center text-[9px] font-mono rounded py-0.5 border ${
                    p > 0 
                      ? 'bg-aurora-teal/15 border-aurora-mint/20 text-aurora-mint' 
                      : p < 0 
                        ? 'bg-red-950/15 border-red-500/10 text-red-300' 
                        : 'bg-bg-deep border-border-subtle text-text-muted'
                  }`}>
                    {p.toFixed(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summation display */}
          <div className="w-full bg-bg-deep border border-border-subtle p-2.5 rounded-lg text-left font-mono text-[10px] flex flex-col gap-1.5">
            <div className="flex justify-between text-text-secondary border-b border-border-subtle pb-1">
              <span>Σ(products):</span>
              <span className="text-text-primary">{sumOfProducts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Bias (b):</span>
              <span className="text-red-300">{REPRESENTATIVE_BIAS.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-text-accent border-t border-border-subtle pt-1 font-bold text-xs">
              <span>Output:</span>
              <span className="text-aurora-mint">{activeVal.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Output: 26x26 Map
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Progress: {Math.round((stepIndex / totalSteps) * 100)}%
            </span>
          </div>

          <div className="relative p-1 rounded-xl bg-gradient-to-br from-border-muted to-bg-card border border-border-muted shadow-lg shadow-black/40">
            <canvas
              ref={outputCanvasRef}
              width={260}
              height={260}
              className="rounded-lg bg-black block border border-border-subtle select-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Timeline controls stepper */}
      <TimelineStepper stageTotalSteps={totalSteps} />

      {/* 3. Mathematical Formula footer caption */}
      <div className="w-full text-center max-w-lg border border-border-subtle p-3.5 rounded-xl bg-bg-panel/40 flex flex-col items-center gap-1.5 text-xs text-text-secondary leading-relaxed">
        <span className="font-semibold text-text-accent font-mono">
          output(i, j) = ReLU( Σ(patch_9 ⊙ kernel_9) + bias )
        </span>
        <p className="text-[10px] text-text-muted">
          * Note: Convolution output size reduces from <strong className="text-text-secondary">28x28</strong> to <strong className="text-text-secondary">26x26</strong> because the 3x3 filter frame requires 1 border pixel padding on all edges to fit without padding.
        </p>
      </div>
    </div>
  );
};
