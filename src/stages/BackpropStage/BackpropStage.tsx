import React, { useMemo, useRef, useEffect } from 'react';
import { useTimeline } from '../../animations/useTimeline';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimatedFormula } from '../../components/AnimatedFormula';
import { remap, easeInOut } from '../../animations/mathUtils';

const INPUT_SAMPLES = [0, 1, 2, 3, 4, 5, 6, 7];
const HIDDEN_SAMPLES = [0, 1, 2, 3, 4, -1, 5, 6, 7, 8, 9, 10];
const OUTPUT_SAMPLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const INITIAL_KERNEL = [-0.4, 0.7, 0.2, 0.8, -0.9, 0.3, -0.1, 0.5, -0.6];
const TARGET_KERNEL  = [-1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0];

// How many gradient pulses to show simultaneously
const N_PULSES = 5;

export const BackpropStage: React.FC = () => {
  const totalSteps = 100;
  const { stepIndex } = useTimeline(totalSteps, true);
  const progress = stepIndex / (totalSteps - 1 || 1);
  const shouldReduceMotion = useReducedMotion();
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentKernel = useMemo(() => {
    if (progress < 0.4) return INITIAL_KERNEL;
    if (progress < 0.95) {
      const t = easeInOut((progress - 0.4) / 0.55);
      return INITIAL_KERNEL.map((val, idx) => val + (TARGET_KERNEL[idx] - val) * t);
    }
    return TARGET_KERNEL;
  }, [progress]);

  // Draw an animated loss-curve on a small canvas
  useEffect(() => {
    const canvas = lossCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Static axis
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, H - 8); ctx.lineTo(W - 4, H - 8);
    ctx.moveTo(8, H - 8); ctx.lineTo(8, 4);
    ctx.stroke();

    // Loss curve: exponential decay
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    const drawTo = Math.max(2, Math.floor(progress * (W - 16)));
    for (let x = 0; x <= drawTo; x++) {
      const t = x / (W - 16);
      const loss = Math.exp(-4 * t) * (H - 20) + 8;
      const cx = 8 + x;
      const cy = loss;
      if (x === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '8px monospace';
    ctx.fillText('Loss', 10, 13);
    ctx.fillText('Epochs →', W - 52, H - 1);
  }, [progress]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-[820px] items-center px-4">
      <div className="flex justify-between w-full items-center">
        <span className="text-xs font-semibold text-signal-coral bg-signal-coral/10 border border-signal-coral/25 px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(255,128,102,0.15)]">
          Backward Gradient Flow Active
        </span>
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          Backpropagation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-5 w-full">
        {/* Network diagram */}
        <div className="relative w-full bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ aspectRatio: '800/400' }}>
          <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full select-none z-10">
            <defs>
              <filter id="node-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="grad-glow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Static connections */}
            {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              if (hIndex === -1) return null;
              const hPt = [390, 60 + hSampleIdx * 24];
              return OUTPUT_SAMPLES.map((_, o) => {
                const outPt = [680, 65 + o * 27];
                const isTarget = o === 3;
                return (
                  <line key={`l2-${hIndex}-${o}`}
                    x1={hPt[0]} y1={hPt[1]} x2={outPt[0]} y2={outPt[1]}
                    stroke={isTarget ? 'var(--signal-coral)' : 'rgba(255,255,255,0.03)'}
                    strokeOpacity={isTarget ? 0.25 : 0.04}
                    strokeWidth={isTarget ? 1.5 : 0.6}
                  />
                );
              });
            })}
            {INPUT_SAMPLES.map((_, sampleIdx) => {
              const inPt = [90, 60 + sampleIdx * 35];
              return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
                if (hIndex === -1) return null;
                const hPt = [390, 60 + hSampleIdx * 24];
                const isPathActive = hSampleIdx % 3 === 0;
                return (
                  <line key={`l1-${sampleIdx}-${hIndex}`}
                    x1={inPt[0]} y1={inPt[1]} x2={hPt[0]} y2={hPt[1]}
                    stroke={isPathActive ? 'var(--signal-coral)' : 'rgba(255,255,255,0.03)'}
                    strokeOpacity={isPathActive ? 0.2 : 0.04}
                    strokeWidth={isPathActive ? 1.2 : 0.5}
                  />
                );
              });
            })}

            {/* 3b1b-style gradient pulses — multiple dots flowing backwards */}
            {!shouldReduceMotion && progress < 0.7 &&
              Array.from({ length: N_PULSES }).map((_, pulseIdx) => {
                const offset = pulseIdx / N_PULSES;
                const t = ((progress * 2 + offset) % 1);
                const phase = progress < 0.35 ? 'outToHidden' : 'hiddenToInput';

                if (phase === 'outToHidden') {
                  return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
                    if (hIndex === -1 || hSampleIdx % 3 !== 0) return null;
                    const hPt = [390, 60 + hSampleIdx * 24];
                    const outPt = [680, 65 + 3 * 27];
                    const px = outPt[0] - (outPt[0] - hPt[0]) * t;
                    const py = outPt[1] - (outPt[1] - hPt[1]) * t;
                    return (
                      <circle key={`p2-${pulseIdx}-${hSampleIdx}`} cx={px} cy={py} r={3.5}
                        fill="var(--signal-coral)" filter="url(#grad-glow)" opacity={0.7 - pulseIdx * 0.1}
                      />
                    );
                  });
                } else {
                  return INPUT_SAMPLES.map((_, sIdx) => {
                    const inPt = [90, 60 + sIdx * 35];
                    const hPt = [390, 60 + 3 * 24];
                    const px = hPt[0] - (hPt[0] - inPt[0]) * t;
                    const py = hPt[1] - (hPt[1] - inPt[1]) * t;
                    return (
                      <circle key={`p1-${pulseIdx}-${sIdx}`} cx={px} cy={py} r={3.5}
                        fill="var(--signal-coral)" filter="url(#grad-glow)" opacity={0.7 - pulseIdx * 0.1}
                      />
                    );
                  });
                }
              })
            }

            {/* Nodes */}
            {INPUT_SAMPLES.map((_, sampleIdx) => {
              const y = 60 + sampleIdx * 35;
              const active = progress > 0.4 && progress < 0.7;
              return (
                <g key={`in-${sampleIdx}`}>
                  <circle cx={90} cy={y} r={7} fill="#111827"
                    stroke={active ? 'var(--signal-coral)' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={active ? 1.8 : 1.2}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                </g>
              );
            })}

            {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              const y = 60 + hSampleIdx * 24;
              if (hIndex === -1) {
                return (
                  <g key="ellipsis">
                    {[165, 171, 177].map(cy => <circle key={cy} cx={390} cy={cy} r={1.5} fill="rgba(255,255,255,0.3)" />)}
                  </g>
                );
              }
              const active = progress > 0.25 && progress < 0.55;
              return (
                <g key={`h-${hIndex}`}>
                  <circle cx={390} cy={y} r={8} fill="#111827"
                    stroke={active ? 'var(--signal-coral)' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={active ? 1.8 : 1.2}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                </g>
              );
            })}

            {OUTPUT_SAMPLES.map((_, o) => {
              const y = 65 + o * 27;
              const isTarget = o === 3;
              const active = progress < 0.3 && isTarget;
              return (
                <g key={`out-${o}`}>
                  <circle cx={680} cy={y} r={11}
                    fill={isTarget ? 'rgba(255,128,102,0.15)' : '#111827'}
                    stroke={isTarget ? 'var(--signal-coral)' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isTarget ? 1.8 : 1}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                  <text x={680} y={y} fill={isTarget ? 'var(--signal-coral)' : 'rgba(255,255,255,0.4)'}
                    fontSize={10} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {o}
                  </text>
                </g>
              );
            })}

            {/* Headers */}
            <text x={90}  y={30} fill="rgba(255,255,255,0.5)" fontSize={9} fontWeight="bold" textAnchor="middle">Flattened</text>
            <text x={390} y={30} fill="rgba(255,255,255,0.5)" fontSize={9} fontWeight="bold" textAnchor="middle">Hidden Layer</text>
            <text x={680} y={30} fill="rgba(255,255,255,0.5)" fontSize={9} fontWeight="bold" textAnchor="middle">Output Error</text>
          </svg>

          {/* Gradient descent formula — draws on at progress > 0.45 */}
          <div className="absolute top-3 left-3 p-3 rounded-xl bg-black/85 border border-white/10 font-mono text-[10px] text-white pointer-events-none shadow-2xl flex flex-col gap-1.5 z-20">
            <span className="text-signal-coral font-bold uppercase text-[9px] tracking-wider">Gradient Descent</span>
            <AnimatedFormula
              formula="W ← W − η · ∂L/∂W"
              progress={remap(progress, 0.45, 0.75, 0, 1)}
              color="#f87171"
              fontSize="0.85rem"
            />
          </div>

          {/* Kernel weights update */}
          <div className="absolute bottom-3 left-3 p-3 rounded-xl bg-black/85 border border-white/10 font-mono text-[9px] text-white pointer-events-none shadow-2xl flex flex-col gap-1.5 z-20">
            <span className="text-aurora-mint font-bold uppercase text-[9px] tracking-wider">Learning Weights</span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/50 border border-white/5 rounded-lg w-28 h-28">
              {currentKernel.map((val, idx) => {
                const isUpdating = progress >= 0.4 && progress < 0.95;
                return (
                  <div key={idx}
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
              {progress < 0.4 ? 'Awaiting gradients…' : progress < 0.95 ? 'Weights updating…' : '✓ Filter learned!'}
            </span>
          </div>
        </div>

        {/* Right side: loss curve + formula explanation */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl flex flex-col gap-3">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Training Loss</span>
            <canvas ref={lossCanvasRef} width={180} height={100}
              className="rounded-lg bg-black/40 border border-white/5 w-full"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl flex flex-col gap-2">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Chain Rule</span>
            <AnimatedFormula
              formula="∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w"
              progress={remap(progress, 0.6, 0.9, 0, 1)}
              color="#a78bfa"
              fontSize="0.72rem"
            />
            <p className="text-[9px] text-white/35 font-mono leading-relaxed mt-1">
              Error flows backwards through every layer, nudging each weight in the direction that reduces the loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
