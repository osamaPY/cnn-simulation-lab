import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sceneTransition } from '../../animations/motion'
import { useScrubTimeline } from '../../animations/useScrubTimeline'
import { remap } from '../../animations/mathUtils'

export const SoftmaxStage: React.FC = () => {
  const prediction = useLabStore((state) => state.prediction)
  const shouldReduceMotion = useReducedMotion()
  const { progress } = useScrubTimeline(2600, true)

  const probabilitySum = useMemo(
    () => prediction?.probabilities.reduce((sum, p) => sum + p, 0) ?? 0,
    [prediction],
  )

  const barsProgress = remap(progress, 0.38, 1.0, 0, 1)

  if (!prediction) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-bg-card/20 p-8 text-center text-text-muted">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          Awaiting model probabilities
        </h4>
        <p className="mt-2 max-w-[240px] text-xs text-text-muted">
          Add the exported model, then draw a digit and run the simulation.
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 px-1 softmax-stage-wrapper">
      <div className="flex flex-col overflow-hidden rounded-xl border border-border-muted bg-bg-panel shadow-2xl">
        <div className="grid grid-cols-12 gap-2 border-b border-border-muted p-3 sm:p-4 text-[12px] font-mono font-semibold uppercase tracking-wider text-text-secondary bg-black/20">
          <div className="col-span-2 text-center">Digit</div>
          <div className="col-span-8 px-4">Probability</div>
          <div className="col-span-2 text-right">%</div>
        </div>

        <div className="flex flex-col divide-y divide-border-subtle/50">
          {prediction.probabilities.map((probability, digit) => {
            const isWinner = digit === prediction.digit
            const animatedP = shouldReduceMotion ? probability : probability * barsProgress
            return (
              <motion.div
                className={`grid grid-cols-12 items-center gap-2 p-2.5 sm:p-3.5 transition-colors duration-300 ${
                  isWinner ? 'bg-aurora-mint/8' : ''
                }`}
                key={digit}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        delay: 0.3 + digit * 0.045,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }
                }
              >
                <div className="col-span-2 flex justify-center">
                  <div
                    className={`flex h-8.5 w-8.5 items-center justify-center rounded-full text-[13px] font-bold font-display transition-all duration-300 ${
                      isWinner
                        ? 'bg-aurora-mint text-bg-deep shadow-[0_0_12px_rgba(52,211,153,0.45)]'
                        : 'border border-border-muted bg-bg-deep text-text-secondary'
                    }`}
                  >
                    {digit}
                  </div>
                </div>
                <div className="col-span-8 flex h-full items-center px-4">
                  <div className="relative h-2.5 w-full overflow-hidden rounded border border-border-subtle bg-black/40">
                    <motion.div
                      animate={{ scaleX: animatedP }}
                      className={`h-full w-full origin-left rounded-r ${
                        isWinner
                          ? 'bg-gradient-to-r from-aurora-teal to-aurora-mint'
                          : 'bg-aurora-purple/45'
                      }`}
                      initial={shouldReduceMotion ? { scaleX: probability } : { scaleX: 0 }}
                      transition={shouldReduceMotion ? { duration: 0 } : sceneTransition}
                    />
                    {/* Winner breathing glow */}
                    {isWinner && !shouldReduceMotion && (
                      <motion.div
                        className="absolute inset-0 origin-left rounded-r bg-aurora-mint/25"
                        style={{ scaleX: animatedP }}
                        animate={{ opacity: [0.25, 0.65, 0.25] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.2,
                          ease: 'easeInOut',
                          delay: 0.5,
                        }}
                      />
                    )}
                  </div>
                </div>
                <div
                  className={`col-span-2 text-right text-[12px] sm:text-sm font-semibold font-mono ${
                    isWinner ? 'text-aurora-mint' : 'text-text-primary'
                  }`}
                >
                  {(probability * 100).toFixed(1)}%
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-12 items-center gap-2 border-t border-border-muted bg-bg-deep/50 p-3 sm:p-4 text-[12px] sm:text-sm font-mono text-text-secondary">
          <div className="col-span-10 font-semibold">Probability sum</div>
          <div className="col-span-2 text-right font-bold text-text-primary">{probabilitySum.toFixed(4)}</div>
        </div>
      </div>
    </div>
  )
}
