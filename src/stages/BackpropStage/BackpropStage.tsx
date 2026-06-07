import React, { useMemo } from 'react';
import { useTimeline } from '../../animations/useTimeline';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Samples for nodes layout matching DenseStage
const INPUT_SAMPLES = [0, 1, 2, 3, 4, 5, 6, 7];
const HIDDEN_SAMPLES = [0, 1, 2, 3, 4, -1, 5, 6, 7, 8, 9, 10];
const OUTPUT_SAMPLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// 3x3 filter kernel learning states (random noise -> vertical edge detector)
const INITIAL_KERNEL = [-0.4, 0.7, 0.2, 0.8, -0.9, 0.3, -0.1, 0.5, -0.6];
const TARGET_KERNEL = [-1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0];

export const BackpropStage: React.FC = () => {
  const totalSteps = 100;
  const { stepIndex } = useTimeline(totalSteps, true);
  const progress = stepIndex / (totalSteps - 1 || 1); // 0.0 to 1.0
  const shouldReduceMotion = useReducedMotion();

  const currentKernel = useMemo(() => {
    // Phase 1 (progress 0.0 to 0.4): Kernel remains initial noise
    if (progress < 0.4) return INITIAL_KERNEL;
    // Phase 2 (progress 0.4 to 0.95): Kernel dynamically transitions/interpolates
    if (progress < 0.95) {
      const t = (progress - 0.4) / 0.55;
      return INITIAL_KERNEL.map((val, idx) => val + (TARGET_KERNEL[idx] - val) * t);
    }
    // Phase 3 (progress 0.95 to 1.0): Kernel has fully learned the weights
    return TARGET_KERNEL;
  }, [progress]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-[800px] items-center px-4">
      {/* Action header */}
      <div className="flex justify-between w-full items-center">
        <span className="text-xs font-semibold text-signal-coral bg-signal-coral/10 border border-signal-coral/25 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(255,128,102,0.15)]">
          Backward Gradient Flow Active
        </span>
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          Backpropagation Simulation
        </span>
      </div>

      {/* Main visual chalkboard board */}
      <div className="relative w-full aspect-[800/400] bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <svg
          viewBox="0 0 800 400"
          className="absolute inset-0 w-full h-full select-none z-10"
        >
          <defs>
            <filter id="node-glow" x="-35%" y="-35%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="grad-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection Lines (Gradients Flowing Backwards) */}
          {/* Hidden -> Output connections */}
          {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
            if (hIndex === -1) return null;
            const hPt = [390, 60 + hSampleIdx * 24];
            
            return OUTPUT_SAMPLES.map((_, o) => {
              const outPt = [680, 65 + o * 27];
              const isTargetClass = o === 3; // Let's say target class is '3' (which made the error)
              const baseOpacity = isTargetClass ? 0.25 : 0.03;
              const strokeColor = isTargetClass ? 'var(--signal-coral)' : 'rgba(255, 255, 255, 0.03)';
              return (
                <line
                  key={`line2-${hIndex}-${o}`}
                  x1={hPt[0]}
                  y1={hPt[1]}
                  x2={outPt[0]}
                  y2={outPt[1]}
                  stroke={strokeColor}
                  strokeOpacity={baseOpacity}
                  strokeWidth={isTargetClass ? 1.5 : 0.6}
                />
              );
            });
          })}

          {/* Input -> Hidden connections */}
          {INPUT_SAMPLES.map((_, sampleIdx) => {
            const inPt = [90, 60 + sampleIdx * 35];
            
            return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              if (hIndex === -1) return null;
              const hPt = [390, 60 + hSampleIdx * 24];
              // Highlight pathways connected to active hidden nodes
              const isPathActive = hSampleIdx % 3 === 0;
              const baseOpacity = isPathActive ? 0.2 : 0.03;
              const strokeColor = isPathActive ? 'var(--signal-coral)' : 'rgba(255, 255, 255, 0.03)';
              return (
                <line
                  key={`line1-${sampleIdx}-${hIndex}`}
                  x1={inPt[0]}
                  y1={inPt[1]}
                  x2={hPt[0]}
                  y2={hPt[1]}
                  stroke={strokeColor}
                  strokeOpacity={baseOpacity}
                  strokeWidth={isPathActive ? 1.2 : 0.5}
                />
              );
            });
          })}

          {/* Backward Gradient Pulses (progress 0.0 to 0.6) */}
          {!shouldReduceMotion && progress < 0.6 && (() => {
            const t = progress / 0.6; // Scale to 0..1
            
            // Output to Hidden pulses (t: 0.0 to 0.5)
            if (t < 0.5) {
              const t1 = t * 2;
              return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
                if (hIndex === -1) return null;
                const hPt = [390, 60 + hSampleIdx * 24];
                const outPt = [680, 65 + 3 * 27]; // target class 3
                // Flows backwards: outPt -> hPt
                const px = outPt[0] - (outPt[0] - hPt[0]) * t1;
                const py = outPt[1] - (outPt[1] - hPt[1]) * t1;
                
                return (
                  <circle
                    key={`p2-${hSampleIdx}`}
                    cx={px}
                    cy={py}
                    r={3.5}
                    fill="var(--signal-coral)"
                    filter="url(#grad-glow)"
                  />
                );
              });
            }
            
            // Hidden to Input pulses (t: 0.5 to 1.0)
            const t2 = (t - 0.5) * 2;
            return INPUT_SAMPLES.map((_, sampleIdx) => {
              const inPt = [90, 60 + sampleIdx * 35];
              // Choose a representative hidden node to backprop from
              const hPt = [390, 60 + 3 * 24];
              // Flows backwards: hPt -> inPt
              const px = hPt[0] - (hPt[0] - inPt[0]) * t2;
              const py = hPt[1] - (hPt[1] - inPt[1]) * t2;
              
              return (
                <circle
                  key={`p1-${sampleIdx}`}
                  cx={px}
                  cy={py}
                  r={3.5}
                  fill="var(--signal-coral)"
                  filter="url(#grad-glow)"
                />
              );
            });
          })()}

          {/* Columns Draw Nodes */}
          {/* Left Column: Input Nodes */}
          {INPUT_SAMPLES.map((_, sampleIdx) => {
            const y = 60 + sampleIdx * 35;
            const isPulseActive = progress > 0.4 && progress < 0.7;
            return (
              <g key={`inNode-${sampleIdx}`}>
                <circle cx={90} cy={y} r={7} fill="#111827" stroke={isPulseActive ? "var(--signal-coral)" : "rgba(255,255,255,0.2)"} strokeWidth="1.2" filter={isPulseActive ? "url(#node-glow)" : undefined} className="transition-all duration-150" />
              </g>
            );
          })}

          {/* Center Column: Hidden Neurons */}
          {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
            const y = 60 + hSampleIdx * 24;
            if (hIndex === -1) {
              return (
                <g key="ellipsis-hidden">
                  <circle cx={390} cy={165} r={1.5} fill="rgba(255,255,255,0.3)" />
                  <circle cx={390} cy={171} r={1.5} fill="rgba(255,255,255,0.3)" />
                  <circle cx={390} cy={177} r={1.5} fill="rgba(255,255,255,0.3)" />
                </g>
              );
            }
            const isPulseActive = progress > 0.25 && progress < 0.55;

            return (
              <g key={`hNode-${hIndex}`}>
                <circle cx={390} cy={y} r={8} fill="#111827" stroke={isPulseActive ? "var(--signal-coral)" : "rgba(255,255,255,0.2)"} strokeWidth="1.2" filter={isPulseActive ? "url(#node-glow)" : undefined} className="transition-all duration-150" />
              </g>
            );
          })}

          {/* Right Column: Output Classes */}
          {OUTPUT_SAMPLES.map((_, o) => {
            const y = 65 + o * 27;
            const isTarget = o === 3;
            const isPulseActive = progress < 0.3 && isTarget;

            return (
              <g key={`outNode-${o}`}>
                <circle cx={680} cy={y} r={11} fill={isTarget ? "rgba(255,128,102,0.15)" : "#111827"} stroke={isTarget ? "var(--signal-coral)" : "rgba(255,255,255,0.2)"} strokeWidth={isTarget ? "1.5" : "1"} filter={isPulseActive ? "url(#node-glow)" : undefined} />
                <text x={680} y={y} fill={isTarget ? "var(--signal-coral)" : "rgba(255,255,255,0.4)"} fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                  {o}
                </text>
              </g>
            );
          })}

          {/* Headers */}
          <text x={90} y={30} fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="bold" textAnchor="middle">1. Flattened Vector</text>
          <text x={390} y={30} fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="bold" textAnchor="middle">2. Hidden Layer</text>
          <text x={680} y={30} fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="bold" textAnchor="middle">3. Output error (3)</text>
        </svg>

        {/* Floating LaTeX Update Formula */}
        <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/85 border border-white/10 font-mono text-[10px] text-white pointer-events-none shadow-2xl flex flex-col gap-1 z-20">
          <span className="text-signal-coral font-bold uppercase text-[9px] tracking-wider mb-0.5">Gradient Descent Rule</span>
          <span className="text-[12px] font-semibold text-white/95 text-center my-1 bg-[#0c141a] px-2 py-1.5 rounded border border-white/5 shadow-inner">
            W ← W - η · ∂L/∂W
          </span>
          <span className="text-white/55 text-[8.5px] leading-relaxed max-w-[180px]">
            Adjusts weights in the direction that decreases the loss function L.
          </span>
        </div>

        {/* Floating Kernel updates display card */}
        <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-black/85 border border-white/10 font-mono text-[9px] text-white pointer-events-none shadow-2xl flex flex-col gap-1.5 z-20">
          <span className="text-aurora-mint font-bold uppercase text-[9px] tracking-wider">Learning Filter Weights</span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-black/50 border border-white/5 rounded-lg w-28 h-28 mx-auto">
            {currentKernel.map((val, idx) => {
              // Highlight when updating
              const isUpdating = progress >= 0.4 && progress < 0.95;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center rounded text-[9px] font-bold border transition-all duration-200 ${
                    isUpdating
                      ? 'bg-aurora-mint/10 border-aurora-mint/40 text-aurora-mint'
                      : 'bg-black/40 border-white/5 text-white/60'
                  }`}
                >
                  {val.toFixed(1)}
                </div>
              );
            })}
          </div>
          <span className="text-white/40 text-[8px] text-center">
            {progress < 0.4 
              ? 'Awaiting error gradients...' 
              : progress < 0.95 
                ? 'Updating filter weights...' 
                : 'Filter learned successfully!'}
          </span>
        </div>
      </div>
    </div>
  );
};
