import React, { useMemo, useState } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { useTimeline } from '../../animations/useTimeline';
import { TimelineStepper } from '../../components/TimelineStepper';
import { getAuroraColor } from '../../canvas/heatScale';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Samples for Left Panel (Input Vector)
const INPUT_SAMPLES = [0, 57, 99, 143, 211, 277, 333, 399];

// Samples for Center Panel (64 Hidden Neurons)
// Render 12 nodes total, with index -1 as the ellipsis divider
const HIDDEN_SAMPLES = [0, 1, 2, 3, 4, -1, 58, 59, 60, 61, 62, 63];

export const DenseStage: React.FC = () => {
  const activations = useLabStore(state => state.activations);
  const prediction = useLabStore(state => state.prediction);
  const hoveredDigit = useLabStore(state => state.hoveredDigit);
  const setHoveredDigit = useLabStore(state => state.setHoveredDigit);
  const [topKOnly, setTopKOnly] = useState(false);

  const totalSteps = 100;
  const { stepIndex, seek, play } = useTimeline(totalSteps, true);
  const progress = stepIndex / (totalSteps - 1 || 1); // 0.0 to 1.0
  const shouldReduceMotion = useReducedMotion();

  // 1. Extract the real final pooled or flattened input vector (size 400)
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

  // 2. Extract or generate Hidden Dense layer activations (64 neurons)
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

  // 3. Extract or generate output Softmax probabilities (10 classes)
  const outputProbabilities = useMemo(() => {
    if (prediction) {
      return prediction.probabilities;
    }

    return Array(10).fill(0);
  }, [prediction]);

  // 4. Sampled Weight Functions
  const getWeight1 = (sampleIdx: number, h: number): number => {
    return Math.sin(sampleIdx * 19 + h * 31);
  };
  const getWeight2 = (h: number, o: number): number => {
    return Math.sin(o * 23 + h * 47);
  };

  // 5. Pre-compute Top-K Connections
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
    return list.slice(0, 16); // Top 16 strongest input-to-hidden signals
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
    return list.slice(0, 16); // Top 16 strongest hidden-to-output signals
  }, [hiddenValues, minDense, maxDense]);

  const isTopKConnection2 = (hIndex: number, o: number) => {
    return topConnections2.some(c => c.hIndex === hIndex && c.o === o);
  };

  // Replay signal pulse helper
  const handleReplayPulse = () => {
    // Reset timeline step to 0 and trigger play
    seek(0);
    play();
  };

  return (
    <div className="flex flex-col gap-5 w-full items-center">
      
      {/* Top action header for toggle and replay */}
      <div className="flex justify-between w-full max-w-[800px] items-center px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTopKOnly(!topKOnly)}
            className={`btn-secondary text-[11px] py-1 px-3 border transition-colors ${
              topKOnly 
                ? 'border-aurora-mint text-aurora-mint bg-aurora-teal/10' 
                : 'border-border-muted text-text-secondary'
            }`}
          >
            {topKOnly ? 'Showing: Top Signals Only' : 'Show: All Sampled Connections'}
          </button>
          
          <button
            onClick={handleReplayPulse}
            className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1.5"
          >
            Replay signal
          </button>
        </div>
        
        <div className="text-[10px] text-text-muted font-mono italic">
          * Representative sampled view
        </div>
      </div>

      {/* Main Visualizer Board */}
      <div className="relative w-full max-w-[800px] aspect-[800/460] bg-bg-canvas rounded border border-border-muted overflow-hidden">

        {/* SVG Node and Link Layout */}
        <svg
          viewBox="0 0 800 460"
          className="absolute inset-0 w-full h-full select-none z-10"
        >
          {/* 1. Connection lines: Input -> Hidden */}
          {INPUT_SAMPLES.map((inputIdx, sampleIdx) => {
            const inPt = [90, 80 + sampleIdx * 40];
            const inputVal = volumeValues[inputIdx];
            const normInput = (inputVal - minVal) / (maxVal - minVal || 1);
            
            return HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
              if (hIndex === -1) return null;
              
              const hPt = [390, 80 + hSampleIdx * 26];
              const w = getWeight1(sampleIdx, hIndex);
              
              // Top-K filtering
              if (topKOnly && !isTopKConnection1(sampleIdx, hIndex)) return null;

              // Hover evidenct highlights
              const isHoverActive = hoveredDigit !== null;
              let isHighlighted = false;
              if (isHoverActive && hoveredDigit !== null) {
                // Connection highlighted if this hidden neuron hIndex maps positively to hoveredDigit
                const w2 = getWeight2(hIndex, hoveredDigit);
                if (w2 > 0 && w > 0 && normInput > 0.1) {
                  isHighlighted = true;
                }
              }

              const strokeColor = w > 0 ? 'var(--aurora-mint)' : 'var(--aurora-purple)';
              const baseOpacity = w > 0 ? 0.22 : 0.08;
              const opacity = isHoverActive
                ? (isHighlighted ? 0.75 : 0.02)
                : (topKOnly ? 0.6 : baseOpacity);
              const strokeWidth = isHighlighted ? 1.6 : (topKOnly ? 1.2 : 0.8);

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

          {/* 2. Connection lines: Hidden -> Output */}
          {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
            if (hIndex === -1) return null;
            
            const hPt = [390, 80 + hSampleIdx * 26];
            const hiddenVal = hiddenValues[hIndex];
            const normHidden = (hiddenVal - minDense) / (maxDense - minDense || 1);

            return Array.from({ length: 10 }).map((_, o) => {
              const outPt = [680, 85 + o * 30];
              const w = getWeight2(hIndex, o);

              // Top-K filtering
              if (topKOnly && !isTopKConnection2(hIndex, o)) return null;

              // Hover evidence highlights
              const isHoverActive = hoveredDigit !== null;
              const isDigitHovered = hoveredDigit === o;
              // Highlighted if connecting directly to hovered digit with positive weight (supporting evidence)
              const isHighlighted = isDigitHovered && w > 0 && normHidden > 0.1;

              const strokeColor = w > 0 ? 'var(--aurora-mint)' : 'var(--aurora-purple)';
              const baseOpacity = w > 0 ? 0.22 : 0.08;
              const opacity = isHoverActive
                ? (isHighlighted ? 0.85 : 0.02)
                : (topKOnly ? 0.65 : baseOpacity);
              const strokeWidth = isHighlighted ? 1.8 : (topKOnly ? 1.3 : 0.85);

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

          {/* 3. Signal Flow Pulse Waves */}
          {/* Wave 1: Input -> Hidden (progress: 0.0 to 0.5) */}
          {!shouldReduceMotion && progress < 0.5 && (() => {
            const t1 = progress * 2;
            const activeLines = topKOnly ? topConnections1 : topConnections1.slice(0, 10);
            
            return activeLines.map((conn, idx) => {
              const inPt = [90, 80 + conn.sampleIdx * 40];
              const hPt = [390, 80 + HIDDEN_SAMPLES.indexOf(conn.hIndex) * 26];
              
              const px = inPt[0] + (hPt[0] - inPt[0]) * t1;
              const py = inPt[1] + (hPt[1] - inPt[1]) * t1;
              
              return (
                <circle
                  key={`p1-${idx}`}
                  cx={px}
                  cy={py}
                  r={3.5}
                  fill="white"
                  stroke="var(--bg-canvas)"
                  strokeWidth="1"
                />
              );
            });
          })()}

          {/* Wave 2: Hidden -> Output (progress: 0.5 to 1.0) */}
          {!shouldReduceMotion && progress >= 0.5 && (() => {
            const t2 = (progress - 0.5) * 2;
            const activeLines = topKOnly ? topConnections2 : topConnections2.slice(0, 10);
            
            return activeLines.map((conn, idx) => {
              const hPt = [390, 80 + HIDDEN_SAMPLES.indexOf(conn.hIndex) * 26];
              const outPt = [680, 85 + conn.o * 30];
              
              const px = hPt[0] + (outPt[0] - hPt[0]) * t2;
              const py = hPt[1] + (outPt[1] - hPt[1]) * t2;
              
              return (
                <circle
                  key={`p2-${idx}`}
                  cx={px}
                  cy={py}
                  r={3.5}
                  fill="white"
                  stroke="var(--bg-canvas)"
                  strokeWidth="1"
                />
              );
            });
          })()}

          {/* 4. Left Column: Input Vector Nodes */}
          {/* Dense vector background strip */}
          <rect x={86} y={75} width={8} height={290} rx={4} fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255,255,255,0.06)" />
          {INPUT_SAMPLES.map((inputIdx, sampleIdx) => {
            const val = volumeValues[inputIdx];
            const norm = (val - minVal) / (maxVal - minVal || 1);
            const { r, g, b } = getAuroraColor(norm);
            const y = 80 + sampleIdx * 40;

            return (
              <g key={`inNode-${sampleIdx}`}>
                <circle
                  cx={90}
                  cy={y}
                  r={7}
                  fill={`rgb(${r}, ${g}, ${b})`}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1"
                />
                {/* Node info tooltip */}
                <text x={75} y={y + 3} fill="var(--text-secondary)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="end">
                  x[{inputIdx}]
                </text>
              </g>
            );
          })}

          {/* 5. Center Column: Hidden Neurons */}
          {HIDDEN_SAMPLES.map((hIndex, hSampleIdx) => {
            const y = 80 + hSampleIdx * 26;
            
            // Draw Ellipsis
            if (hIndex === -1) {
              return (
                <g key="ellipsis-hidden">
                  <circle cx={390} cy={195} r={1.5} fill="var(--text-muted)" />
                  <circle cx={390} cy={201} r={1.5} fill="var(--text-muted)" />
                  <circle cx={390} cy={207} r={1.5} fill="var(--text-muted)" />
                </g>
              );
            }

            const val = hiddenValues[hIndex];
            const norm = (val - minDense) / (maxDense - minDense || 1);
            
            // During Wave 1, nodes only light up after progress reaches 50%
            const isLit = progress >= 0.5;
            const finalNorm = isLit ? norm : 0;
            const { r, g, b } = getAuroraColor(finalNorm);

            return (
              <g key={`hNode-${hIndex}`}>
                <circle
                  cx={390}
                  cy={y}
                  r={8}
                  fill={`rgb(${r}, ${g}, ${b})`}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="1.2"
                />
                <text x={375} y={y + 3.5} fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)" textAnchor="end">
                  h[{hIndex}]
                </text>
              </g>
            );
          })}

          {/* 6. Right Column: Output Digit Classes */}
          {Array.from({ length: 10 }).map((_, o) => {
            const prob = outputProbabilities[o];
            // Output nodes light up progressively during Wave 2
            let displayProb = 0;
            if (progress >= 0.5) {
              const t2 = (progress - 0.5) * 2;
              displayProb = prob * t2;
            }
            
            const { r, g, b } = getAuroraColor(displayProb);
            const y = 85 + o * 30;
            const isWinner = prediction ? o === prediction.digit : o === outputProbabilities.indexOf(Math.max(...outputProbabilities));
            const isHovered = o === hoveredDigit;

            return (
              <g 
                key={`outNode-${o}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDigit(o)}
                onMouseLeave={() => setHoveredDigit(null)}
              >
                {/* Node Ring highlight on hover or win */}
                {(isHovered || (isWinner && progress >= 0.9)) && (
                  <circle
                    cx={680}
                    cy={y}
                    r={16}
                    fill="none"
                    stroke={isWinner ? 'var(--aurora-mint)' : 'var(--aurora-teal)'}
                    strokeWidth="1.5"
                  />
                )}
                
                {/* Base Node */}
                <circle
                  cx={680}
                  cy={y}
                  r={12}
                  fill={`rgb(${r}, ${g}, ${b})`}
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth={isWinner ? '1.5' : '1'}
                />
                
                {/* Digit Label inside circle */}
                <text
                  x={680}
                  y={y}
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {o}
                </text>

                {/* Percentage label next to node */}
                <text
                  x={705}
                  y={y + 3.5}
                  fill={isWinner ? 'var(--aurora-mint)' : 'var(--text-muted)'}
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight={isWinner ? 'bold' : 'normal'}
                >
                  {(prob * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Section Headers */}
          <text x={90} y={45} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-sans)" fontWeight="bold" textAnchor="middle">1. Flattened (Sampled)</text>
          <text x={390} y={45} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-sans)" fontWeight="bold" textAnchor="middle">2. Hidden Layer (ReLU)</text>
          <text x={680} y={45} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-sans)" fontWeight="bold" textAnchor="middle">3. Logits / Softmax</text>
        </svg>

        {/* Hover telemetry helper cards inside visual area */}
        {hoveredDigit !== null && (() => {
          const hoveredProb = outputProbabilities[hoveredDigit];
          return (
            <div 
              className="absolute top-4 left-4 p-3 rounded bg-bg-card border border-aurora-teal/30 text-[11px] font-mono text-text-primary z-20 flex flex-col gap-1 w-52 select-none pointer-events-none"
            >
              <div className="border-b border-border-muted pb-1 mb-1 font-bold text-aurora-teal uppercase tracking-wider text-[10px]">
                Digit Class {hoveredDigit} Evidence
              </div>
              <div className="text-text-secondary leading-relaxed text-[10px]">
                Highlighting connections contributing <strong className="text-aurora-mint">positive weights</strong> to final score.
              </div>
              <div className="flex justify-between border-t border-border-subtle mt-1.5 pt-1.5">
                <span>Probability:</span>
                <span className="text-aurora-mint font-bold">{(hoveredProb * 100).toFixed(2)}%</span>
              </div>
            </div>
          );
        })()}

        {!hoveredDigit && (
          <div className="absolute top-4 left-4 p-2.5 rounded bg-bg-card border border-border-muted text-[10px] font-mono text-text-secondary z-20 pointer-events-none select-none max-w-[210px]">
            Hover output digit circles (0-9) to highlight their supporting evidence path.
          </div>
        )}

        {/* Educational label indicator */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none">
          <div className="text-[9px] font-mono text-text-muted bg-bg-deep/80 px-2 py-1 rounded border border-border-subtle">
            Simplified sampled view of dense connections
          </div>
        </div>
      </div>

      {/* Progress & Stepper controls */}
      <div className="w-full max-w-[800px] flex flex-col items-center gap-4">
        <TimelineStepper stageTotalSteps={totalSteps} />
        
        {/* Math equation card */}
        <div className="bg-bg-deep border border-border-subtle p-3.5 rounded flex flex-col gap-2 w-full font-mono text-center relative overflow-hidden">
          <div className="text-[9px] uppercase tracking-wider text-text-muted absolute top-1 left-2 font-display">
            Math Equations
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center py-2 mt-1">
            <div className="text-text-primary text-[11px] bg-bg-panel/80 px-3 py-1.5 rounded border border-border-muted flex flex-col gap-0.5">
              <span className="text-text-muted text-[9px] uppercase">1. Hidden Layer</span>
              <span className="text-aurora-purple font-semibold">a = ReLU(W₁x + b₁)</span>
            </div>
            <div className="text-text-primary text-[11px] bg-bg-panel/80 px-3 py-1.5 rounded border border-border-muted flex flex-col gap-0.5">
              <span className="text-text-muted text-[9px] uppercase">2. Output logits</span>
              <span className="text-aurora-mint font-semibold">logits = W₂a + b₂</span>
            </div>
          </div>
          <p className="text-[9px] text-text-muted max-w-lg mx-auto leading-relaxed border-t border-border-subtle/50 pt-2 mt-1">
            Connections represent multiplications (activation * weight). Summing them together with a bias forms the logit score, which Softmax normalizes into probability percentages.
          </p>
        </div>
      </div>
    </div>
  );
};
