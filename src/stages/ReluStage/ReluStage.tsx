import { useEffect, useMemo, useRef } from 'react'
import { useTimeline } from '../../animations/useTimeline'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { computeValidConv2D, REPRESENTATIVE_BIAS, REPRESENTATIVE_KERNEL } from '../../math/convolution'

const SIZE = 26

export function ReluStage() {
  const preprocessedData = useLabStore((state) => state.preprocessedData)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const totalSteps = SIZE
  const { stepIndex } = useTimeline(totalSteps, true)

  const values = useMemo(
    () =>
      preprocessedData
        ? computeValidConv2D(preprocessedData, REPRESENTATIVE_KERNEL, REPRESENTATIVE_BIAS)
        : new Float32Array(SIZE * SIZE),
    [preprocessedData],
  )

  const stats = useMemo(() => {
    let negative = 0
    let positive = 0
    let maxMagnitude = 0
    values.forEach((value) => {
      if (value < 0) negative++
      if (value > 0) positive++
      maxMagnitude = Math.max(maxMagnitude, Math.abs(value))
    })
    return { negative, positive, maxMagnitude: maxMagnitude || 1 }
  }, [values])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const cell = canvas.width / SIZE
    const completedRows = shouldReduceMotion ? SIZE : stepIndex + 1
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        const raw = values[row * SIZE + col]
        const value = row < completedRows ? Math.max(0, raw) : raw
        const strength = Math.min(1, Math.abs(value) / stats.maxMagnitude)
        context.fillStyle =
          value < 0
            ? `rgba(255, 128, 102, ${0.18 + strength * 0.82})`
            : `rgba(52, 211, 153, ${0.06 + strength * 0.94})`
        context.fillRect(col * cell, row * cell, cell, cell)
      }
    }

    if (completedRows < SIZE) {
      context.strokeStyle = '#f2c14e'
      context.lineWidth = 2
      context.strokeRect(0, completedRows * cell, canvas.width, 1)
    }
  }, [shouldReduceMotion, stats.maxMagnitude, stepIndex, values])

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4">
      <div className="grid w-full max-w-2xl gap-8 md:grid-cols-[1fr_220px] py-4">
        {/* Canvas panel */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
            <span>Pre-activation to ReLU output</span>
            <span>{SIZE}x{SIZE}</span>
          </div>
          <canvas ref={canvasRef} width={312} height={312} className="mx-auto block h-auto w-full max-w-[312px] rounded-xl bg-black border border-white/5" />
        </div>

        {/* Info & Hinge graph panel */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-xl">
            <p className="text-[10px] font-mono uppercase text-aurora-mint tracking-wider">ReLU Rule</p>
            <p className="mt-2 text-xl font-semibold text-white font-mono">f(x) = max(0, x)</p>
            <svg viewBox="0 0 180 110" className="mt-4 w-full" aria-label="ReLU hinge graph">
              <path d="M20 90H165M70 100V15" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <path d="M20 90H70L155 20" fill="none" stroke="var(--aurora-mint)" strokeWidth="4" strokeLinecap="round" />
              <text x="150" y="102" fill="rgba(255,255,255,0.4)" fontSize="10">x</text>
              <text x="77" y="20" fill="rgba(255,255,255,0.4)" fontSize="10">f(x)</text>
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-center text-[10px] font-mono">
            <div className="rounded-xl border border-signal-coral/20 bg-signal-coral/5 text-signal-coral">
              {stats.negative} clipped
            </div>
            <div className="rounded-xl border border-aurora-mint/20 bg-aurora-mint/5 p-2.5 text-aurora-mint">
              {stats.positive} kept
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
