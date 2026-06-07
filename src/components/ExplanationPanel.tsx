import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS } from '../explanations';
import { MathFormula } from './MathFormula';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

const subtitleContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.015,
    }
  }
};

const wordVariants = {
  hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export const ExplanationPanel: React.FC<{ mode?: 'all' | 'formula' | 'subtitles' }> = ({ mode = 'all' }) => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();
  const explanation = EXPLANATIONS[currentStageId] || { body: '', focusFormula: null };

  const words = React.useMemo(() => explanation.body.split(' '), [explanation.body]);

  const showFormula = (mode === 'all' || mode === 'formula') && explanation.focusFormula;
  const showSubtitles = (mode === 'all' || mode === 'subtitles');

  return (
    <div className={`relative w-full pointer-events-none ${mode === 'all' ? 'h-full flex flex-col' : ''}`}>
       {/* Top Right: Floating Math Formula (if any) */}
       {showFormula && (
         <AnimatePresence mode="wait">
            <motion.div 
              key={`formula-${currentStageId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 30, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: -25, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 pointer-events-auto scale-90 origin-top-right z-55"
            >
              <div className="bg-[#030306]/85 backdrop-blur-xl rounded-2xl p-4 px-6 border border-white/10 shadow-[0_0_40px_rgba(80,201,230,0.12)] flex flex-col items-center">
                 <MathFormula formula={explanation.focusFormula!} />
              </div>
            </motion.div>
         </AnimatePresence>
       )}

       {/* Cinematic Subtitles */}
       {showSubtitles && (
         <div className={`${mode === 'all' ? 'absolute bottom-0 left-0 right-0 pb-4' : 'w-full'} flex justify-center pointer-events-none`}>
           <AnimatePresence mode="wait">
              <motion.div
                key={`subtitle-box-${currentStageId}`}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl w-full"
              >
                <div className="bg-[#030306]/75 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/5 text-center shadow-[0_15px_50px_rgba(0,0,0,0.7)] mx-4 pointer-events-auto">
                  {shouldReduceMotion ? (
                    <p className="text-sm md:text-base text-white/90 font-serif leading-relaxed tracking-wide font-medium">
                      {explanation.body}
                    </p>
                  ) : (
                    <motion.p 
                      variants={subtitleContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-sm md:text-base text-white/90 font-serif leading-relaxed tracking-wide font-medium flex flex-wrap justify-center gap-x-1.5 gap-y-0.5"
                    >
                      {words.map((word, idx) => (
                        <motion.span 
                          key={`${word}-${idx}`} 
                          variants={wordVariants} 
                          className="inline-block"
                        >
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
