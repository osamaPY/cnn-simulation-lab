import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
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
    <div className="flex w-full h-full flex-col gap-6 p-4 sm:p-8 softmax-stage-wrapper overflow-hidden relative">
      {/* Top Header Section - Floating to the edge */}
      <div className="flex justify-between items-end w-full mb-2 px-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-serif font-bold italic text-white/95">Softmax Distribution Profile</h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-aurora-mint/10 border border-aurora-mint/20">
               <div className="w-1.5 h-1.5 rounded-full bg-aurora-mint animate-pulse" />
               <span className="text-[10px] font-mono text-aurora-mint uppercase tracking-wider font-bold">Confidence Signal</span>
             </div>
             <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Normalizing {prediction.probabilities.length} raw logits</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Probability sum</span>
          <div className="text-xl font-mono font-bold text-aurora-mint tabular-nums">
            {probabilitySum.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-height-0 overflow-hidden">
        {/* Main List Panel */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-2 border-b border-white/5 p-4 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-white/40 bg-white/5">
            <div className="col-span-2 text-center">Digit</div>
            <div className="col-span-8 px-4">Confidence Distribution</div>
            <div className="col-span-2 text-right">Probability</div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/[0.03]">
            {prediction.probabilities.map((probability, digit) => {
              const isWinner = digit === prediction.digit
              const animatedP = shouldReduceMotion ? probability : probability * barsProgress
              return (
                <motion.div
                  className={`grid grid-cols-12 items-center gap-2 p-3 sm:p-4 transition-all duration-500 ${
                    isWinner ? 'bg-aurora-mint/[0.07]' : 'hover:bg-white/[0.02]'
                  }`}
                  key={digit}
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          delay: 0.1 + digit * 0.05,
                          duration: 0.6,
                          ease: [0.16, 1, 0.3, 1],
                        }
                  }
                >
                  <div className="col-span-2 flex justify-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold font-display transition-all duration-500 ${
                        isWinner
                          ? 'bg-aurora-mint text-bg-deep shadow-[0_0_20px_rgba(131,193,103,0.4)] rotate-0 scale-110'
                          : 'border border-white/10 bg-black/40 text-white/40'
                      }`}
                    >
                      {digit}
                    </div>
                  </div>
                  <div className="col-span-8 flex h-full items-center px-4">
                    <div className="relative h-4 w-full overflow-hidden rounded-lg border border-white/5 bg-black/60 shadow-inner">
                      <motion.div
                        animate={{ scaleX: animatedP }}
                        className={`absolute inset-0 origin-left ${
                          isWinner
                            ? 'bg-gradient-to-r from-aurora-teal via-aurora-mint to-white/40'
                            : 'bg-white/10'
                        }`}
                        initial={shouldReduceMotion ? { scaleX: probability } : { scaleX: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1, ease: [0.19, 1, 0.22, 1] }}
                      />
                      
                      {isWinner && !shouldReduceMotion && (
                        <motion.div
                          className="absolute inset-0 origin-left bg-white/20"
                          style={{ scaleX: animatedP }}
                          animate={{ opacity: [0, 0.4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        />
                      )}

                      {/* Tick Marks for scale */}
                      <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
                        {[...Array(11)].map((_, i) => (
                          <div key={i} className="h-full w-px bg-white/20" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`col-span-2 text-right text-base sm:text-lg font-bold font-mono tabular-nums tracking-tight ${
                      isWinner ? 'text-aurora-mint drop-shadow-[0_0_8px_rgba(131,193,103,0.3)]' : 'text-white/40'
                    }`}
                  >
                    {(probability * 100).toFixed(2)}%
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Info/Math Side Panel */}
        <div className="hidden lg:flex w-72 flex-col gap-4 overflow-y-auto no-scrollbar">
          <div className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm flex flex-col gap-3">
             <span className="text-[10px] font-mono text-aurora-purple uppercase tracking-widest font-bold">Operation Logic</span>
             <h4 className="text-sm font-serif font-bold italic text-white/90">Normalized Exponential</h4>
             <p className="text-[11px] leading-relaxed text-white/40 font-sans">
               Softmax turns raw 'logit' scores into a probability distribution. It exponentiates each score (making them all positive) and divides by the sum.
             </p>
             <div className="mt-2 p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-aurora-purple/90 italic">
                σ(z)ᵢ = eᶻⁱ / Σ eᶻʲ
             </div>
          </div>

          <div className="flex-1 p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm flex flex-col gap-4">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-aurora-mint uppercase tracking-widest font-bold">Winner Insight</span>
                <p className="text-[11px] leading-relaxed text-white/40 font-sans">
                  The network is <span className="text-aurora-mint font-bold">{(prediction.probabilities[prediction.digit] * 100).toFixed(1)}%</span> confident that the input is a 
                  <span className="text-white font-bold text-xs bg-white/10 px-1.5 py-0.5 rounded ml-1 italic">{prediction.digit}</span>.
                </p>
             </div>
             
             <div className="flex-1 flex flex-col justify-end gap-2 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-[10px] font-mono">
                   <span className="text-white/30 uppercase">Entropy Level</span>
                   <span className="text-white/60">Low (Confident)</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                   <div className="h-full bg-aurora-mint/40 w-[85%]" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

