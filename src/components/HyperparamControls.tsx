import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

export const HyperparamControls: React.FC = () => {
  const hyperparams = useLabStore(state => state.hyperparams);
  const updateHyperparams = useLabStore(state => state.updateHyperparams);

  const [activeInfo, setActiveInfo] = React.useState<string | null>(null);

  const controls: { key: keyof typeof hyperparams; label: string; min: number; max: number; step: number; icon: string; description: string }[] = [
    { key: 'kernelSize', label: 'Kernel', min: 1, max: 7, step: 2, icon: '⧉', description: 'Size of the sliding window that extracts features.' },
    { key: 'stride', label: 'Stride', min: 1, max: 3, step: 1, icon: '↠', description: 'Step size of the filter as it moves across the image.' },
    { key: 'padding', label: 'Padding', min: 0, max: 3, step: 1, icon: '□', description: 'Zero-padding added to the borders of the input.' },
    { key: 'poolingSize', label: 'Pool', min: 2, max: 4, step: 1, icon: '◰', description: 'Downsampling factor for reducing spatial resolution.' },
    { key: 'numFilters', label: 'Filters', min: 1, max: 32, step: 1, icon: '⫘', description: 'Number of unique feature extractors in this layer.' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col gap-0.5 mb-2">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-aurora-purple/60">Tuning</h3>
      </div>

      <div className="flex flex-col gap-2">
        {controls.map((ctrl) => (
          <div 
            key={ctrl.key} 
            className="flex flex-col gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-aurora-purple/20 transition-all group relative"
            onMouseEnter={() => setActiveInfo(ctrl.description)}
            onMouseLeave={() => setActiveInfo(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">{ctrl.label}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-aurora-purple">
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
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-aurora-purple transition-all"
            />
          </div>
        ))}
      </div>

      <div className="h-12 flex items-center justify-center px-2">
        <AnimatePresence mode="wait">
          {activeInfo && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[9px] font-mono text-aurora-purple/50 leading-tight italic text-center"
            >
              {activeInfo}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
