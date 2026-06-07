import { useEffect, useMemo, useRef, useState } from 'react'
import { useTimeline } from '../../animations/useTimeline'
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

  // Active cell in the 5x5 grid (25 cells total, each represents 16 flattened channels)
  const activeGridIndex = useMemo(() => {
    return Math.min(24, Math.floor(progress * 25));
  }, [progress]);

  useEffect(() => {
    const canvas = vectorCanvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    const visible = Math.round(values.length * progress)
    const cellWidth = canvas.width / values.length

    // Draw flattened values
    for (let index = 0; index < visible; index++) {
      const strength = Math.max(0.04, values[index] / maxValue)
      context.fillStyle = `rgba(52, 211, 153, ${strength})`
      context.fillRect(index * cellWidth, 0, Math.max(1, cellWidth), canvas.height)
    }

    // Draw a glowing neon laser sweep line at the leading edge
    if (visible > 0 && visible < values.length) {
      const x = visible * cellWidth;
      context.shadowColor = '#06b6d4'; // Cyan neon laser glow
      context.shadowBlur = 10;
      context.strokeStyle = '#22d3ee'; // Laser stroke color
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
      context.shadowBlur = 0; // Reset blur
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
    <div className="flex w-full flex-col items-center gap-6 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase text-white/50">
          <span>Unrolling activation</span>
          <span className="rounded border border-aurora-purple/30 bg-aurora-purple/10 px-2 py-1 text-text-accent">
            [1, 5, 5, 16] → [1, 400]
          </span>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
          {/* 5x5 Spatial Grid */}
          <div className="grid grid-cols-5 gap-1.5 justify-self-center relative p-2 bg-black/30 rounded-xl border border-white/5" aria-label="Representative final pooled map">
            {Array.from({ length: 25 }, (_, index) => {
              const value = values[index * 16] ?? 0;
              const isActive = index === activeGridIndex;
              return (
                <div
                  className={`h-8 w-8 rounded-md transition-all duration-150 relative ${
                    isActive 
                      ? 'border-2 border-aurora-mint shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-110 z-10' 
                      : 'border border-white/5'
                  }`}
                  key={index}
                  style={{ backgroundColor: `rgba(80, 201, 230, ${Math.max(0.05, value / maxValue)})` }}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 1D Flattened Vector Strip */}
          <div className="min-w-0">
            <p className="mb-2 text-center text-xs text-white/60 sm:text-left font-display">
              Unrolling channels into one 400-value vector
            </p>
            <div className="h-10 w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-inner p-1 relative">
              <canvas ref={vectorCanvasRef} width={600} height={32} className="h-full w-full rounded-lg" />
            </div>
            <div className="mt-2 flex justify-between text-[9px] font-mono text-white/40 px-1">
              <span>Index: 0</span>
              <span>Scanning: {Math.round(progress * 100)}%</span>
              <span>Index: 399</span>
            </div>
          </div>
        </div>

        {/* Trace sample vector indices */}
        <div className="mt-6 grid grid-cols-5 gap-1.5 sm:grid-cols-10 border-t border-white/5 pt-4">
          {SAMPLE_INDICES.map((index) => (
            <button
              className={`rounded-lg border px-1 py-2 text-[9px] font-mono transition-all ${
                hoveredIndex === index 
                  ? 'border-aurora-mint bg-aurora-mint/15 text-aurora-mint' 
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
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
        <p className="mt-4 text-center text-xs text-white/55 h-4 font-mono">
          {hoveredOrigin
            ? `Vector index ${hoveredIndex} maps to source: row ${hoveredOrigin.row}, col ${hoveredOrigin.col}, channel ${hoveredOrigin.channel}`
            : 'Hover a sampled vector index to trace it back to its source coordinate.'}
        </p>
      </div>
    </div>
  )
}
