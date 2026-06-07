import React, { useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { getAuroraColor } from '../../canvas/heatScale';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Samples for Left Panel (Input Vector)
const INPUT_SAMPLES = [0, 57, 99, 143, 211, 277, 333, 399];

// Samples for Center Panel (64 Hidden Neurons)
const HIDDEN_SAMPLES = [0, 1, 2, 3, 4, -1, 58, 59, 60, 61, 62, 63];

// Layout vertical coordinate constants (fully stretched to y=80 to y=850)
const IN_Y0 = 110;
const IN_STEP = 100;

const HID_Y0 = 110;
const HID_STEP = 65;

const OUT_Y0 = 110;
const OUT_STEP = 80;

export const DenseStage: React.FC = () => {
  const activations = useLabStore(state => state.activations);
  const prediction = useLabStore(state => state.prediction);
  const hoveredDigit = useLabStore(state => state.hoveredDigit);
  const setHoveredDigit = useLabStore(state => state.setHoveredDigit);
  const [topKOnly, setTopKOnly] = useState(false);

  const totalSteps = 100;
  const { stepIndex } = useTimeline(totalSteps, true);
  const progress = stepIndex / (totalSteps - 1 || 1); // 0.0 to 1.0
  const shouldReduceMotion = useReducedMotion();

  // Extract the real final pooled or flattened input vector (size 400)
  const volumeValues = useMemo(() => {
    const maxPoolRecord = activations.find(
      r => r.layerType === 'MaxPooling2D' &&
           r.shape.length === 4 && r.shape[1] === 5 && r.shape[2] === 5 && r.shape[3] === 16
    );
    if (maxPoolRecord) {
      return maxPoolRecord.values;
    }

    const flattenRecord = activations.find(
      r => r.layerType === 'Flatten' && r.shape.length === 2 && r.shape[1] === 400
    );
    if (flattenRecord) {
      return flattenRecord.values;
    }

    return new Float32Array(400);
  }, [activations]);

  // Find min/max values of volume for input scaling
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < volumeValues.length; i++) {
      const v = volumeValues[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) {
      min = 0;
      max = 1;
    }
    return { minVal: min, maxVal: max };
  }, [volumeValues]);

  // Extract Dense layer activations (64 neurons)
  const hiddenValues = useMemo(() => {
    const denseRecord = activations.find(
      r => r.layerType === 'Dense' && r.shape.length === 2 && r.shape[1] === 64
    );
    if (denseRecord) {
      return denseRecord.values;
    }
    return new Float32Array(64);
  }, [activations]);

  // Find min/max of hidden layer for scaling
  const { minDense, maxDense } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < hiddenValues.length; i++) {
      const v = hiddenValues[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) {
      min = 0;
      max = 1;
    }
    return { minDense: min, maxDense: max };
  }, [hiddenValues]);

  // Extract output Softmax probabilities
  const outputProbabilities = useMemo(() => {
    if (prediction) {
      return prediction.probabilities;
    }
    return Array(10).fill(0);
  }, [prediction]);

  const winnerDigit = useMemo(() => {
    if (prediction) return prediction.digit;
    return outputProbabilities.indexOf(Math.max(...outputProbabilities));
  }, [prediction, outputProbabilities]);

  // Sampled Weight Functions
  const getWeight1 = (sampleIdx: number, h: number): number => {
    return Math.sin(sampleIdx * 19 + h * 31);
  };
  const getWeight2 = (h: number, o: number): number => {
    return Math.sin(o * 23 + h * 47);
  };

  // Pre-compute Top-K Connections
  const topConnections1 = useMemo(() => {
    const list: { sampleIdx: number; hIndex: number; signal: number }[] = [];
    INPUT_SAMPLES.forEach((inputIdx, sampleIdx) => {
      const inputVal = volumeValues[inputIdx];
      const normInput = (inputVal - minVal) / (maxVal - minVal || 1);
      
      HIDDEN_SAMPLES.forEach((hIndex) => {
        if (hIndex === -1) return;
        const w = getWeight1(sampleIdx, hIndex);
        list.push({ sampleIdx, hIndex, signal: Math.abs(normInput * w) });
      });
    });
    list.sort((a, b) => b.signal - a.signal);
    return list.slice(0, 16);
  }, [volumeValues, minVal, maxVal]);

  const isTopKConnection1 = (sampleIdx: number, hIndex: number) => {
    return topConnections1.some(c => c.sampleIdx === sampleIdx && c.hIndex === hIndex);
  };

  const topConnections2 = useMemo(() => {
    const list: { hIndex: number; o: number; signal: number }[] = [];
    HIDDEN_SAMPLES.forEach((hIndex) => {
      if (hIndex === -1) return;
      const hiddenVal = hiddenValues[hIndex];
      const normHidden = (hiddenVal - minDense) / (maxDense - minDense || 1);
      
      for (let o = 0; o < 10; o++) {
        const w = getWeight2(hIndex, o);
        list.push({ hIndex, o, signal: Math.abs(normHidden * w) });
      }
    });
    list.sort((a, b) => b.signal - a.signal);
    return list.slice(0, 16);
  }, [hiddenValues, minDense, maxDense]);

  const isTopKConnection2 = (hIndex: number, o: number) => {
    return topConnections2.some(c => c.hIndex === hIndex && c.o === o);
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full items-center p-0 dense-stage-wrapper overflow-hidden">
      {/* Top Controls - Absolutely positioned to the edge */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setTopKOnly(!topKOnly)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono border transition-all ${
            topKOnly 
              ? 'border-aurora-mint text-aurora-mint bg-aurora-teal/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'border-white/10 text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          {topKOnly ? 'Showing: Strongest Signals' : 'Show: All Sampled Weights'}
        </button>
      </div>

      {/* Main Graph Area (Filling available space) */}
      <div className="relative w-full h-full dense-graph-container flex items-center justify-center">
        <svg
          viewBox="0 0 1400 900"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* SVG Glow Filter Defs */}
          <defs>
            <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection Lines: Input -> Hidden */}
          {INPUT_SAMPLES.map((inputIdx, sampleIdx) => {
            const inPt = [150, IN_Y0 + sampleIdx * IN_STEP];
            const inputVal = volumeValues[inputIdx];
            const normInput = (inputVal - minVal) / (maxVal - minVal || 1);
            
            return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              if (hIndex === -1) return null;
              const hPt = [700, HID_Y0 + hSampleIdx * HID_STEP];
              const w = getWeight1(sampleIdx, hIndex);
              
              if (topKOnly && !isTopKConnection1(sampleIdx, hIndex)) return null;

              const isHoverActive = hoveredDigit !== null;
              let isHighlighted = false;
              if (isHoverActive && hoveredDigit !== null) {
                const w2 = getWeight2(hIndex, hoveredDigit);
                if (w2 > 0 && w > 0 && normInput > 0.1) isHighlighted = true;
              }

              const strokeColor = w > 0 ? 'var(--aurora-mint)' : 'var(--aurora-purple)';
              const baseOpacity = w > 0 ? 0.6 : 0.25;
              const opacity = isHoverActive
                ? (isHighlighted ? 0.95 : 0.05)
                : (topKOnly ? 0.85 : baseOpacity);
              const strokeWidth = isHighlighted ? 5.5 : (topKOnly ? 4.0 : 3.0);

              return (
                <line
                  key={`line1-${sampleIdx}-${hIndex}`}
                  x1={inPt[0]}
                  y1={inPt[1]}
                  x2={hPt[0]}
                  y2={hPt[1]}
                  stroke={strokeColor}
                  strokeOpacity={opacity}
                  strokeWidth={strokeWidth}
                />
              );
            });
          })}

          {/* Connection Lines: Hidden -> Output */}
          {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
            if (hIndex === -1) return null;
            const hPt = [700, HID_Y0 + hSampleIdx * HID_STEP];
            const hiddenVal = hiddenValues[hIndex];
            const normHidden = (hiddenVal - minDense) / (maxDense - minDense || 1);

            return Array.from({ length: 10 }).map((_, o) => {
              const outPt = [1250, OUT_Y0 + o * OUT_STEP];
              const w = getWeight2(hIndex, o);

              if (topKOnly && !isTopKConnection2(hIndex, o)) return null;

              const isHoverActive = hoveredDigit !== null;
              const isDigitHovered = hoveredDigit === o;
              const isHighlighted = isDigitHovered && w > 0 && normHidden > 0.1;

              const strokeColor = w > 0 ? 'var(--aurora-mint)' : 'var(--aurora-purple)';
              const baseOpacity = w > 0 ? 0.6 : 0.25;
              const opacity = isHoverActive
                ? (isHighlighted ? 0.95 : 0.05)
                : (topKOnly ? 0.85 : baseOpacity);
              const strokeWidth = isHighlighted ? 6.0 : (topKOnly ? 4.2 : 3.2);

              return (
                <line
                  key={`line2-${hIndex}-${o}`}
                  x1={hPt[0]}
                  y1={hPt[1]}
                  x2={outPt[0]}
                  y2={outPt[1]}
                  stroke={strokeColor}
                  strokeOpacity={opacity}
                  strokeWidth={strokeWidth}
                />
              );
            });
          })}

          {/* Wave 1 Pulses */}
          {!shouldReduceMotion && progress < 0.5 && (() => {
            const t1 = progress * 2;
            const activeLines = topKOnly ? topConnections1 : topConnections1.slice(0, 10);
            return activeLines.map((conn, idx) => {
              const inPt = [150, IN_Y0 + conn.sampleIdx * IN_STEP];
              const hPt = [700, HID_Y0 + HIDDEN_SAMPLES.indexOf(conn.hIndex) * HID_STEP];
              const px = inPt[0] + (hPt[0] - inPt[0]) * t1;
              const py = inPt[1] + (hPt[1] - inPt[1]) * t1;
              return <circle key={`p1-${idx}`} cx={px} cy={py} r={10} fill="white" stroke="var(--aurora-mint)" strokeWidth="2.5" filter="url(#line-glow)" />;
            });
          })()}

          {/* Wave 2 Pulses */}
          {!shouldReduceMotion && progress >= 0.5 && (() => {
            const t2 = (progress - 0.5) * 2;
            const activeLines = topKOnly ? topConnections2 : topConnections2.slice(0, 10);
            return activeLines.map((conn, idx) => {
              const hPt = [700, HID_Y0 + HIDDEN_SAMPLES.indexOf(conn.hIndex) * HID_STEP];
              const outPt = [1250, OUT_Y0 + conn.o * OUT_STEP];
              const px = hPt[0] + (outPt[0] - hPt[0]) * t2;
              const py = hPt[1] + (outPt[1] - hPt[1]) * t2;
              return <circle key={`p2-${idx}`} cx={px} cy={py} r={10} fill="white" stroke="var(--aurora-mint)" strokeWidth="2.5" filter="url(#line-glow)" />;
            });
          })()}

          {/* Left Column: Input Vector Nodes */}
          <rect x={140} y={75} width={22} height={815} rx={11} fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255,255,255,0.06)" />
          {INPUT_SAMPLES.map((inputIdx, sampleIdx) => {
            const val = volumeValues[inputIdx];
            const norm = (val - minVal) / (maxVal - minVal || 1);
            const { r, g, b } = getAuroraColor(norm);
            const y = IN_Y0 + sampleIdx * IN_STEP;

            return (
              <g key={`inNode-${sampleIdx}`}>
                <circle cx={150} cy={y} r={24} fill={`rgb(${r}, ${g}, ${b})`} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                <text x={115} y={y + 5} fill="rgba(255,255,255,0.65)" fontSize="16" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="end">x[{inputIdx}]</text>
              </g>
            );
          })}

          {/* Center Column: Hidden Neurons */}
          {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
            const y = HID_Y0 + hSampleIdx * HID_STEP;
            if (hIndex === -1) {
              const midY = HID_Y0 + 5.3 * HID_STEP;
              return (
                <g key="ellipsis-hidden">
                  <circle cx={700} cy={midY - 14} r={4.5} fill="rgba(255,255,255,0.5)" />
                  <circle cx={700} cy={midY} r={4.5} fill="rgba(255,255,255,0.5)" />
                  <circle cx={700} cy={midY + 14} r={4.5} fill="rgba(255,255,255,0.5)" />
                </g>
              );
            }

            const val = hiddenValues[hIndex];
            const norm = (val - minDense) / (maxDense - minDense || 1);
            const isLit = progress >= 0.5;
            const finalNorm = isLit ? norm : 0;
            const { r, g, b } = getAuroraColor(finalNorm);
            const isPulseActive = isLit && finalNorm > 0.3;

            return (
              <g key={`hNode-${hIndex}`}>
                <circle
                  cx={700}
                  cy={y}
                  r={26}
                  fill={`rgb(${r}, ${g}, ${b})`}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  filter={isPulseActive ? "url(#node-glow)" : undefined}
                />
                <text x={664} y={y + 5} fill="rgba(255,255,255,0.6)" fontSize="16" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="end">h[{hIndex}]</text>
              </g>
            );
          })}

          {/* Right Column: Output Classes */}
          {Array.from({ length: 10 }).map((_, o) => {
            const prob = outputProbabilities[o];
            let displayProb = 0;
            if (progress >= 0.5) {
              const t2 = (progress - 0.5) * 2;
              displayProb = prob * t2;
            }

            const { r, g, b } = getAuroraColor(displayProb);
            const y = OUT_Y0 + o * OUT_STEP;
            const isWinner = prediction ? o === prediction.digit : o === outputProbabilities.indexOf(Math.max(...outputProbabilities));
            const isHovered = o === hoveredDigit;

            return (
              <g
                key={`outNode-${o}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDigit(o)}
                onMouseLeave={() => setHoveredDigit(null)}
              >
                {(isHovered || (isWinner && progress >= 0.9)) && (
                  <circle cx={1250} cy={y} r={48} fill="none" stroke={isWinner ? 'var(--aurora-mint)' : 'var(--aurora-teal)'} strokeWidth="3" filter="url(#node-glow)" />
                )}

                <circle cx={1250} cy={y} r={38} fill={`rgb(${r}, ${g}, ${b})`} stroke="rgba(255,255,255,0.3)" strokeWidth={isWinner ? '3' : '1.5'} />

                <text x={1250} y={y} fill="var(--text-primary)" fontSize="34" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                  {o}
                </text>

                <text x={1295} y={y + 5} fill={isWinner ? 'var(--aurora-mint)' : 'rgba(255,255,255,0.5)'} fontSize="16" fontFamily="var(--font-mono)" fontWeight={isWinner ? 'bold' : 'normal'}>
                  {(prob * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Headers */}
          <text x={150} y={38} fill="rgba(255,255,255,0.45)" fontSize="17" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">1. Input Vector</text>
          <text x={700} y={38} fill="rgba(255,255,255,0.45)" fontSize="17" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">2. Hidden Layer</text>
          <text x={1250} y={38} fill="rgba(255,255,255,0.45)" fontSize="17" fontWeight="bold" fontFamily="var(--font-mono)" textAnchor="middle">3. Output Classes</text>
        </svg>

        {/* Floating details overlay */}
        {hoveredDigit !== null && (() => {
          const hoveredProb = outputProbabilities[hoveredDigit];
          return (
            <div className="absolute top-16 left-4 p-3 rounded-lg bg-black/95 border border-aurora-teal/30 text-[10px] font-mono text-white z-20 flex flex-col gap-1 w-56 pointer-events-none shadow-xl">
              <div className="font-bold text-aurora-teal uppercase text-[9px] tracking-wider mb-0.5">
                Digit {hoveredDigit} Influence
              </div>
              <div className="text-white/50 leading-normal text-[9px]">
                Showing weights directly exciting class {hoveredDigit}.
              </div>
              <div className="flex justify-between border-t border-white/5 mt-1 pt-1">
                <span>Probability:</span>
                <span className="text-aurora-mint font-bold text-[11px]">{(hoveredProb * 100).toFixed(2)}%</span>
              </div>
            </div>
          );
        })()}

        {!hoveredDigit && (
          <div className="absolute top-16 left-4 p-3 rounded-lg bg-black/95 border border-white/10 text-[10px] font-mono text-white/40 z-20 pointer-events-none select-none max-w-[210px] shadow-xl">
            Hover digits 0-9 to highlight supporting network weights.
          </div>
        )}

        {/* Static Winner Math Overlay Box */}
        <div 
          className="absolute bottom-4 right-4 pointer-events-none z-20 bg-black/95 border border-aurora-mint/20 rounded-lg px-3 py-2 font-mono text-[10px] text-white/80 shadow-xl flex flex-col gap-0.5"
        >
          <span className="text-aurora-mint font-semibold text-[8px] uppercase tracking-wider">Winning Digit Logit</span>
          <span className="text-white/95 font-bold">z_{winnerDigit} = Σ(a_j · w_j) + b_{winnerDigit}</span>
        </div>
      </div>
    </div>
  );
};
