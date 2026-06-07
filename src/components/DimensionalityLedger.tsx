import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

export const DimensionalityLedger: React.FC = () => {
  const hyperparams = useLabStore(state => state.hyperparams);
  const K = hyperparams.kernelSize;
  const P = hyperparams.padding;
  const S = hyperparams.stride;
  const Pool = hyperparams.poolingSize;
  const Nf = hyperparams.numFilters;

  // Calculate dimensions step-by-step
  const c1 = Math.max(1, Math.floor((28 - K + 2 * P) / S) + 1);
  const p1 = Math.max(1, Math.floor(c1 / Pool));
  const c2 = Math.max(1, Math.floor((p1 - K + 2 * P) / S) + 1);
  const p2 = Math.max(1, Math.floor(c2 / Pool));
  const flat = p2 * p2 * Nf * 2;

  const rows = [
    {
      layer: '1. Input Canvas',
      formula: 'Raw image grid',
      math: '28 × 28 × 1',
      output: '28 × 28 × 1',
      color: 'text-aurora-teal',
    },
    {
      layer: '2. Conv Block 1',
      formula: 'floor((W_in - K + 2P) / S) + 1',
      math: `floor((28 - ${K} + 2·${P}) / ${S}) + 1`,
      output: `${c1} × ${c1} × ${Nf}`,
      color: 'text-text-accent',
    },
    {
      layer: '3. Pool 1',
      formula: 'floor(W_in / Pool)',
      math: `floor(${c1} / ${Pool})`,
      output: `${p1} × ${p1} × ${Nf}`,
      color: 'text-aurora-mint',
    },
    {
      layer: '4. Conv Block 2',
      formula: 'floor((W_in - K + 2P) / S) + 1',
      math: `floor(${p1} - ${K} + 2·${P}) / ${S}) + 1`,
      output: `${c2} × ${c2} × ${Nf * 2}`,
      color: 'text-text-accent',
    },
    {
      layer: '5. Pool 2',
      formula: 'floor(W_in / Pool)',
      math: `floor(${c2} / ${Pool})`,
      output: `${p2} × ${p2} × ${Nf * 2}`,
      color: 'text-aurora-mint',
    },
    {
      layer: '6. Flatten',
      formula: 'W × H × C',
      math: `${p2} · ${p2} · ${Nf * 2}`,
      output: `1 × ${flat}`,
      color: 'text-aurora-purple',
    },
    {
      layer: '7. Dense',
      formula: 'Fully connected projection',
      math: 'Synapse count: 400 × 64',
      output: '1 × 64',
      color: 'text-aurora-purple',
    },
    {
      layer: '8. Output Class',
      formula: 'Softmax probability logits',
      math: 'Digit categories 0-9',
      output: '1 × 10',
      color: 'text-signal-coral',
    },
  ];

  return (
    <div className="flex flex-col gap-3.5 bg-black/40 border border-white/10 rounded-xl p-4 shadow-inner">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider font-bold">
          Network Dimensionality Ledger
        </span>
        <div className="flex gap-4 text-[9px] font-mono text-white/30 uppercase">
          <span>Kernel <strong className="text-white">{K}x{K}</strong></span>
          <span>Stride <strong className="text-white">{S}</strong></span>
          <span>Padding <strong className="text-white">{P}</strong></span>
          <span>Pool <strong className="text-white">{Pool}x{Pool}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto w-full no-scrollbar">
        <table className="w-full text-[10px] font-mono text-left border-collapse min-w-[550px]">
          <thead>
            <tr className="border-b border-white/5 text-white/40 text-[9px] uppercase tracking-wider">
              <th className="py-1.5 pr-4">Layer Name</th>
              <th className="py-1.5 px-3">Dimension Formula</th>
              <th className="py-1.5 px-3">Hyperparameter Substitution</th>
              <th className="py-1.5 pl-4 text-right">Output Shape (W×H×C)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/70">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-2 pr-4 font-bold text-white/90">{row.layer}</td>
                <td className="py-2 px-3 text-white/50">{row.formula}</td>
                <td className="py-2 px-3 text-white/30">{row.math}</td>
                <td className={`py-2 pl-4 text-right font-bold ${row.color}`}>{row.output}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1 text-center">
        * Ledger recalculates instantly when you modify stride, padding, kernel, pool size or filter count in the sidebar.
      </div>
    </div>
  );
};
