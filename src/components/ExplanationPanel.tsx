import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS } from '../explanations';
import { MathFormula } from './MathFormula';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const STAGE_COLORS: Record<number, string> = {
  1: '#6366f1', 2: '#0ea5e9', 3: '#22d3ee', 4: '#3b82f6',
  5: '#f97316', 6: '#a855f7', 7: '#ec4899', 8: '#f59e0b',
  9: '#8b5cf6', 10: '#34d399', 11: '#f87171',
};

const subtitleContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.012 }
  }
};

const wordVariants = {
  hidden: { opacity: 0, y: 6, filter: 'blur(3px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export const ExplanationPanel: React.FC<{ mode?: 'all' | 'formula' | 'subtitles' }> = ({ mode = 'all' }) => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();
  const explanation = EXPLANATIONS[currentStageId] || { body: '', focusFormula: null, keyTakeaway: '', headline: '' };

  const words = React.useMemo(() => explanation.body.split(' '), [explanation.body]);
  const stageColor = STAGE_COLORS[currentStageId] || '#50c9e6';

  const showFormula = (mode === 'all' || mode === 'formula') && explanation.focusFormula;
  const showSubtitles = (mode === 'all' || mode === 'subtitles');

  return (
    <div className={`relative w-full pointer-events-none ${mode === 'all' ? 'h-full flex flex-col' : ''}`}>
      {showFormula && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`formula-${currentStageId}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 30, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20, scale: 0.94 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 right-0 pointer-events-auto scale-90 origin-top-right z-55"
          >
            <div
              className="bg-[#030306]/90 backdrop-blur-2xl rounded-2xl p-4 px-6 border flex flex-col items-center gap-2"
              style={{
                borderColor: `${stageColor}30`,
                boxShadow: `0 0 30px ${stageColor}15, 0 0 60px rgba(0,0,0,0.5)`,
              }}
            >
              <div
                className="w-full h-px mb-1 opacity-40"
                style={{ background: `linear-gradient(to right, transparent, ${stageColor}, transparent)` }}
              />
              <MathFormula formula={explanation.focusFormula!} />
              {explanation.keyTakeaway && (
                <p className="text-[9px] font-mono text-center max-w-[200px] leading-relaxed mt-1"
                   style={{ color: `${stageColor}aa` }}>
                  {explanation.keyTakeaway}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {showSubtitles && (
        <div className={`${mode === 'all' ? 'absolute bottom-0 left-0 right-0 pb-4' : 'w-full'} flex justify-center pointer-events-none`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`subtitle-box-${currentStageId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl w-full"
            >
              <div
                className="bg-[#030306]/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border text-center shadow-2xl mx-4 pointer-events-auto"
                style={{
                  borderColor: `${stageColor}18`,
                  boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px ${stageColor}10`,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px flex-1 max-w-12" style={{ background: `linear-gradient(to right, transparent, ${stageColor}50)` }} />
                  <span className="text-[8px] font-mono uppercase tracking-[0.25em]" style={{ color: `${stageColor}80` }}>
                    {explanation.headline}
                  </span>
                  <div className="h-px flex-1 max-w-12" style={{ background: `linear-gradient(to left, transparent, ${stageColor}50)` }} />
                </div>

                {shouldReduceMotion ? (
                  <p className="text-sm md:text-base text-white/85 leading-relaxed">
                    {explanation.body}
                  </p>
                ) : (
                  <motion.p
                    variants={subtitleContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-sm md:text-base text-white/85 leading-relaxed flex flex-wrap gap-x-1 justify-center"
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
