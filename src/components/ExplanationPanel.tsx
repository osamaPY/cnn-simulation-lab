import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { EXPLANATIONS } from '../explanations';
import { motion } from 'framer-motion';

export const ExplanationPanel: React.FC = () => {
  const { currentStageId, selectedMode, prediction, hasDrawing, modelStatus, inferenceError, hoveredDigit } = useLabStore();

  // Retrieve matching explanation
  const modeExplanations = EXPLANATIONS[selectedMode] || EXPLANATIONS.beginner;
  const explanation = modeExplanations[currentStageId] || {
    headline: "Stage Detail",
    body: "Detail description placeholder.",
    interactiveGoal: "Follow stage instructions."
  };

  // Render prediction panel based on model loading status
  const renderPredictionContent = () => {
    switch (modelStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-aurora-purple/30 border-t-aurora-purple animate-spin mb-3" />
            <p className="text-xs text-text-secondary font-mono">Loading CNN Model configurations...</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-start justify-center py-4 text-left border border-dashed border-red-500/25 p-4 rounded-lg bg-red-950/5 gap-3">
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-lg">⚠️</span>
              <h4 className="text-xs font-display font-bold uppercase tracking-wider">
                CNN Model Config Not Found
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Vite could not load `/model/model.json` from public assets. Before you can run real inference, you must train the model and convert it.
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-aurora-indigo/30 to-aurora-violet/30 border border-aurora-purple/30 flex items-center justify-center shadow-inner">
                <span className="text-4xl font-display font-extrabold text-text-primary">
                  {prediction.digit}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-text-muted font-mono uppercase">Predicted Class</span>
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
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wide mb-1">
                Softmax Activation Probabilities
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
                        ? 'bg-aurora-teal/15 border border-aurora-teal/30 scale-[1.02] shadow-[0_0_8px_rgba(13,148,136,0.15)] px-1' 
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
                            ? 'bg-gradient-to-r from-aurora-purple to-aurora-mint shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                            : isHovered
                              ? 'bg-aurora-teal/60'
                              : 'bg-aurora-indigo/40'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
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
    <div className="w-full flex flex-col gap-6 overflow-y-auto h-full pr-1">
      {/* 1. Prediction Output Card */}
      <div className="aurora-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-purple/5 rounded-full filter blur-2xl pointer-events-none" />
        
        <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary mb-4 flex items-center justify-between">
          <span>Prediction Output</span>
          {modelStatus === 'success' && prediction && (
            <span className="text-[10px] font-mono py-0.5 px-1.5 rounded bg-aurora-teal/15 text-aurora-mint border border-aurora-mint/20">
              REAL-TIME ML
            </span>
          )}
        </h3>

        {renderPredictionContent()}
      </div>

      {/* 2. Educational / Tutorial Content Card */}
      <div className="aurora-card p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono bg-aurora-indigo/35 text-text-accent px-2 py-0.5 rounded border border-aurora-purple/20">
              STAGE {currentStageId}
            </span>
            <span className="text-xs text-text-muted font-display capitalize">
              {selectedMode} mode
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-lg font-display font-extrabold text-text-primary tracking-tight leading-snug mb-3">
            {explanation.headline}
          </h2>

          {/* Body */}
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            {explanation.body}
          </p>

          {/* Math Formula Card */}
          {selectedMode !== 'beginner' && explanation.focusFormula && (
            <div className="my-4 p-3 bg-bg-deep border border-border-muted rounded-lg font-mono text-center flex flex-col gap-1 shadow-inner relative overflow-hidden">
              <span className="text-[9px] uppercase tracking-wider text-text-muted absolute top-1 left-2 font-display">
                Formula Representation
              </span>
              <div className="text-text-accent text-sm py-2 overflow-x-auto select-all">
                {explanation.focusFormula}
              </div>
            </div>
          )}

          {/* Key Takeaway */}
          {explanation.keyTakeaway && (
            <div className="mt-3 p-3 rounded-lg bg-aurora-teal/5 border border-aurora-teal/15 text-xs text-text-secondary shadow-sm relative overflow-hidden pl-4">
              <div className="absolute top-0 left-0 w-1 h-full bg-aurora-mint" />
              <strong className="text-aurora-mint uppercase font-display tracking-wider text-[9px] block mb-1">
                Key Takeaway
              </strong>
              <p className="leading-relaxed text-[11.5px]">{explanation.keyTakeaway}</p>
            </div>
          )}
        </div>

        {/* Action Prompt */}
        <div className="mt-6 pt-4 border-t border-border-subtle flex items-start gap-2.5 bg-bg-deep/10 p-2.5 rounded-lg">
          <div className="w-5 h-5 rounded bg-aurora-indigo/25 text-text-accent flex items-center justify-center font-mono text-xs flex-shrink-0">
            ℹ️
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-text-muted leading-none">
              Interactive Goal
            </span>
            <p className="text-xs text-text-secondary mt-1">
              {explanation.interactiveGoal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
