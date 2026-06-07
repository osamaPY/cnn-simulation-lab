import React, { useMemo } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS_BY_MODE } from '../explanations';
import { MathFormula } from './MathFormula';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const STAGE_COLORS: Record<number, string> = {
  1: '#58C4DD', 2: '#58C4DD', 3: '#58C4DD', 4: '#F5CD47', 5: '#83C167',
  6: '#9C27B0', 7: '#FF6666', 8: '#E07A5F', 9: '#9C27B0',
  10: '#58C4DD', 11: '#83C167', 12: '#FF6666',
};

const GLOSSARY_MAP: Record<number, { symbol: string; label: string; desc: string }[]> = {
  1: [
    { symbol: "x", label: "Pixel Value", desc: "Raw input pixel intensity [0, 255]" },
    { symbol: "μ", label: "Mean (Centering)", desc: "Average brightness of the active bounds" },
    { symbol: "σ", label: "StdDev (Scaling)", desc: "Standard deviation to normalize contrast" },
  ],
  2: [
    { symbol: "Input", label: "Image Grid", desc: "Raw pixel grid (e.g. 28x28x1 grayscale)" },
    { symbol: "Conv", label: "Convolution Layer", desc: "Learns spatial filters to detect local features" },
    { symbol: "ReLU", label: "Activation Layer", desc: "Introduces non-linearity to keep positive activations" },
    { symbol: "Pool", label: "Pooling Layer", desc: "Downsamples grid resolution to reduce parameters" },
    { symbol: "Dense", label: "Fully Connected", desc: "Combines local features to score global classes" },
  ],
  3: [
    { symbol: "[r, c]", label: "Pixel Coordinates", desc: "Row and column index in the 28x28 grid" },
    { symbol: "v", label: "Activation value", desc: "Normalized floating point intensity [0.0, 1.0]" },
  ],
  4: [
    { symbol: "I", label: "Input plane", desc: "The preprocessed 28x28 grid of pixels" },
    { symbol: "K", label: "3x3 Kernel weights", desc: "Sliding filter matrix extracting features" },
    { symbol: "b", label: "Bias offset", desc: "Constant shift added to output" },
  ],
  5: [
    { symbol: "I", label: "Input plane", desc: "The preprocessed 28x28 grid of pixels" },
    { symbol: "K_c", label: "Kernel Stack", desc: "Multiple unique filters applied in parallel" },
    { symbol: "C", label: "Depth Channels", desc: "Number of feature maps generated (8 or 16)" },
  ],
  6: [
    { symbol: "x", label: "Pre-activation", desc: "Raw activation value from convolution filter" },
    { symbol: "f(x)", label: "Rectified Output", desc: "Keeps positive values, clips negative values to 0" },
  ],
  7: [
    { symbol: "X", label: "Feature Map", desc: "Input map of dimension 26x26 before pooling" },
    { symbol: "s", label: "Stride step", desc: "Step size the pool window jumps (2 pixels)" },
    { symbol: "max", label: "Max pooling", desc: "Retains only the strongest feature in a 2x2 grid" },
  ],
  8: [
    { symbol: "H×W×C", label: "3D Grid Shape", desc: "Height, Width, and Channel depth of maps" },
    { symbol: "D", label: "1D Length", desc: "Total flattened items: 5 × 5 × 16 = 400 elements" },
  ],
  9: [
    { symbol: "a_j", label: "Input activation", desc: "Activation value from the flattened vector" },
    { symbol: "w_ji", label: "Connection Weight", desc: "Synaptic connection strength between neurons" },
    { symbol: "b_i", label: "Neuron Bias", desc: "Activation threshold for output neuron i" },
  ],
  10: [
    { symbol: "z_i", label: "Raw Score (Logit)", desc: "Raw weighted sum output for class digit i" },
    { symbol: "e^{z_i}", label: "Exponentiation", desc: "Amplifies highest scores and ensures positive value" },
    { symbol: "Σ e^{z_j}", label: "Sum (Normalization)", desc: "Sum of all exponents; normalizes total to 100%" },
  ],
  11: [
    { symbol: "ŷ", label: "Predicted Class", desc: "The class digit index (0-9) chosen by the network" },
    { symbol: "argmax", label: "Maximum Argument", desc: "Operator that selects the index of the highest probability" },
    { symbol: "σ(z)_i", label: "Class Probability", desc: "Normalized likelihood score for each individual digit i" },
  ],
  12: [
    { symbol: "W", label: "Weights matrix", desc: "Learnable filter values being optimized" },
    { symbol: "η", label: "Learning Rate", desc: "Step size scaling gradient updates" },
    { symbol: "∂L/∂W", label: "Gradient slope", desc: "Calculated error direction for minimizing loss" },
  ]
};

