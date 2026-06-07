import { useEffect, useMemo, useRef } from 'react'
import { useTimeline } from '../../animations/useTimeline'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { computeConv2D, REPRESENTATIVE_BIAS, REPRESENTATIVE_KERNEL } from '../../math/convolution'
import { ReluGraphCanvas } from './ReluGraphCanvas'
import { AnimatedFormula } from '../../components/AnimatedFormula'
import { remap } from '../../animations/mathUtils'

export function ReluStage() {
  const preprocessedData = useLabStore((state) => state.preprocessedData)
  const hyperparams = useLabStore((state) => state.hyperparams)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const activeKernel = useMemo(() => {
    const size = hyperparams.kernelSize;
    const values = new Float32Array(size * size).fill(0.1);
    for (let i = 0; i < Math.min(REPRESENTATIVE_KERNEL.length, values.length); i++) {
      values[i] = REPRESENTATIVE_KERNEL[i];
    }
    return values;
  }, [hyperparams.kernelSize]);

  const outputDim = Math.floor((28 + 2 * hyperparams.padding - hyperparams.kernelSize) / hyperparams.stride) + 1;
  const totalSteps = outputDim;
  const { stepIndex } = useTimeline(totalSteps, true)

  const values = useMemo(
    () =>
      preprocessedData
        ? computeConv2D(
            preprocessedData, 
            28, 
            activeKernel, 
            hyperparams.kernelSize, 
            hyperparams.stride, 
            hyperparams.padding, 
            REPRESENTATIVE_BIAS
          )
        : new Float32Array(outputDim * outputDim),
    [preprocessedData, activeKernel, hyperparams, outputDim],
  )

  const stats = useMemo(() => {
    let negative = 0
    let positive = 0
    let maxMagnitude = 0
    // Use for loop for compatibility
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value < 0) negative++
      if (value > 0) positive++
      maxMagnitude = Math.max(maxMagnitude, Math.abs(value))
    }
    return { negative, positive, maxMagnitude: maxMagnitude || 1 }
  }, [values])

  const sweepProgress = shouldReduceMotion ? 1 : stepIndex / (totalSteps - 1)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const cell = canvas.width / outputDim
    const completedRows = shouldReduceMotion ? outputDim : stepIndex + 1
    context.clearRect(0, 0, canvas.width, canvas.height)

    for (let row = 0; row < outputDim; row++) {
      for (let col = 0; col < outputDim; col++) {
        const raw = values[row * outputDim + col]
        const value = row < completedRows ? Math.max(0, raw) : raw
        const strength = Math.min(1, Math.abs(value) / stats.maxMagnitude)
        context.fillStyle =
          value < 0
            ? `rgba(255, 128, 102, ${0.18 + strength * 0.82})`
            : `rgba(52, 211, 153, ${0.06 + strength * 0.94})`
        context.fillRect(col * cell, row * cell, cell, cell)
      }
    }

    // 3b1b-style: glowing sweep line that advances row by row
    if (completedRows < outputDim) {
      const y = completedRows * cell
      context.save()
      context.shadowColor = '#34d399'
      context.shadowBlur = 18
      context.strokeStyle = '#34d399'
      context.lineWidth = 2.5
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(canvas.width, y)
      context.stroke()
      context.restore()
    }
  }, [shouldReduceMotion, stats.maxMagnitude, stepIndex, values, outputDim])

  // Pick a sample value for the probe line on the graph (~middle of scan)
  const rowIndex = Math.min(outputDim - 1, Math.floor(sweepProgress * outputDim));
  const colIndex = Math.floor(outputDim / 2);
  const sampleRawValue = values[rowIndex * outputDim + colIndex] ?? 0;
  const normalised = sampleRawValue / (stats.maxMagnitude || 1);

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1fr_280px] py-4 items-start">
        {/* Canvas panel */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between text-[10px] font-mono uppercase text-white/50">
            <span>ReLU mapping</span>
            <span>{outputDim}×{outputDim}</span>
          </div>
          <canvas ref={canvasRef} width={420} height={420} className="mx-auto block h-auto w-full max-w-[420px] rounded-xl bg-black border border-white/5" />
        </div>

        {/* Right panel: animated graph + formula */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 shadow-xl">
            {/* 3b1b animated graph */}
            <ReluGraphCanvas
              progress={sweepProgress}
              width={260}
              height={180}
              currentX={normalised * 3}
            />

            {/* Formula draws on after graph */}
            <div className="mt-3 flex flex-col gap-1">
              <AnimatedFormula
                formula="f(x) = max(0, x)"
                progress={remap(sweepProgress, 0.6, 1.0, 0, 1)}
                color="#34d399"
                fontSize="0.95rem"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-center text-[10px] font-mono">
            <div className="rounded-xl border border-signal-coral/20 bg-signal-coral/5 p-2.5 text-signal-coral">
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
