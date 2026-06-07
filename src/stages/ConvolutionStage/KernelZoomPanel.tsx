/**
 * KernelZoomPanel — the 3b1b "zoom in on the kernel" panel.
 * Shows the 3x3 patch from the input image side-by-side with the kernel
 * weights, then animates an element-wise multiply highlight, then shows
 * the Σ = sum line being written.
 */
import React, { useMemo } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { AnimatedFormula } from '../../components/AnimatedFormula';
import { remap, smoothstep } from '../../animations/mathUtils';

interface KernelZoomPanelProps {
  row: number;
  col: number;
  inputData: Float32Array;
  kernel: Float32Array | number[];
  outputValue: number;
  progress: number;   // 0..1 (timeline driven)
}

export const KernelZoomPanel: React.FC<KernelZoomPanelProps> = ({
  row, col, inputData, kernel, outputValue, progress
}) => {
  const hyperparams = useLabStore(state => state.hyperparams);
  const kernelSize = hyperparams.kernelSize;
  const stride = hyperparams.stride;

  // Extract the patch around current position
  const patch = useMemo(() => {
    const cells: number[] = [];
    const dim = Math.sqrt(inputData.length);
    for (let dr = 0; dr < kernelSize; dr++) {
      for (let dc = 0; dc < kernelSize; dc++) {
        const r = row * stride + dr;
        const c = col * stride + dc;
        cells.push(inputData[r * dim + c] ?? 0);
      }
    }
    return cells;
  }, [row, col, inputData, kernelSize, stride]);

  // Phase breakdown:
  const numCells = kernelSize * kernelSize;
  const cellHighlightIdx = Math.floor(remap(progress, 0.30, 0.70, 0, numCells));
  const formulaProgress = remap(progress, 0.70, 1.0, 0, 1);
  const panelOpacity = smoothstep(remap(progress, 0, 0.15, 0, 1));

  const kernelArray = Array.from(kernel as number[]);
  const products = patch.map((p, i) => p * kernelArray[i]);
  const sum = products.reduce((a, b) => a + b, 0);

  const CELL_SIZE = Math.min(48, 180 / kernelSize);
  const GAP = 3;

  const renderGrid = (values: number[] | Float32Array, highlight: number, colorFn: (v: number) => string) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${kernelSize}, ${CELL_SIZE}px)`,
        gap: GAP,
      }}
    >
      {Array.from(values).map((v, i) => (
        <div
          key={i}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: kernelSize > 5 ? 8 : 10,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            borderRadius: 2,
            background: colorFn(v),
            border: i === highlight && progress >= 0.3
              ? '1.5px solid #F5CD47'
              : '1px solid rgba(255,255,255,0.05)',
            color: Math.abs(v) > 0.5 ? '#fff' : 'rgba(255,255,255,0.4)',
            transition: 'border 0.1s',
            boxShadow: i === highlight && progress >= 0.3
              ? '0 0 12px rgba(245,205,71,0.4)'
              : 'none',
          }}
        >
          {v.toFixed(1)}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        opacity: panelOpacity,
        background: '#1c1c1c',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        minWidth: 340,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        Kernel × Patch · ({row + 1}, {col + 1})
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center' }}>
        {/* Input patch */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#58C4DD', opacity: 0.5, fontFamily: 'monospace', fontWeight: 'bold' }}>INPUT</span>
          {renderGrid(
            patch,
            cellHighlightIdx,
            v => `rgba(88,196,221,${0.05 + v * 0.4})`
          )}
        </div>

        {/* × */}
        <div style={{ fontSize: 16, color: '#F5CD47', fontFamily: 'monospace', fontWeight: 'bold', opacity: progress > 0.2 ? 0.4 : 0, transition: 'opacity 0.3s' }}>×</div>

        {/* Kernel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#F5CD47', opacity: 0.5, fontFamily: 'monospace', fontWeight: 'bold' }}>KERNEL</span>
          {renderGrid(
            kernel,
            cellHighlightIdx,
            v => v > 0 ? `rgba(245,205,71,${0.08 + v * 0.3})` : `rgba(255,102,102,${0.08 + Math.abs(v) * 0.3})`
          )}
        </div>
      </div>

      {/* Animated formula */}
      {formulaProgress > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <AnimatedFormula
            formula={`Σ(x·w) + b = ${outputValue.toFixed(3)}`}
            progress={formulaProgress}
            color="#83C167"
            fontSize="0.95rem"
          />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            ACCUMULATED SUM: {sum.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
};