export const ExplanationPanel: React.FC<{ mode?: 'all' | 'formula' | 'subtitles' | 'glossary' }> = ({ mode = 'all' }) => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();

  // Resolve explanation content for all three learning modes
  const beginnerExp = useMemo(() => EXPLANATIONS_BY_MODE.beginner[currentStageId], [currentStageId]);
  const mathExp = useMemo(() => EXPLANATIONS_BY_MODE.mathematical[currentStageId], [currentStageId]);
  const examExp = useMemo(() => EXPLANATIONS_BY_MODE.examprep[currentStageId], [currentStageId]);

  const stageColor = STAGE_COLORS[currentStageId] || '#58C4DD';

  const showFormula = (mode === 'all' || mode === 'formula') && mathExp?.focusFormula;
  const showGlossary = (mode === 'all' || mode === 'glossary') && mathExp?.focusFormula;
  const showSubtitles = (mode === 'all' || mode === 'subtitles');

  return (
    <div className="relative w-full pointer-events-none" style={{ minWidth: 0 }}>
      {/* Horizontal Formula Banner — used only if explicitly requested as standalone */}
      {showFormula && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`formula-${currentStageId}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full pointer-events-auto flex items-center justify-center"
          >
            <div className="flex items-center gap-2 py-0.5 px-2 bg-white/[0.01] border border-white/5 rounded max-w-2xl w-full justify-center shadow shadow-black/20 backdrop-blur-sm">
              <span className="text-[7px] font-mono text-white/30 uppercase tracking-[0.2em] font-bold shrink-0">Stage Formula</span>
              <div className="w-[1px] h-2 bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0 flex justify-center text-[#58C4DD] scale-75 origin-center">
                <MathFormula formula={mathExp.focusFormula!} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Glossary panel — rendered inline inside the sidebar */}
      {showGlossary && GLOSSARY_MAP[currentStageId] && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`glossary-${currentStageId}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full pointer-events-auto"
          >
            <div
              className="bg-black/35 rounded border border-white/5 flex flex-col gap-1.5 w-full min-w-0 p-2 shadow-md"
            >
              <div className="text-[7.5px] font-mono text-white/40 uppercase tracking-widest text-center border-b border-white/5 pb-0.5 mb-0.5 font-bold">Glossary</div>
              <div className="flex flex-col gap-0.5 w-full">
                {GLOSSARY_MAP[currentStageId].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-[7px] font-mono gap-1 hover:bg-white/[0.01] p-0.5 rounded transition-colors group">
                    <span className="text-[#58C4DD] font-bold shrink-0 text-[7.5px]">{item.symbol}</span>
                    <div className="flex flex-col items-end text-right min-w-0">
                      <span className="text-white/60 font-semibold uppercase text-[6.5px] tracking-wider truncate max-w-[110px]">{item.label}</span>
                      <span className="text-white/30 text-[6.5px] leading-tight mt-0.5 group-hover:text-white/50 transition-colors">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {mathExp?.keyTakeaway && (
                <div className="flex flex-col items-center gap-1 w-full mt-0.5 border-t border-white/5 pt-1.5">
                  <p className="text-[7px] font-mono text-center leading-normal uppercase tracking-wider text-white/20 font-bold" style={{ maxWidth: '180px' }}>
                    {mathExp.keyTakeaway}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Subtitles: The Unified 3-Column Learning Panel */}
      {showSubtitles && (
        <div className="w-full flex justify-center pointer-events-none" style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`unified-learning-box-${currentStageId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -3 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left pointer-events-auto">
                {/* Column 1: Concept */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded w-max">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: stageColor }} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/50">Visual Concept</span>
                  </div>
                  <p className="text-[10.5px] font-sans leading-relaxed text-white/70">
                    {beginnerExp?.body}
                  </p>
                </div>

                {/* Column 2: Math Model */}
                <div className="flex flex-col gap-1 min-w-0 border-l border-white/5 pl-4">
                  <div className="flex items-center gap-1.5 mb-1 bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded w-max">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#58C4DD' }} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/50">Mathematical Model</span>
                  </div>
                  <p className="text-[10.5px] font-sans leading-relaxed text-white/70">
                    {mathExp?.body}
                  </p>
                  {mathExp?.focusFormula && (
                    <div className="mt-2 flex items-center justify-start text-[#58C4DD] scale-[0.85] origin-left overflow-x-auto no-scrollbar max-w-full">
                      <MathFormula formula={mathExp.focusFormula} />
                    </div>
                  )}
                </div>

                {/* Column 3: Technical Specs */}
                <div className="flex flex-col gap-1 min-w-0 border-l border-white/5 pl-4">
                  <div className="flex items-center gap-1.5 mb-1 bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded w-max">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#83C167' }} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-white/50">Technical Specs</span>
                  </div>
                  <p className="text-[10.5px] font-sans leading-relaxed text-white/70">
                    {examExp?.body}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
