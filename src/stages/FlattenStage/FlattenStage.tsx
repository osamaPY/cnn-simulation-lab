import { useEffect, useMemo, useRef, useState } from 'react'
import { useTimeline } from '../../animations/useTimeline'
import { useLabStore } from '../../hooks/useLabStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const SAMPLE_INDICES = [0, 15, 16, 79, 80, 159, 160, 319, 320, 399]

export function FlattenStage() {
  const activations = useLabStore((state) => state.activations)
  const vectorCanvasRef = useRef<HTMLCanvasElement | null>(null)
  
  // Track hovered coordinate and channel index
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoveredGridCell, setHoveredGridCell] = useState<number | null>(null)

  const shouldReduceMotion = useReducedMotion()
  const { stepIndex } = useTimeline(100, true)
  const progress = shouldReduceMotion ? 1 : stepIndex / 99

  const source = useMemo(
    () => {
      // Find the last MaxPooling2D or Flatten record regardless of hardcoded shape strings
      // Reverse find to get the one closest to the output if there are multiple (unlikely but safer)
      return [...activations].reverse().find(
        (record) => record.layerType === 'MaxPooling2D' || record.layerType === 'Flatten'
      );
    },
    [activations],
  )

  const values = useMemo(() => source?.values ?? new Float32Array(400), [source])
  const vectorLength = values.length || 400;

  const maxValue = useMemo(() => {
    let max = -Infinity;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > max) max = values[i];
    }
    return Math.max(max, 1e-6);
  }, [values])

  // Active cell in the spatial grid
  const activeGridIndex = useMemo(() => {
    return Math.min(24, Math.floor(progress * 25));
  }, [progress]);

  // Determine active item coordinates for the detail display
  const activeCellIndex = hoveredGridCell !== null ? hoveredGridCell : activeGridIndex;
  const activeRow = Math.floor(activeCellIndex / 5);
  const activeCol = activeCellIndex % 5;

  // Render 400-length Vector strip
  useEffect(() => {
    const canvas = vectorCanvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    const visibleCount = Math.round(vectorLength * progress)
    const cellWidth = canvas.width / vectorLength

    // Draw flattened values
    for (let index = 0; index < vectorLength; index++) {
      // Elements are only colored up to the scanning sweep index
      const isScanned = index < visibleCount
      const rawVal = values[index] ?? 0
      const strength = Math.max(0.02, rawVal / maxValue)

      // Check if this cell is highlighted by hovering
      const isHovered = hoveredIndex === index
      const belongsToHoveredCell = hoveredGridCell !== null && Math.floor(index / (vectorLength / 25)) === hoveredGridCell

      if (isHovered) {
        context.fillStyle = '#f5cd47' // Gold highlight for exact element
      } else if (belongsToHoveredCell) {
        context.fillStyle = 'rgba(88, 196, 221, 0.7)' // Cyan highlight for parent cell elements
      } else if (isScanned) {
        context.fillStyle = `rgba(16, 185, 129, ${strength})` // Mint for scanned elements
      } else {
        context.fillStyle = 'rgba(255, 255, 255, 0.03)' // Very dim grey for unscanned elements
      }

      context.fillRect(index * cellWidth, 0, Math.max(1, cellWidth - 0.2), canvas.height)
    }

    // Draw scanning laser sweep line
    if (visibleCount > 0 && visibleCount < vectorLength) {
      const x = visibleCount * cellWidth;
      context.shadowColor = '#10b981'; // Mint glow
      context.shadowBlur = 8;
      context.strokeStyle = '#34d399';
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
      context.shadowBlur = 0;
    }
  }, [maxValue, progress, values, hoveredIndex, hoveredGridCell, activeGridIndex])

  // Mouse coordinate tracker on the canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = vectorCanvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    const idx = Math.min(vectorLength - 1, Math.max(0, Math.floor(pct * vectorLength)))
    setHoveredIndex(idx)
    setHoveredGridCell(Math.floor(idx / (vectorLength / 25)))
  }

  const handleCanvasMouseLeave = () => {
    setHoveredIndex(null)
    setHoveredGridCell(null)
  }

  // Parse hovered element coordinates
  const hoveredOrigin = useMemo(() => {
    if (hoveredIndex === null) return null
    const channelsPerPixel = vectorLength / 25;
    return {
      row: Math.floor(hoveredIndex / (channelsPerPixel * 5)),
      col: Math.floor((hoveredIndex % (channelsPerPixel * 5)) / channelsPerPixel),
      channel: hoveredIndex % channelsPerPixel,
      value: values[hoveredIndex] ?? 0,
    }
  }, [hoveredIndex, values, vectorLength])

  return (
    <div className="flex w-full flex-col items-center gap-6 px-4 py-2 select-none">
      <div className="flex flex-col items-center gap-1 text-center w-full">
        <h4 className="text-xs font-mono text-aurora-teal uppercase tracking-widest">3D Tensor Flattening</h4>
        <p className="text-[10px] text-white/40 max-w-lg mt-0.5 leading-normal">
          Flattening unrolls a 3D volume into a 1D vector. We scan the 5×5 spatial grid row-by-row, and at each pixel, we peel off its 16 depth channels into the vector list.
        </p>
      </div>

      <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
          <span className="text-[10px] font-mono uppercase text-white/50">Flattening Simulation</span>
          <span className="rounded border border-aurora-teal/30 bg-aurora-teal/10 px-2.5 py-1 text-[10px] font-mono text-aurora-teal">
            Shape: [5 × 5 × 16] → [400] Vector
          </span>
        </div>

        {/* 3-Column Interactive Area */}
        <div className="grid gap-6 lg:grid-cols-[300px_260px_1fr] items-start">
          
          {/* Column 1: 3D Stacked Spatial Grids */}
          <div className="flex flex-col items-center gap-4 justify-self-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">1. Spatial Grids (16 Channels)</span>
            
            {/* The 2.5D Stack Container */}
            <div className="relative w-56 h-56 mt-6" style={{ perspective: '600px' }}>
              {/* Back Channel (Grid 3) */}
              <div 
                className="absolute inset-0 grid grid-cols-5 gap-1.5 p-2 bg-black/40 rounded-lg border border-white/5 pointer-events-none opacity-20 transition-all duration-300"
                style={{ transform: 'translate(20px, -20px) translateZ(-40px)' }}
              >
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div key={idx} className="h-8.5 w-8.5 rounded bg-aurora-teal/30" />
                ))}
              </div>

              {/* Middle Channel (Grid 2) */}
              <div 
                className="absolute inset-0 grid grid-cols-5 gap-1.5 p-2 bg-black/40 rounded-lg border border-white/5 pointer-events-none opacity-40 transition-all duration-300"
                style={{ transform: 'translate(10px, -10px) translateZ(-20px)' }}
              >
                {Array.from({ length: 25 }).map((_, idx) => (
                  <div key={idx} className="h-8.5 w-8.5 rounded bg-aurora-teal/40" />
                ))}
              </div>

              {/* Front Interactive Channel (Grid 1) */}
              <div 
                className="absolute inset-0 grid grid-cols-5 gap-1.5 p-2 bg-black/50 rounded-lg border border-white/10 shadow-2xl transition-all duration-300"
                style={{ transform: 'translate(0px, 0px) translateZ(0px)' }}
              >
                {Array.from({ length: 25 }, (_, idx) => {
                  // Compute representative intensity based on average of its 16 channels
                  let sumVal = 0;
                  for (let ch = 0; ch < 16; ch++) {
                    sumVal += values[idx * 16 + ch] ?? 0;
                  }
                  const avgVal = sumVal / 16;
                  const intensity = Math.min(1.0, avgVal / maxValue);

                  const isCurrentSweep = idx === activeGridIndex;
                  const isHovered = idx === hoveredGridCell;

                  return (
                    <button
                      key={idx}
                      className={`h-8.5 w-8.5 rounded transition-all relative outline-none flex items-center justify-center ${
                        isHovered
                          ? 'border-2 border-aurora-teal shadow-[0_0_12px_rgba(88,196,221,0.6)] scale-110 z-20'
                          : isCurrentSweep
                            ? 'border border-aurora-mint shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-105 z-10'
                            : 'border border-white/5 hover:border-white/20'
                      }`}
                      style={{ 
                        backgroundColor: isHovered 
                          ? `rgba(88, 196, 221, ${0.15 + intensity * 0.85})`
                          : isCurrentSweep 
                            ? `rgba(16, 185, 129, ${0.15 + intensity * 0.85})`
                            : `rgba(88, 196, 221, ${0.05 + intensity * 0.7})` 
                      }}
                      onMouseEnter={() => setHoveredGridCell(idx)}
                      onMouseLeave={() => setHoveredGridCell(null)}
                      type="button"
                    >
                      {/* Depth alignment helper dot */}
                      {(isHovered || isCurrentSweep) && (
                        <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-aurora-teal' : 'bg-aurora-mint'} animate-ping`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <span className="text-[8px] font-mono text-white/30 text-center mt-3">
              Hover cells to inspect channel depth.
            </span>
          </div>

          {/* Column 2: Pixel Depth Explorer (16 Channels Vertical Stack) */}
          <div className="flex flex-col items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 h-[280px] md:h-[320px]">
            <div className="text-center w-full">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 block">2. Pixel Channels</span>
              <span className="text-[8px] font-mono text-aurora-teal mt-0.5 block">
                Cell: ({activeRow}, {activeCol})
              </span>
            </div>

            {/* List of 16 Channels */}
            <div className="w-full flex-1 overflow-y-auto flex flex-col gap-1 pr-1 border-t border-white/5 pt-2 select-none">
              {Array.from({ length: 16 }).map((_, ch) => {
                const vectorIdx = activeCellIndex * 16 + ch;
                const val = values[vectorIdx] ?? 0;
                const strength = Math.max(0.04, val / maxValue);
                
                const isExactHovered = hoveredIndex === vectorIdx;

                return (
                  <div
                    key={ch}
                    className={`flex items-center justify-between text-[8px] font-mono p-1 rounded transition-colors ${
                      isExactHovered 
                        ? 'bg-[#f5cd47]/10 border border-[#f5cd47]/30 text-[#f5cd47] font-bold' 
                        : 'hover:bg-white/5 text-white/50 border border-transparent'
                    }`}
                  >
                    <span>Ch {ch.toString().padStart(2, '0')}</span>
                    
                    {/* Activation Bar */}
                    <div className="w-16 h-1 bg-black/40 rounded overflow-hidden mx-2 border border-white/5">
                      <div 
                        className="h-full rounded-r bg-aurora-teal"
                        style={{ 
                          width: `${strength * 100}%`,
                          opacity: isExactHovered ? 1.0 : 0.65 
                        }} 
                      />
                    </div>
                    
                    <span>{val.toFixed(2)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Column 3: 1D Flattened Vector Strip */}
          <div className="flex flex-col gap-4 self-stretch justify-between h-full">
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/30 text-center lg:text-left">
                3. Flattened 1D Vector (400 Elements)
              </span>
              
              <div 
                className="w-full h-20 bg-black rounded-xl border border-white/10 p-1.5 shadow-inner relative cursor-pointer"
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
              >
                <canvas 
                  ref={vectorCanvasRef} 
                  width={800} 
                  height={64} 
                  className="h-full w-full rounded-lg" 
                />
              </div>

              {/* Vector Scale Label */}
              <div className="flex justify-between text-[8px] font-mono text-white/30 px-1">
                <span>Idx: 0</span>
                <span>Unrolling Progress: {Math.round(progress * 100)}%</span>
                <span>Idx: 399</span>
              </div>
            </div>

            {/* Hover details box */}
            <div className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center justify-center text-center h-20">
              {hoveredOrigin ? (
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-mono text-[#f5cd47] font-bold uppercase tracking-wider">
                    Element mapping found!
                  </div>
                  <div className="text-[9px] font-mono text-white/60 leading-normal">
                    Vector index <span className="text-white font-bold">{hoveredIndex}</span> corresponds to: <br/>
                    pixel coordinate <span className="text-aurora-teal font-bold">({hoveredOrigin.row}, {hoveredOrigin.col})</span> · channel <span className="text-aurora-teal font-bold">{hoveredOrigin.channel}</span> · value <span className="text-aurora-mint font-bold">{hoveredOrigin.value.toFixed(4)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[9px] font-mono text-white/30 leading-normal max-w-sm">
                  Hover or slide your mouse over the 1D Vector strip to trace any element back to its exact grid coordinate and channel index!
                </div>
              )}
            </div>

            {/* Sample Button Shortcuts */}
            <div className="border-t border-white/5 pt-3">
              <div className="text-[8px] font-mono text-white/30 mb-2 uppercase tracking-widest">Sample coordinates</div>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {SAMPLE_INDICES.map((index) => (
                  <button
                    className={`rounded border py-1.5 text-[9px] font-mono transition-all outline-none ${
                      hoveredIndex === index 
                        ? 'border-[#f5cd47] bg-[#f5cd47]/10 text-[#f5cd47]' 
                        : 'border-white/10 bg-white/5 text-white/40 hover:text-white hover:border-white/20'
                    }`}
                    key={index}
                    onMouseEnter={() => {
                      setHoveredIndex(index)
                      setHoveredGridCell(Math.floor(index / 16))
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null)
                      setHoveredGridCell(null)
                    }}
                    type="button"
                  >
                    {index}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
