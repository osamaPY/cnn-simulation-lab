import React, { lazy, Suspense } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS } from '../explanations';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { sceneTransition } from '../animations/motion';

const MathFormula = lazy(() =>
  import('./MathFormula').then((module) => ({ default: module.MathFormula })),
);

export const ExplanationPanel: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);
  const prediction = useLabStore(state => state.prediction);
  const hasDrawing = useLabStore(state => state.hasDrawing);
  const modelStatus = useLabStore(state => state.modelStatus);
  const inferenceError = useLabStore(state => state.inferenceError);
  const hoveredDigit = useLabStore(state => state.hoveredDigit);
  const shouldReduceMotion = useReducedMotion();

  // Retrieve matching explanation
  const explanation = EXPLANATIONS[currentStageId] || {
    headline: "Stage Detail",
    body: "An explanation is not available for this stage yet.",
    interactiveGoal: "Follow stage instructions."
  };

  // Render prediction panel based on model loading status
  const renderPredictionContent = () => {
    switch (modelStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 h-1 w-24 overflow-hidden rounded bg-border-subtle">
              <motion.div
                animate={shouldReduceMotion ? { x: 0 } : { x: ['-100%', '100%'] }}
                className="h-full w-1/2 bg-aurora-purple"
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, ease: 'linear', repeat: Infinity }}
              />
            </div>
            <p className="text-xs text-text-secondary font-mono">Loading the CNN model...</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-start justify-center py-4 text-left border border-dashed border-red-500/25 p-4 rounded-lg bg-red-950/5 gap-3">
            <div className="flex items-center gap-2 text-red-400">
              <span className="font-mono text-xs font-bold">ERROR</span>
              <h4 className="text-sm font-semibold">
                CNN model unavailable
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              The app could not load the exported model from `model/model.json`. Real inference requires a trained and converted TensorFlow.js model.
            </p>
            <div className="w-full mt-1 border-t border-border-subtle pt-2 flex flex-col gap-1.5 text-[10px] font-mono text-text-muted">
              <span>1. Run script: <code className="text-text-accent font-semibold">python train/train_mnist.py</code></span>
              <span>2. Convert model: <code className="text-text-accent font-semibold">tensorflowjs_converter</code></span>
              <span>3. Place in: <code className="text-text-accent font-semibold">public/model/</code></span>
            </div>
            {inferenceError && (
              <span className="text-[9px] font-mono text-red-400/60 break-all leading-tight bg-red-950/20 p-1.5 rounded w-full mt-1">
                Log: {inferenceError}
              </span>
            )}
          </div>
        );

      case 'success':
      default:
        if (!prediction) {
          return (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-border-muted flex items-center justify-center text-text-muted mb-3 font-mono">
                ?
              </div>
              <p className="text-sm text-text-secondary font-medium">Prediction will appear here</p>
              <p className="text-xs text-text-muted mt-1 max-w-[200px]">
                {hasDrawing 
                  ? "Click 'Run Simulation' to execute real-time model inference." 
                  : "Draw a digit on the canvas first to begin."}
              </p>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-5">
            {/* Top row: Digit & confidence circle */}
            <div className="flex items-center gap-4 bg-bg-deep/40 p-3 rounded-lg border border-border-subtle">
              <div className="w-16 h-16 rounded border border-text-accent/45 bg-text-accent/5 flex items-center justify-center">
                <span className="text-4xl font-display font-extrabold text-text-primary">
                  {prediction.digit}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-text-muted font-mono">Predicted class</span>
                <span className="text-lg font-display font-bold text-text-primary">
                  Digit {prediction.digit}
                </span>
                <span className="text-xs text-aurora-mint font-semibold flex items-center gap-1">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Probability Bars */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-text-secondary mb-1">
                Softmax probabilities
              </span>
              {prediction.probabilities.map((prob, index) => {
                const isWinner = index === prediction.digit;
                const isHovered = index === hoveredDigit;
                const percentage = (prob * 100).toFixed(1);
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center gap-2 p-0.5 rounded transition-all duration-200 ${
                      isHovered 
                        ? 'bg-aurora-teal/10 border border-aurora-teal/40 px-1'
                        : 'border border-transparent'
                    }`}
                  >
                    {/* Number label */}
                    <span className={`w-3 text-xs font-mono font-bold ${isWinner ? 'text-text-primary' : 'text-text-accent'}`}>
                      {index}
                    </span>
                    
                    {/* Bar track */}
                    <div className="flex-1 h-3 bg-bg-deep rounded overflow-hidden border border-border-subtle relative">
                      <motion.div
                        className={`h-full rounded-r ${
                          isWinner
                            ? 'bg-text-accent'
                            : isHovered
                              ? 'bg-aurora-teal/60'
                              : 'bg-aurora-indigo/40'
                        }`}
                        initial={shouldReduceMotion ? { scaleX: Number(percentage) / 100 } : { scaleX: 0 }}
                        animate={{ scaleX: Number(percentage) / 100 }}
                        style={{ transformOrigin: 'left', width: '100%' }}
                        transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
                      />
                    </div>
                    
                    {/* Percentage text */}
                    <span className={`w-10 text-right text-[10px] font-mono ${isWinner ? 'text-aurora-mint font-semibold' : 'text-text-secondary'}`}>
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 xl:gap-5">
      {/* 1. Prediction Output Card */}
      <div className="aurora-card p-4 sm:p-5 relative overflow-hidden">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center justify-between">
          <span>Model readout</span>
          {modelStatus === 'success' && prediction && (
            <span className="text-[10px] font-mono py-0.5 px-1.5 rounded bg-aurora-teal/15 text-aurora-mint border border-aurora-mint/20">
              Real model
            </span>
          )}
        </h3>

        {renderPredictionContent()}
      </div>

      {/* 2. Educational / Tutorial Content Card */}
      <div className="aurora-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono bg-aurora-indigo/35 text-text-accent px-2 py-0.5 rounded border border-aurora-purple/20">
              Chapter {currentStageId}
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-xl font-semibold text-text-primary tracking-tight leading-snug mb-3">
            {explanation.headline}
          </h2>

          {/* Body */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            {explanation.body}
          </p>

          {/* Math Formula Card */}
          {explanation.focusFormula && (
            <div className="my-4 p-3 bg-bg-deep border border-border-muted rounded-lg font-mono text-center flex flex-col gap-1 shadow-inner relative overflow-hidden">
              <span className="text-[9px] text-text-muted absolute top-1 left-2 font-mono">
                Formula
              </span>
              <div className="text-text-accent text-sm py-2 overflow-x-auto select-all">
                <Suspense fallback={<span>{explanation.focusFormula}</span>}>
                  <MathFormula formula={explanation.focusFormula} />
                </Suspense>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
