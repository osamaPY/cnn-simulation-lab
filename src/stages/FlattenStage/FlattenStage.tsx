import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTimeline } from '../../animations/useTimeline'
import { TimelineStepper } from '../../components/TimelineStepper'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const SAMPLE_INDICES = [0, 24, 63, 99, 143, 199, 255, 319, 367, 399]

export function FlattenStage() {
  const activations = useLabStore((state) => state.activations)
  const vectorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const shouldReduceMotion = useReducedMotion()
  const { stepIndex } = useTimeline(100, true)
  const progress = shouldReduceMotion ? 1 : stepIndex / 99

  const source = useMemo(
    () =>
      activations.find((record) => record.layerType === 'MaxPooling2D' && record.shape.join(',') === '1,5,5,16') ??
      activations.find((record) => record.layerType === 'Flatten' && record.shape.join(',') === '1,400'),
    [activations],
  )

  const values = useMemo(() => source?.values ?? new Float32Array(400), [source])
  const maxValue = useMemo(() => Math.max(...Array.from(values), 1e-6), [values])

  useEffect(() => {
    const canvas = vectorCanvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    const visible = Math.round(values.length * progress)
    const cellWidth = canvas.width / values.length
    for (let index = 0; index < visible; index++) {
      const strength = Math.max(0.04, values[index] / maxValue)
      context.fillStyle = `rgba(52, 211, 153, ${strength})`
      context.fillRect(index * cellWidth, 0, Math.max(1, cellWidth), canvas.height)
    }
  }, [maxValue, progress, values])

  const hoveredOrigin =
    hoveredIndex === null
      ? null
      : {
          row: Math.floor(hoveredIndex / (5 * 16)),
          col: Math.floor((hoveredIndex % (5 * 16)) / 16),
          channel: hoveredIndex % 16,
        }

  return (
    <div className="flex w-full flex-col items-center gap-5 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border-muted bg-bg-deep/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase text-text-muted">
          <span>Real final pooled activation</span>
          <span className="rounded border border-aurora-purple/30 bg-aurora-purple/10 px-2 py-1 text-text-accent">
            [1, 5, 5, 16] to [1, 400]
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
          <div className="grid grid-cols-5 gap-1 justify-self-center" aria-label="Representative final pooled map">
            {Array.from({ length: 25 }, (_, index) => {
              const value = values[index * 16] ?? 0
              return (
                <div
                  className="h-7 w-7 rounded-sm border border-border-subtle"
                  key={index}
                  style={{ backgroundColor: `rgba(80, 201, 230, ${Math.max(0.05, value / maxValue)})` }}
                />
              )
            })}
          </div>
          <div className="min-w-0">
            <p className="mb-2 text-center text-xs text-text-muted sm:text-left">16 channels become one 400-value vector</p>
            <div className="h-7 w-full overflow-hidden rounded border border-border-muted bg-black">
              <canvas ref={vectorCanvasRef} width={600} height={28} className="h-full w-full" />
            </div>
          </div>

          <motion.div
            animate={{ opacity: progress > 0 ? 1 : 0.3, scaleX: Math.max(0.05, progress) }}
            className="hidden h-px origin-left bg-text-accent sm:block sm:col-span-2"
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1 sm:grid-cols-10">
          {SAMPLE_INDICES.map((index) => (
            <button
              className={`rounded border px-1 py-2 text-[9px] font-mono ${hoveredIndex === index ? 'border-aurora-mint bg-aurora-mint/15 text-aurora-mint' : 'border-border-subtle bg-bg-panel text-text-muted'}`}
              key={index}
              onFocus={() => setHoveredIndex(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              type="button"
            >
              {index}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-text-muted">
          {hoveredOrigin
            ? `Vector index ${hoveredIndex} came from row ${hoveredOrigin.row}, column ${hoveredOrigin.col}, channel ${hoveredOrigin.channel}.`
            : 'Hover a sampled vector index to trace it back to its source coordinate.'}
        </p>
      </div>

      <TimelineStepper stageTotalSteps={100} />

      <div className="w-full max-w-2xl rounded-xl border border-border-subtle bg-bg-deep/50 p-3 text-center text-[10px] text-text-muted">
        The ten moving cells are a representative animation for performance. The full canvas strip uses all
        400 real activation values from the model.
      </div>
    </div>
  )
}
