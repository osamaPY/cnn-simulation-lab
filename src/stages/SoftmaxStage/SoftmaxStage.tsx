import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sceneTransition } from '../../animations/motion'

export const SoftmaxStage: React.FC = () => {
  const prediction = useLabStore((state) => state.prediction)
  const shouldReduceMotion = useReducedMotion()

  const probabilitySum = useMemo(
    () => prediction?.probabilities.reduce((sum, probability) => sum + probability, 0) ?? 0,
    [prediction],
  )

  if (!prediction) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-bg-card/20 p-8 text-center text-text-muted">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          Awaiting model probabilities
        </h4>
        <p className="mt-2 max-w-[240px] text-xs text-text-muted">
          Add the exported model, then draw a digit and run the simulation to inspect real Softmax output.
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 px-2">
      <div className="flex flex-col overflow-hidden rounded border border-border-muted bg-bg-panel">
        <div className="grid grid-cols-12 gap-2 border-b border-border-muted p-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
          <div className="col-span-2 text-center">Digit</div>
          <div className="col-span-8 px-4">Probability</div>
          <div className="col-span-2 text-right">Percent</div>
        </div>

        <div className="flex flex-col divide-y divide-border-subtle/50">
          {prediction.probabilities.map((probability, digit) => {
            const isWinner = digit === prediction.digit
            return (
              <div
                className={`grid grid-cols-12 items-center gap-2 p-2.5 ${isWinner ? 'bg-aurora-mint/5' : ''}`}
                key={digit}
              >
                <div className="col-span-2 flex justify-center">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold font-display ${isWinner ? 'bg-aurora-mint text-bg-deep' : 'border border-border-muted bg-bg-deep text-text-secondary'}`}>
                    {digit}
                  </div>
                </div>
                <div className="col-span-8 flex h-full items-center px-4">
                  <div className="relative h-2 w-full overflow-hidden rounded border border-border-subtle bg-black/40">
                    <motion.div
                      animate={{ scaleX: probability }}
                      className={`h-full w-full origin-left rounded-r ${isWinner ? 'bg-text-accent' : 'bg-aurora-purple/55'}`}
                      initial={shouldReduceMotion ? { scaleX: probability } : { scaleX: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
                    />
                  </div>
                </div>
                <div className={`col-span-2 text-right text-xs font-semibold font-mono ${isWinner ? 'text-aurora-mint' : 'text-text-primary'}`}>
                  {(probability * 100).toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-12 items-center gap-2 border-t border-border-muted bg-bg-deep/50 p-3 text-xs font-mono text-text-secondary">
          <div className="col-span-10 font-semibold">Probability sum</div>
          <div className="col-span-2 text-right font-bold text-text-primary">{probabilitySum.toFixed(4)}</div>
        </div>
      </div>
    </div>
  )
}
