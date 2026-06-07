import React, { useMemo, useRef, useEffect } from 'react';
import { useTimeline } from '../../animations/useTimeline';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AnimatedFormula } from '../../components/AnimatedFormula';
import { remap, easeInOut } from '../../animations/mathUtils';

const INPUT_SAMPLES  = [0, 1, 2, 3, 4, 5, 6, 7];
const HIDDEN_SAMPLES = [0, 1, 2, 3, 4, -1, 5, 6, 7, 8, 9, 10];
const OUTPUT_SAMPLES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const INITIAL_KERNEL: number[] = [-0.4, 0.7, 0.2, 0.8, -0.9, 0.3, -0.1, 0.5, -0.6];
const TARGET_KERNEL:  number[] = [-1.0, 2.0, -1.0, -1.0, 2.0, -1.0, -1.0, 2.0, -1.0];

// SVG layout constants (centered and scaled up)
const IN_X   = 70;
const HID_X  = 250;
const OUT_X  = 430;

const IN_Y0  = 50;   const IN_STEP  = 42;  // 8 nodes -> 50 to 344
const HID_Y0 = 50;   const HID_STEP = 28;  // 12 nodes -> 50 to 358
const OUT_Y0 = 50;   const OUT_STEP = 33;  // 10 nodes -> 50 to 347

const N_PULSES = 6;

