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

export const ExplanationPanel: React.FC<{ mode?: 'all' | 'formula' | 'subtitles' }> = ({ mode = 'all' }) => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();
  const explanation = EXPLANATIONS[currentStageId] || { body: '', focusFormula: null, keyTakeaway: '', headline: '' };

  const words = React.useMemo(() => explanation.body.split(' '), [explanation.body]);
  const stageColor = STAGE_COLORS[currentStageId] || '#58C4DD';

  const showFormula = (mode === 'all' || mode === 'formula') && explanation.focusFormula;
  const showSubtitles = (mode === 'all' || mode === 'subtitles');

  return (
    <div className="relative w-full pointer-events-none">
      {showFormula && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`formula-${currentStageId}`}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 right-0 pointer-events-auto origin-top-right z-55"
          >
            <div
              className="bg-[#1c1c1c] rounded-sm p-8 border border-white/5 flex flex-col items-center gap-4"
              style={{
                boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              }}
            >
              <MathFormula formula={explanation.focusFormula!} />
              {explanation.keyTakeaway && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-[1px] bg-white/10" />
                  <p className="text-[10px] font-mono text-center max-w-[200px] leading-relaxed uppercase tracking-widest text-white/30">
                    {explanation.keyTakeaway}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {showSubtitles && (
        <div className="w-full flex justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`subtitle-box-${currentStageId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl w-full"
            >
              <div
                className="p-2 border-l-2 border-white/5 text-center mx-4 pointer-events-auto"
                style={{
                  borderLeftColor: stageColor,
                }}
              >
                {shouldReduceMotion ? (
                  <p className="text-sm md:text-base text-[#FFFEF0]/70 leading-relaxed font-serif italic">
                    {explanation.body}
                  </p>
                ) : (
                  <motion.p
                    variants={subtitleContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-sm md:text-base text-[#FFFEF0]/70 leading-relaxed font-serif italic flex flex-wrap gap-x-1.5 justify-center"
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
