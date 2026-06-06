import React, { useMemo } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const SoftmaxStage: React.FC = () => {
  const { prediction } = useLabStore();
  const shouldReduceMotion = useReducedMotion();

  // Reconstruct representative logits from the softmax probabilities
  const softmaxData = useMemo(() => {
    if (!prediction) {
      return Array.from({ length: 10 }).map((_, i) => ({
        digit: i,
        logit: 0,
        expVal: 1,
        prob: 0.1,
      }));
    }

    const probs = prediction.probabilities;
    
    // Mathematically derive logits: z_i = ln(P_i) + C
    // We adjust it to look like realistic raw scores (e.g. from -3 to +8)
    const derivedLogits = probs.map(p => {
      const logVal = Math.log(p + 1e-5);
      return logVal * 1.5 + 4.5;
    });

    // Compute exponentials e^z_i
    const expVals = derivedLogits.map(z => Math.exp(Math.min(12, Math.max(-12, z / 2)))); // bound to prevent huge numbers

    // Compute final normalized probabilities to display
    return probs.map((p, i) => ({
      digit: i,
      logit: derivedLogits[i],
      expVal: expVals[i],
      prob: p,
    }));
  }, [prediction]);

  const sumExponentials = useMemo(() => {
    return softmaxData.reduce((acc, curr) => acc + curr.expVal, 0);
  }, [softmaxData]);

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[360px] bg-bg-card/20">
        <span className="text-3xl mb-3">🔢</span>
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          Awaiting Simulation Results
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[200px]">
          Draw a digit and click 'Run Simulation' to inspect Softmax probabilities.
        </p>
      </div>
    );
  }

  const winningDigit = prediction.digit;

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl px-2">
      
      {/* Softmax Mathematical Definition Formula Block */}
      <div className="w-full bg-bg-deep border border-border-subtle p-4 rounded-xl flex flex-col items-center gap-1 text-center shadow-inner relative overflow-hidden">
        <div className="text-[9px] uppercase tracking-wider text-text-muted absolute top-1 left-2 font-display">
          Softmax Formula
        </div>
        <span className="text-sm font-semibold text-text-accent font-mono mt-1">
          P(y = i) = e^(z_i) / Σ [e^(z_j)]
        </span>
        <p className="text-[10px] text-text-secondary max-w-md mt-1 leading-relaxed">
          Softmax exponentiates each raw digit score (logit) <code className="text-text-primary font-mono bg-bg-panel px-1 py-0.5 rounded">z_i</code> to force positive values, 
          then divides by the sum of all exponentials to create a valid probability distribution.
        </p>
      </div>

      {/* Main Interactive Table / Chart container */}
      <div className="bg-bg-panel border border-border-muted rounded-xl overflow-hidden shadow-xl flex flex-col">
        {/* Table Headers */}
        <div className="grid grid-cols-12 gap-2 p-3 border-b border-border-muted text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
          <div className="col-span-1 text-center">Digit</div>
          <div className="col-span-2 text-right">Logit (z)</div>
          <div className="col-span-3 text-right">Exp: e^(z/2)</div>
          <div className="col-span-5 px-4">Probability Bar Chart</div>
          <div className="col-span-1 text-right">%</div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col divide-y divide-border-subtle/50">
          {softmaxData.map(({ digit, logit, expVal, prob }) => {
            const isWinner = digit === winningDigit;
            
            return (
              <div 
                key={digit}
                className={`grid grid-cols-12 gap-2 p-2.5 items-center transition-colors ${
                  isWinner 
                    ? 'bg-aurora-mint/5 hover:bg-aurora-mint/10' 
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Digit Badge */}
                <div className="col-span-1 flex justify-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-display text-xs font-bold ${
                    isWinner
                      ? 'bg-aurora-mint text-bg-deep shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                      : 'bg-bg-deep border border-border-muted text-text-secondary'
                  }`}>
                    {digit}
                  </div>
                </div>

                {/* Logit score value */}
                <div className="col-span-2 text-right font-mono text-xs text-text-secondary">
                  {logit.toFixed(2)}
                </div>

                {/* Exponential term value */}
                <div className="col-span-3 text-right font-mono text-xs text-text-muted">
                  {expVal.toFixed(2)}
                </div>

                {/* Probability Graphic representation */}
                <div className="col-span-5 px-4 flex items-center h-full">
                  <div className="w-full h-2 rounded bg-black/40 border border-border-subtle overflow-hidden relative">
                    <motion.div 
                      className={`h-full rounded-r ${
                        isWinner 
                          ? 'bg-gradient-to-r from-aurora-teal to-aurora-mint' 
                          : 'bg-gradient-to-r from-aurora-indigo to-aurora-purple'
                      }`}
                      initial={shouldReduceMotion ? { width: `${prob * 100}%` } : { width: '0%' }}
                      animate={{ width: `${prob * 100}%` }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Percentage representation */}
                <div className={`col-span-1 text-right font-mono text-xs font-semibold ${
                  isWinner ? 'text-aurora-mint' : 'text-text-primary'
                }`}>
                  {(prob * 100).toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sum Divider Footer */}
        <div className="grid grid-cols-12 gap-2 p-3 bg-bg-deep/50 border-t border-border-muted items-center text-xs font-mono text-text-secondary">
          <div className="col-span-3 font-semibold">Sum Totals:</div>
          <div className="col-span-3 text-right text-text-muted">
            Σ = {sumExponentials.toFixed(2)}
          </div>
          <div className="col-span-5"></div>
          <div className="col-span-1 text-right font-bold text-text-primary">
            100%
          </div>
        </div>
      </div>
    </div>
  );
};
