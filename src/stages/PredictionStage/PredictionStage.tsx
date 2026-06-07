import React from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { sceneTransition } from '../../animations/motion';

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

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl items-center py-4 px-2">
      
      {/* Side-by-Side Canvas Input vs prediction output */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
        {/* Draw Input Thumbnail Card */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-text-secondary uppercase">
            Your Ink Input
          </span>
          <div className="w-32 h-32 bg-black border border-border-muted rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
            {originalCanvasThumbnail ? (
              <img 
                src={originalCanvasThumbnail} 
                alt="Original Drawing" 
                className="w-full h-full object-contain filter invert opacity-80" 
              />
            ) : (
              <div className="text-[9px] text-text-muted">Awaiting Ink</div>
            )}
            <div className="absolute inset-1.5 border border-dashed border-border-muted/30 rounded-lg pointer-events-none" />
          </div>
        </div>

        {/* Transition Arrow */}
        <div className="hidden sm:flex items-center gap-1 text-text-muted font-mono text-xs" aria-hidden="true">
          <span className="h-px w-8 bg-border-muted" />
          <span>&gt;</span>
        </div>

        {/* Classification output */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-text-secondary uppercase">
            Network Prediction
          </span>
          
          <motion.div 
            className="w-32 h-32 rounded-lg bg-bg-deep border border-text-accent/50 flex flex-col items-center justify-center relative"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
          >
            <span className="text-6xl font-display font-extrabold text-text-accent leading-none">
              {prediction.digit}
            </span>
            <span className="text-[10px] font-mono text-aurora-mint font-semibold uppercase mt-1">
              Digit {prediction.digit}
            </span>
            <div className="absolute inset-1 rounded-lg border border-dashed border-aurora-mint/20 pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Confidence gauge display */}
      <div className="w-full bg-bg-panel border border-border-muted p-4 rounded-xl shadow-inner flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary uppercase">Classification Certainty:</span>
          <span className="text-aurora-mint font-bold text-sm">{confidencePct}%</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-3 rounded-full bg-black border border-border-subtle overflow-hidden relative">
          <motion.div 
            className="h-full w-full origin-left rounded-r bg-text-accent"
            initial={shouldReduceMotion ? { scaleX: prediction.confidence } : { scaleX: 0 }}
            animate={{ scaleX: prediction.confidence }}
            transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
          />
        </div>

        {/* Confidence Context Explanation */}
        <p className="text-[10px] text-text-muted text-center mt-1 leading-relaxed">
          Confidence is the largest softmax probability. A high value does not guarantee the
          prediction is correct, especially for unusual drawings.
        </p>
      </div>

      {/* Core Educational Summary */}
      <div className="w-full border border-border-subtle p-3.5 rounded-xl bg-bg-deep/40 text-center text-xs text-text-secondary leading-relaxed flex flex-col gap-1">
        <span className="font-semibold text-text-accent uppercase tracking-wider font-display">
          How did the CNN classify this?
        </span>
        <p className="text-[10px] text-text-muted mt-1 max-w-sm mx-auto">
          The prediction is the <strong>argmax</strong> (index of the highest probability) of the Softmax vector. 
          By combining edge detectors, downsampling layers, and fully connected weights, the model learns complex spatial representations.
        </p>
      </div>

      <button className="btn-primary" onClick={clearAll} type="button">
        Try another digit
      </button>
    </div>
  );
};
