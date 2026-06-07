import { useEffect, useMemo, useRef } from 'react'
import { useTimeline } from '../../animations/useTimeline'
import { TimelineStepper } from '../../components/TimelineStepper'
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
    <div className="flex w-full flex-col items-center gap-5 p-4">
      <div className="grid w-full max-w-2xl gap-5 md:grid-cols-[1fr_220px]">
        <div className="rounded-xl border border-border-muted bg-bg-deep/60 p-3">
          <div className="mb-3 flex items-center justify-between text-[10px] font-mono uppercase text-text-muted">
            <span>Pre-activation to ReLU output</span>
            <span>{SIZE}x{SIZE}</span>
          </div>
          <canvas ref={canvasRef} width={312} height={312} className="mx-auto block h-auto w-full max-w-[312px] rounded-lg bg-black" />
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border-muted bg-bg-panel p-4">
            <p className="text-[10px] font-mono uppercase text-text-accent">ReLU rule</p>
            <p className="mt-2 text-lg font-semibold text-text-primary font-mono">f(x) = max(0, x)</p>
            <svg viewBox="0 0 180 110" className="mt-3 w-full" aria-label="ReLU hinge graph">
              <path d="M20 90H165M70 100V15" stroke="var(--border-muted)" strokeWidth="1.5" />
              <path d="M20 90H70L155 20" fill="none" stroke="var(--aurora-mint)" strokeWidth="4" strokeLinecap="round" />
              <text x="150" y="102" fill="var(--text-muted)" fontSize="10">x</text>
              <text x="77" y="20" fill="var(--text-muted)" fontSize="10">f(x)</text>
            </svg>
          </div>
          <div className="rounded-xl border border-border-subtle bg-bg-deep/50 p-3 text-[10px] leading-relaxed text-text-muted">
            <strong className="text-text-secondary">Representative-kernel view:</strong> the input and
            convolution math are real; the displayed kernel is the explicitly simplified educational filter.
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
            <div className="rounded-lg border border-aurora-indigo/30 bg-aurora-indigo/10 p-2 text-text-secondary">
              {stats.negative} negatives clipped
            </div>
            <div className="rounded-lg border border-aurora-mint/30 bg-aurora-mint/10 p-2 text-aurora-mint">
              {stats.positive} positives kept
            </div>
          </div>
        </div>
      </div>
      <TimelineStepper stageTotalSteps={totalSteps} />
    </div>
  )
}