export const BackpropStage: React.FC = () => {
  const totalSteps = 100;
  const { stepIndex } = useTimeline(totalSteps, true);
  const progress = stepIndex / (totalSteps - 1 || 1);
  const shouldReduceMotion = useReducedMotion();
  const lossCanvasRef = useRef<HTMLCanvasElement>(null);

  const currentKernel = useMemo(() => {
    if (progress < 0.35) return INITIAL_KERNEL;
    if (progress < 0.90) {
      const t = easeInOut((progress - 0.35) / 0.55);
      return INITIAL_KERNEL.map((val, idx) => val + (TARGET_KERNEL[idx] - val) * t);
    }
    return TARGET_KERNEL;
  }, [progress]);

  // Compute gradient direction arrows for weights update
  const gradientDirections = useMemo(() => {
    return INITIAL_KERNEL.map((val, idx) => {
      const diff = TARGET_KERNEL[idx] - val;
      if (diff > 0.05) return '↑';
      if (diff < -0.05) return '↓';
      return '•';
    });
  }, []);

  // Update loss curve canvas
  useEffect(() => {
    const canvas = lossCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, H - 10); ctx.lineTo(W - 4, H - 10);
    ctx.moveTo(10, H - 10); ctx.lineTo(10, 4);
    ctx.stroke();

    // Loss curve
    ctx.strokeStyle = 'var(--signal-coral)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'var(--signal-coral)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const drawTo = Math.max(2, Math.floor(progress * (W - 20)));
    for (let x = 0; x <= drawTo; x++) {
      const t = x / (W - 20);
      const loss = Math.exp(-3.5 * t) * (H - 25) + 8;
      if (x === 0) ctx.moveTo(10 + x, loss);
      else ctx.lineTo(10 + x, loss);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.30)';
    ctx.font = '8px monospace';
    ctx.fillText('Loss', 14, 12);
    ctx.fillText('Epochs →', W - 52, H - 2);
  }, [progress]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-5xl px-4 py-2 backprop-stage-wrapper select-none">
      {/* Title */}
      <div className="flex flex-col items-center gap-1 text-center w-full">
        <h4 className="text-xs font-mono text-signal-coral uppercase tracking-widest">Backpropagation Learning</h4>
        <p className="text-[10px] text-white/40 max-w-md mt-0.5 leading-normal">
          During training, the error flows backward (right-to-left) through the network layers. We compute gradients using the Chain Rule and update the weights to minimize loss.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 w-full items-center">
        
        {/* Left Column: Enlarged Neural Network & Gradient Pulses */}
        <div className="relative w-full h-[320px] sm:h-[380px] md:h-[430px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl backprop-graph-container">
          <svg viewBox="0 0 500 400" className="w-full h-full select-none z-10" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="node-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="grad-glow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="2.0" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Static Connections: Hidden -> Output */}
            {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              if (hIndex === -1) return null;
              const hY = HID_Y0 + hSampleIdx * HID_STEP;
              return OUTPUT_SAMPLES.map((_, o) => {
                const oY = OUT_Y0 + o * OUT_STEP;
                const isTarget = o === 3;
                return (
                  <line key={`l2-${hIndex}-${o}`}
                    x1={HID_X} y1={hY} x2={OUT_X} y2={oY}
                    stroke={isTarget ? 'var(--signal-coral)' : 'rgba(255,255,255,0.03)'}
                    strokeOpacity={isTarget ? 0.35 : 0.08}
                    strokeWidth={isTarget ? 1.8 : 0.8}
                  />
                );
              });
            })}

            {/* Static Connections: Input -> Hidden */}
            {INPUT_SAMPLES.map((_, sIdx) => {
              const iY = IN_Y0 + sIdx * IN_STEP;
              return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
                if (hIndex === -1) return null;
                const hY = HID_Y0 + hSampleIdx * HID_STEP;
                const isActive = hSampleIdx % 3 === 0;
                return (
                  <line key={`l1-${sIdx}-${hIndex}`}
                    x1={IN_X} y1={iY} x2={HID_X} y2={hY}
                    stroke={isActive ? 'var(--signal-coral)' : 'rgba(255,255,255,0.03)'}
                    strokeOpacity={isActive ? 0.30 : 0.08}
                    strokeWidth={isActive ? 1.5 : 0.7}
                  />
                );
              });
            })}

            {/* Backward flowing error pulses (Right to Left, i.e. OUT -> HID -> IN) */}
            {!shouldReduceMotion && progress > 0.05 && progress < 0.75 &&
              Array.from({ length: N_PULSES }).map((_, pulseIdx) => {
                const offset = pulseIdx / N_PULSES;
                const t = ((progress * 2.2 + offset) % 1);
                const phase = progress < 0.38 ? 'outToHidden' : 'hiddenToInput';

                if (phase === 'outToHidden') {
                  return HIDDEN_SAMPLES.filter((h, hi) => h !== -1 && hi % 3 === 0).map((_, idx) => {
                    const hi = idx * 3;
                    const hY = HID_Y0 + hi * HID_STEP;
                    const oY = OUT_Y0 + 3 * OUT_STEP;
                    // Pulse moves from OUT_X to HID_X
                    const px = OUT_X - (OUT_X - HID_X) * t;
                    const py = oY - (oY - hY) * t;
                    return (
                      <circle key={`p2-${pulseIdx}-${idx}`} cx={px} cy={py} r={4.5}
                        fill="var(--signal-coral)" filter="url(#grad-glow)" opacity={Math.max(0, 0.8 - pulseIdx * 0.1)}
                      />
                    );
                  });
                } else {
                  return INPUT_SAMPLES.map((_, sIdx) => {
                    const iY = IN_Y0 + sIdx * IN_STEP;
                    const hY = HID_Y0 + 3 * HID_STEP;
                    // Pulse moves from HID_X to IN_X
                    const px = HID_X - (HID_X - IN_X) * t;
                    const py = hY - (hY - iY) * t;
                    return (
                      <circle key={`p1-${pulseIdx}-${sIdx}`} cx={px} cy={py} r={4.5}
                        fill="var(--signal-coral)" filter="url(#grad-glow)" opacity={Math.max(0, 0.8 - pulseIdx * 0.1)}
                      />
                    );
                  });
                }
              })
            }

            {/* Input layer nodes (Radius = 10) */}
            {INPUT_SAMPLES.map((_, sIdx) => {
              const y = IN_Y0 + sIdx * IN_STEP;
              const active = progress > 0.45 && progress < 0.8;
              return (
                <g key={`in-${sIdx}`}>
                  <circle cx={IN_X} cy={y} r={10} fill="#111827"
                    stroke={active ? 'var(--signal-coral)' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={active ? 2.0 : 1.2}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                  <text x={IN_X - 16} y={y + 3.5} fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="end">x[{sIdx}]</text>
                </g>
              );
            })}

            {/* Hidden layer nodes (Radius = 11) */}
            {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              const y = HID_Y0 + hSampleIdx * HID_STEP;
              if (hIndex === -1) {
                const midY = HID_Y0 + 5.3 * HID_STEP;
                return (
                  <g key="ellipsis">
                    <circle cx={HID_X} cy={midY - 6} r={1.5} fill="rgba(255,255,255,0.3)" />
                    <circle cx={HID_X} cy={midY} r={1.5} fill="rgba(255,255,255,0.3)" />
                    <circle cx={HID_X} cy={midY + 6} r={1.5} fill="rgba(255,255,255,0.3)" />
                  </g>
                );
              }
              const active = progress > 0.25 && progress < 0.6;
              return (
                <g key={`h-${hIndex}`}>
                  <circle cx={HID_X} cy={y} r={11} fill="#111827"
                    stroke={active ? 'var(--signal-coral)' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={active ? 2.0 : 1.2}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                  <text x={HID_X - 16} y={y + 3.5} fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="end">h[{hIndex}]</text>
                </g>
              );
            })}

            {/* Output layer nodes (Radius = 15) */}
            {OUTPUT_SAMPLES.map((_, o) => {
              const y = OUT_Y0 + o * OUT_STEP;
              const isTarget = o === 3;
              const active = progress < 0.35 && isTarget;
              return (
                <g key={`out-${o}`}>
                  <circle cx={OUT_X} cy={y} r={15}
                    fill={isTarget ? 'rgba(239,68,68,0.1)' : '#111827'}
                    stroke={isTarget ? 'var(--signal-coral)' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={isTarget ? 2.2 : 1.2}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                  <text x={OUT_X} y={y} fill={isTarget ? 'var(--signal-coral)' : 'rgba(255,255,255,0.4)'}
                    fontSize={12} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {o}
                  </text>
                </g>
              );
            })}

            {/* Layer headers */}
            <text x={IN_X}  y={22} fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="bold" textAnchor="middle">Input</text>
            <text x={HID_X} y={22} fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="bold" textAnchor="middle">Hidden</text>
            <text x={OUT_X} y={22} fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="bold" textAnchor="middle">Error</text>
          </svg>
        </div>

        {/* Right Column: Training Loss Canvas + Kernel Updates + Math */}
        <div className="flex flex-col gap-4 self-stretch justify-center h-full">
          
          {/* Training Loss curve */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl flex flex-col gap-2.5">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Training Loss Curve</span>
            <canvas ref={lossCanvasRef} width={180} height={90}
              className="rounded-lg bg-black/40 border border-white/5 w-full"
            />
          </div>

          {/* 3x3 Kernel updates */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-1">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Weights (Conv2D)</span>
              <span className="text-[8px] font-mono text-aurora-mint uppercase">
                {progress < 0.35 ? 'Hold' : progress < 0.90 ? 'Updating' : 'Learned'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-black border border-white/5 rounded-lg w-full h-32">
              {currentKernel.map((val, idx) => {
                const isUpdating = progress >= 0.35 && progress < 0.90;
                const dir = gradientDirections[idx];
                return (
                  <div key={idx}
                    className={`flex flex-col items-center justify-center rounded text-[9px] font-bold border transition-all duration-150 relative ${
                      isUpdating
                        ? 'bg-aurora-mint/10 border-aurora-mint/45 text-aurora-mint'
                        : 'bg-black border-white/5 text-white/60'
                    }`}
                  >
                    <span>{val.toFixed(1)}</span>
                    {isUpdating && (
                      <span className={`absolute bottom-0.5 right-1 text-[7px] font-bold ${dir === '↑' ? 'text-aurora-mint' : 'text-signal-coral'}`}>
                        {dir}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gradient descent formula */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-xl flex flex-col gap-2">
            <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Weight Updates</span>
            <div className="text-center font-mono py-1 rounded bg-black border border-white/5">
              <AnimatedFormula
                formula="W ← W − η · ∂L/∂W"
                progress={remap(progress, 0.4, 0.85, 0, 1)}
                color="#f87171"
                fontSize="0.85rem"
              />
            </div>
            <p className="text-[8px] text-white/30 font-mono leading-relaxed text-center">
              ∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
