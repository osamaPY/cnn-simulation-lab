import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS } from '../explanations';
import { MathFormula } from './MathFormula';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const STAGE_COLORS: Record<number, string> = {
  1: '#58C4DD', 2: '#58C4DD', 3: '#58C4DD', 4: '#F5CD47', 5: '#83C167',
  6: '#9C27B0', 7: '#FF6666', 8: '#E07A5F', 9: '#9C27B0',
  10: '#58C4DD', 11: '#83C167', 12: '#FF6666',
};

const subtitleContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.015 }
  }
};

const wordVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

const GLOSSARY_MAP: Record<number, { symbol: string; label: string; desc: string }[]> = {
  1: [
    { symbol: "x", label: "Pixel Value", desc: "Raw input pixel intensity [0, 255]" },
    { symbol: "μ", label: "Mean (Centering)", desc: "Average brightness of the active bounds" },
    { symbol: "σ", label: "StdDev (Scaling)", desc: "Standard deviation to normalize contrast" },
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
  12: [
    { symbol: "W", label: "Weights matrix", desc: "Learnable filter values being optimized" },
    { symbol: "η", label: "Learning Rate", desc: "Step size scaling gradient updates" },
    { symbol: "∂L/∂W", label: "Gradient slope", desc: "Calculated error direction for minimizing loss" },
  ]
};

export const ExplanationPanel: React.FC<{ mode?: 'all' | 'formula' | 'subtitles' | 'glossary' }> = ({ mode = 'all' }) => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();
  const explanation = EXPLANATIONS[currentStageId] || { body: '', focusFormula: null, keyTakeaway: '', headline: '' };

  const words = React.useMemo(() => explanation.body.split(' '), [explanation.body]);
  const stageColor = STAGE_COLORS[currentStageId] || '#58C4DD';

  const showFormula = (mode === 'all' || mode === 'formula') && explanation.focusFormula;
  const showGlossary = (mode === 'all' || mode === 'glossary') && explanation.focusFormula;
  const showSubtitles = (mode === 'all' || mode === 'subtitles');

  return (
    <div className="relative w-full pointer-events-none" style={{ minWidth: 0 }}>
      {/* Horizontal Formula Banner — rendered at the top of Left Column */}
      {showFormula && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`formula-${currentStageId}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full pointer-events-auto flex items-center justify-center"
          >
            <div className="flex items-center gap-4 py-1.5 px-5 bg-white/[0.01] border border-white/5 rounded-lg max-w-4xl w-full justify-center shadow-lg backdrop-blur-sm">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] font-bold shrink-0">Stage Formula</span>
              <div className="w-[1px] h-4 bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0 flex justify-center text-[#58C4DD]">
                <MathFormula formula={explanation.focusFormula!} />
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
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full pointer-events-auto"
          >
            <div
              className="bg-[#1c1c1c] rounded-sm border border-white/5 flex flex-col gap-3 w-full min-w-0 formula-card p-4 shadow-xl"
            >
              <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest text-center border-b border-white/5 pb-2 mb-1 font-bold">Glossary</div>
              <div className="flex flex-col gap-1.5 w-full">
                {GLOSSARY_MAP[currentStageId].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between text-[9px] font-mono gap-2 hover:bg-white/[0.02] p-1 rounded transition-colors group">
                    <span className="text-[#58C4DD] font-bold shrink-0">{item.symbol}</span>
                    <div className="flex flex-col items-end text-right">
                      <span className="text-white/60 font-semibold uppercase text-[8px] tracking-wider">{item.label}</span>
                      <span className="text-white/30 text-[8px] leading-tight mt-0.5 group-hover:text-white/50 transition-colors">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {explanation.keyTakeaway && (
                <div className="flex flex-col items-center gap-2 w-full mt-1 border-t border-white/5 pt-3">
                  <p className="text-[9px] font-mono text-center leading-relaxed uppercase tracking-widest text-white/35 font-bold" style={{ maxWidth: '200px' }}>
                    {explanation.keyTakeaway}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Subtitle text */}
      {showSubtitles && (
        <div className="w-full flex justify-center pointer-events-none" style={{ minWidth: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`subtitle-box-${currentStageId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
              style={{ maxWidth: '680px' }}
            >
              <div
                className="border-l-2 border-white/5 text-center pointer-events-auto"
                style={{
                  borderLeftColor: stageColor,
                  padding: '6px 16px',
                }}
              >
                {shouldReduceMotion ? (
                  <p className="text-sm text-[#FFFEF0]/70 leading-snug font-serif italic">
                    {explanation.body}
                  </p>
                ) : (
                  <motion.p
                    variants={subtitleContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-sm text-[#FFFEF0]/70 leading-snug font-serif italic flex flex-wrap gap-x-1.5 justify-center"
                  >
                    {words.map((word, i) => (
                      <motion.span key={`${currentStageId}-w-${i}`} variants={wordVariants}>
                        {word}
                      </motion.span>
                    ))}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
