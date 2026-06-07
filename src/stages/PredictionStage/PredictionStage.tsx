import React from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const PredictionStage: React.FC = () => {
  const prediction = useLabStore(state => state.prediction);
  const originalCanvasThumbnail = useLabStore(state => state.originalCanvasThumbnail);
  const clearAll = useLabStore(state => state.clearAll);
  const shouldReduceMotion = useReducedMotion();

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[360px] bg-bg-card/20">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          No Classification Result
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[200px]">
          Draw a digit on the canvas and run the simulation to see the final prediction.
        </p>
      </div>
    );
  }

  const confidencePct = (prediction.confidence * 100).toFixed(1);

  const slideTransition = {
    duration: 0.6,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl items-center py-6 px-4">
      {/* Side-by-Side Canvas Input vs prediction output */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
        {/* Draw Input Thumbnail Card */}
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
            Your Ink Input
          </span>
          <div className="w-32 h-32 bg-black border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
            {originalCanvasThumbnail ? (
              <img 
                src={originalCanvasThumbnail} 
                alt="Original Drawing" 
                className="w-full h-full object-contain filter invert opacity-90 scale-95" 
              />
            ) : (
              <div className="text-[9px] text-text-muted">Awaiting Ink</div>
            )}
            <div className="absolute inset-1.5 border border-dashed border-white/5 rounded-xl pointer-events-none" />
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="hidden sm:flex items-center justify-center text-amber-500/40" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Classification output */}
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
            Network Prediction
          </span>
          
          <motion.div 
            className="w-32 h-32 rounded-2xl bg-[#030306]/90 border-2 border-amber-500/50 flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(245,158,11,0.15)]"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : slideTransition}
          >
            <span className="text-6xl font-display font-extrabold text-amber-400 leading-none filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              {prediction.digit}
            </span>
            <span className="text-[9px] font-mono text-[#10b981] font-bold uppercase tracking-wider mt-1.5">
              Digit {prediction.digit}
            </span>
            <div className="absolute inset-1 rounded-xl border border-dashed border-amber-500/10 pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Confidence gauge display */}
      <div className="w-full bg-[#030306]/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary uppercase tracking-wider">Classification Certainty:</span>
          <span className="text-[#10b981] font-bold text-sm">{confidencePct}%</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden relative">
          <motion.div 
            className="h-full w-full origin-left rounded-r bg-gradient-to-r from-cyan-500 via-teal-400 to-[#10b981]"
            initial={shouldReduceMotion ? { scaleX: prediction.confidence } : { scaleX: 0 }}
            animate={{ scaleX: prediction.confidence }}
            transition={shouldReduceMotion ? { duration: 0 } : slideTransition}
          />
        </div>
      </div>

      <button 
        className="btn-primary mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black border-amber-500 hover:border-amber-400 rounded-xl transition-all duration-300 font-bold tracking-wide shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5" 
        onClick={clearAll} 
        type="button"
      >
        Try another digit
      </button>
    </div>
  );
};
