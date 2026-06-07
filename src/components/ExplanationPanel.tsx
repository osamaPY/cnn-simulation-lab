import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS } from '../explanations';
import { MathFormula } from './MathFormula';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const ExplanationPanel: React.FC = () => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();
  const explanation = EXPLANATIONS[currentStageId] || { body: '', focusFormula: null };

  return (
    <div className="relative w-full h-full flex flex-col pointer-events-none">
       {/* Top Right: Floating Math Formula (if any) */}
       <AnimatePresence mode="wait">
         {explanation.focusFormula && (
           <motion.div 
             key={`formula-${currentStageId}`}
             initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={shouldReduceMotion ? undefined : { opacity: 0, x: -20 }}
             className="absolute top-0 right-0 pointer-events-auto scale-90 origin-top-right"
           >
             <div className="bg-black/60 backdrop-blur-xl rounded-xl p-3 px-5 border border-white/10 shadow-[0_0_30px_rgba(100,50,255,0.15)] flex flex-col items-center">
                <MathFormula formula={explanation.focusFormula} />
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Bottom Center: Cinematic Subtitles */}
       <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none">
         <AnimatePresence mode="wait">
            <motion.div
              key={`subtitle-${currentStageId}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
              className="max-w-2xl w-full"
            >
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/5 text-center shadow-2xl mx-4">
                <p className="text-sm md:text-base text-white/90 font-serif leading-relaxed tracking-wide drop-shadow-md">
                  {explanation.body}
                </p>
              </div>
            </motion.div>
         </AnimatePresence>
       </div>
    </div>
  );
};
