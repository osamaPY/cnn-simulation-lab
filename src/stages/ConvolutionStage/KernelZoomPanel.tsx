/**
 * KernelZoomPanel — the 3b1b "zoom in on the kernel" panel.
 * Shows the 3x3 patch from the input image side-by-side with the kernel
 * weights, then animates an element-wise multiply highlight, then shows
 * the Σ = sum line being written.
 */
import React, { useMemo } from 'react';
import { AnimatedFormula } from '../../components/AnimatedFormula';
import { remap, smoothstep } from '../../animations/mathUtils';

interface KernelZoomPanelProps {
  row: number;
  col: number;
  inputData: Float32Array;
  kernel: number[];
  outputValue: number;
  progress: number;   // 0..1 (timeline driven)
}

export const KernelZoomPanel: React.FC<KernelZoomPanelProps> = ({
  row, col, inputData, kernel, outputValue, progress
}) => {
  // Extract the 3x3 patch around current position
  const patch = useMemo(() => {
    const cells: number[] = [];
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        const r = row + dr;
        const c = col + dc;
        cells.push(inputData[r * 28 + c] ?? 0);
      }
    }
    return cells;
  }, [row, col, inputData]);

  // Phase breakdown:
  //   0.00 – 0.30  patch + kernel appear
  //   0.30 – 0.70  element-wise highlight sweep
  //   0.70 – 1.00  formula Σ draws on
  const cellHighlightIdx = Math.floor(remap(progress, 0.30, 0.70, 0, 9));
  const formulaProgress = remap(progress, 0.70, 1.0, 0, 1);
  const panelOpacity = smoothstep(remap(progress, 0, 0.15, 0, 1));

  const products = patch.map((p, i) => p * kernel[i]);
  const sum = products.reduce((a, b) => a + b, 0);

  const CELL_SIZE = 36;
  const GAP = 2;

  const renderGrid = (values: number[], highlight: number, colorFn: (v: number) => string) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${CELL_SIZE}px)`,
        gap: GAP,
      }}
    >
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            borderRadius: 4,
            background: colorFn(v),
            border: i === highlight && progress >= 0.3
              ? '2px solid #f2c14e'
              : '1px solid rgba(255,255,255,0.08)',
            color: Math.abs(v) > 0.5 ? '#fff' : 'rgba(255,255,255,0.6)',
            transition: 'border 0.1s',
            boxShadow: i === highlight && progress >= 0.3
              ? '0 0 10px rgba(242,193,78,0.6)'
              : 'none',
          }}
        >
          {v.toFixed(2)}
        </div>
      ))}
    </div>
  );

  return (
    <div
      style={{
        opacity: panelOpacity,
        background: 'rgba(10,18,28,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 260,
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Kernel × Patch — position ({row + 1}, {col + 1})
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Input patch */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>INPUT</span>
          {renderGrid(
            patch,
            cellHighlightIdx,
            v => `rgba(255,255,255,${0.06 + v * 0.88})`
          )}
        </div>

        {/* × */}
        <div style={{ fontSize: 18, color: '#f2c14e', fontFamily: 'monospace', fontWeight: 'bold', opacity: progress > 0.2 ? 1 : 0, transition: 'opacity 0.3s' }}>×</div>

        {/* Kernel */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>KERNEL</span>
          {renderGrid(
            kernel,
            cellHighlightIdx,
            v => v > 0 ? `rgba(52,211,153,${0.08 + v * 0.45})` : `rgba(255,128,102,${0.08 + Math.abs(v) * 0.45})`
          )}
        </div>
      </div>

      {/* Animated formula */}
      {formulaProgress > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <AnimatedFormula
            formula={`Σ(x·w) + b = ${outputValue.toFixed(3)}`}
            progress={formulaProgress}
            color="#34d399"
            fontSize="0.85rem"
          />
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
            raw products sum: {sum.toFixed(3)}
          </span>
        </div>
      )}
    </div>
  );
};
