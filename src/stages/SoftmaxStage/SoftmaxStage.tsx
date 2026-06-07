import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { sceneTransition } from '../../animations/motion'
import { AnimatedFormula } from '../../components/AnimatedFormula'
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

  const formulaProgress = remap(progress, 0.0, 0.45, 0, 1)
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
    <div className="flex w-full max-w-2xl flex-col gap-5 px-2">
      {/* Formula draws on first */}
      <div className="flex flex-col gap-1 px-1">
        <AnimatedFormula
          formula="σ(zᵢ) = exp(zᵢ) / Σ exp(zⱼ)"
          progress={formulaProgress}
          color="#a78bfa"
          fontSize="1.05rem"
        />
        <motion.p
          className="text-[10px] font-mono text-white/35 mt-0.5"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Raw logit scores → normalised probabilities summing to 1.0
        </motion.p>
      </div>

      <div className="flex flex-col overflow-hidden rounded border border-border-muted bg-bg-panel">
        <div className="grid grid-cols-12 gap-2 border-b border-border-muted p-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-text-secondary">
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
                className={`grid grid-cols-12 items-center gap-2 p-2.5 transition-colors duration-300 ${
                  isWinner ? 'bg-aurora-mint/8' : ''
                }`}
                key={digit}
                initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.35 + digit * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="col-span-2 flex justify-center">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold font-display transition-all duration-300 ${
                    isWinner
                      ? 'bg-aurora-mint text-bg-deep shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                      : 'border border-border-muted bg-bg-deep text-text-secondary'
                  }`}>
                    {digit}
                  </div>
                </div>
                <div className="col-span-8 flex h-full items-center px-4">
                  <div className="relative h-2 w-full overflow-hidden rounded border border-border-subtle bg-black/40">
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
                    {/* Winner glow pulse */}
                    {isWinner && !shouldReduceMotion && (
                      <motion.div
                        className="absolute inset-0 origin-left rounded-r bg-aurora-mint/30"
                        style={{ scaleX: animatedP }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                      />
                    )}
                  </div>
                </div>
                <div className={`col-span-2 text-right text-xs font-semibold font-mono ${
                  isWinner ? 'text-aurora-mint' : 'text-text-primary'
                }`}>
                  {(probability * 100).toFixed(1)}%
                </div>
              </motion.div>
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
