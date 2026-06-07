import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

export const HyperparamControls: React.FC = () => {
  const hyperparams = useLabStore(state => state.hyperparams);
  const updateHyperparams = useLabStore(state => state.updateHyperparams);

  const controls: { key: keyof typeof hyperparams; label: string; min: number; max: number; step: number; icon: string }[] = [
    { key: 'kernelSize', label: 'Kernel Size', min: 1, max: 7, step: 2, icon: '⧉' },
    { key: 'stride', label: 'Stride', min: 1, max: 3, step: 1, icon: '↠' },
    { key: 'padding', label: 'Padding', min: 0, max: 3, step: 1, icon: '□' },
    { key: 'poolingSize', label: 'Pool Size', min: 2, max: 4, step: 1, icon: '◰' },
    { key: 'numFilters', label: 'Filters', min: 1, max: 32, step: 1, icon: '⫘' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col gap-1">
        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-aurora-purple">System Parameters</h3>
        <p className="text-[10px] text-white/40 font-mono">Real-time simulation tuning</p>
      </div>

      <div className="flex flex-col gap-4">
        {controls.map((ctrl) => (
          <div key={ctrl.key} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-aurora-purple/30 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-aurora-purple/60 group-hover:text-aurora-purple transition-colors">{ctrl.icon}</span>
                <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider">{ctrl.label}</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-aurora-purple bg-aurora-purple/10 px-2 py-0.5 rounded">
                {hyperparams[ctrl.key]}
              </span>
            </div>
            
            <input
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={hyperparams[ctrl.key]}
              onChange={(e) => updateHyperparams({ [ctrl.key]: parseInt(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-aurora-purple hover:accent-aurora-mint transition-all"
            />
            
            <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase tracking-tighter">
               <span>Min: {ctrl.min}</span>
               <span>Max: {ctrl.max}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-aurora-purple/5 border border-aurora-purple/10">
        <p className="text-[10px] font-mono text-aurora-purple/70 leading-relaxed italic">
          "Changing these parameters affects the spatial dimensions and feature extraction capabilities of the network in real-time."
        </p>
      </div>
    </div>
  );
};
