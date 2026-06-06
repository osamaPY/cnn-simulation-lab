import React, { useRef, useEffect, useMemo } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { TimelineStepper } from '../../components/TimelineStepper';
import { getAuroraColor } from '../../canvas/heatScale';
import {
  getPoolingWindow,
  maxPoolWindow,
  computeMaxPool2D
} from '../../math/pooling';
import {
  computeValidConv2D,
  REPRESENTATIVE_KERNEL,
  REPRESENTATIVE_BIAS
} from '../../math/convolution';

export const PoolingStage: React.FC = () => {
  const { preprocessedData, activations, selectedChannel } = useLabStore();
  const inputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Output is 13x13 = 169 positions
  const totalSteps = 169;
  const { stepIndex } = useTimeline(totalSteps);

  // 1. Extract the 26x26 input map (either real activations or convolved fallback)
  const input26 = useMemo(() => {
    // Look for real conv2d activation records
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

    // Fallback: convolve the raw preprocessed drawing
    if (preprocessedData) {
      return computeValidConv2D(preprocessedData, REPRESENTATIVE_KERNEL, REPRESENTATIVE_BIAS);
    }

    return new Float32Array(26 * 26);
  }, [activations, selectedChannel, preprocessedData]);

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

  // 2. Pre-calculate the pooled 13x13 output map
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

  // 3. Extract active window at current stepIndex
  const { windowVals, row, col, maxVal, maxIndex } = useMemo(() => {
    const r = Math.floor(stepIndex / 13);
    const c = stepIndex % 13;
    const win = getPoolingWindow(input26, r, c);
    const { maxVal: mv, maxIndex: mi } = maxPoolWindow(win);
    return { windowVals: win, row: r, col: c, maxVal: mv, maxIndex: mi };
  }, [input26, stepIndex]);

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
        // Normalize using input min/max
        const norm = (val - inMin) / (inMax - inMin);
        const { r: cr, g: cg, b: cb } = getAuroraColor(norm);
        
        ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.01)';
        ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }, [input26, inMin, inMax]);

  // Render 13x13 Output Canvas progressively
  useEffect(() => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = 20; // 13 * 20 = 260px output canvas

    for (let i = 0; i <= stepIndex; i++) {
      const r = Math.floor(i / 13);
      const c = i % 13;
      const val = outputMap[i];

      const norm = (val - outMin) / (outMax - outMin);
      const { r: cr, g: cg, b: cb } = getAuroraColor(norm);

      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      
      ctx.strokeStyle = 'rgba(255,255,255,0.01)';
      ctx.strokeRect(c * cellSize, r * cellSize, cellSize, cellSize);
    }
  }, [stepIndex, outputMap, outMin, outMax]);

  // Calculate pixel coordinates for sliding SVG window
  const frameX = col * 2 * 10;
  const frameY = row * 2 * 10;

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      {/* 1. Canvas side-by-side grids */}
      <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 w-full">
        {/* Input Map */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Input Map: 26x26
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Region: ({row * 2}, {col * 2})
            </span>
          </div>

          <div className="relative p-1 rounded-xl bg-gradient-to-br from-border-muted to-bg-card border border-border-muted shadow-lg shadow-black/40">
            <canvas
              ref={inputCanvasRef}
              width={260}
              height={260}
              className="rounded-lg bg-black block border border-border-subtle select-none"
            />
            {/* Sliding 2x2 pooling frame */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 260 260"
            >
              <defs>
                <filter id="pool-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect
                x={frameX}
                y={frameY}
                width={20}
                height={20}
                rx="1"
                fill="rgba(139, 92, 246, 0.15)"
                stroke="var(--aurora-purple)"
                strokeWidth="1.5"
                filter="url(#pool-glow)"
                className="transition-all duration-150 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Local Max Telemetry Panel */}
        <div className="flex flex-col items-center justify-center gap-4 bg-bg-panel border border-border-muted p-4 rounded-xl max-w-xs w-full shadow-inner text-center">
          <div className="border-b border-border-subtle pb-2 w-full text-center">
            <span className="text-[10px] font-mono text-text-accent uppercase tracking-wider font-semibold">
              2x2 Max Pooling Window
            </span>
          </div>

          {/* 2x2 grid representing values in window */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[8px] font-mono text-text-muted uppercase">Window Activations</span>
            <div className="grid grid-cols-2 gap-1.5 p-2 bg-black rounded-lg border border-border-subtle w-32 h-32">
              {Array.from(windowVals).map((val, idx) => {
                const isMax = idx === maxIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-center rounded-md text-xs font-mono border transition-all duration-300 ${
                      isMax
                        ? 'bg-aurora-teal/20 border-aurora-mint text-aurora-mint shadow-[0_0_8px_rgba(52,211,153,0.25)] font-bold scale-105'
                        : 'bg-bg-deep border-border-subtle text-text-muted scale-95'
                    }`}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mathematical detail */}
          <div className="w-full bg-bg-deep border border-border-subtle p-2.5 rounded-lg text-left font-mono text-[10px] flex flex-col gap-1.5">
            <div className="text-[9px] uppercase text-text-muted border-b border-border-subtle pb-1 font-display">
              Operation Summary
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Window:</span>
              <span>[{Array.from(windowVals).map(v => v.toFixed(1)).join(', ')}]</span>
            </div>
            <div className="flex justify-between text-text-accent font-bold text-xs pt-1 border-t border-border-subtle">
              <span>Max Output:</span>
              <span className="text-aurora-mint">{maxVal.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Output Map */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2 px-1">
            <span className="text-[10px] font-mono text-text-secondary uppercase">
              Output Map: 13x13
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

      {/* 2. Timeline Stepper */}
      <TimelineStepper stageTotalSteps={totalSteps} />

      {/* 3. Mathematical explainer caption */}
      <div className="w-full text-center max-w-lg border border-border-subtle p-3.5 rounded-xl bg-bg-panel/40 flex flex-col items-center gap-1.5 text-xs text-text-secondary leading-relaxed">
        <span className="font-semibold text-text-accent font-mono">
          output(i, j) = Max( input[2i:2i+2, 2j:2j+2] )
        </span>
        <p className="text-[10px] text-text-muted">
          * Note: Dimension scales down from <strong className="text-text-secondary">26x26</strong> to <strong className="text-text-secondary">13x13</strong> because pool size = 2 and stride = 2 cuts spatial height/width in half.
        </p>
      </div>
    </div>
  );
};
