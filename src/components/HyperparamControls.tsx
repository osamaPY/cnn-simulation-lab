import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';

const DEFAULT_HYPERPARAMS = {
  kernelSize: 3,
  stride: 1,
  padding: 0,
  poolingSize: 2,
  numFilters: 8,
};

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

  const isDefault = controls.every(c => hyperparams[c.key] === DEFAULT_HYPERPARAMS[c.key]);

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-aurora-purple/60">Tuning</h3>
        <AnimatePresence>
          {!isDefault && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              onClick={() => updateHyperparams(DEFAULT_HYPERPARAMS)}
              className="text-[9px] font-mono text-white/30 hover:text-aurora-purple/70 uppercase tracking-widest transition-colors"
              type="button"
              title="Reset to defaults"
            >
              reset
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2">
        {controls.map((ctrl) => {
          const pct = ((hyperparams[ctrl.key] - ctrl.min) / (ctrl.max - ctrl.min)) * 100;
          return (
            <div
              key={ctrl.key}
              className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-aurora-purple/20 transition-all group relative"
              onMouseEnter={() => setActiveInfo(ctrl.description)}
              onMouseLeave={() => setActiveInfo(null)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">{ctrl.label}</span>
                <motion.span
                  key={hyperparams[ctrl.key]}
                  initial={{ scale: 1.4, color: '#58C4DD' }}
                  animate={{ scale: 1, color: '#58C4DD' }}
                  transition={{ duration: 0.25 }}
                  className="text-[10px] font-mono font-bold text-aurora-purple"
                >
                  {hyperparams[ctrl.key]}
                </motion.span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={ctrl.step}
                  value={hyperparams[ctrl.key]}
                  onChange={(e) => updateHyperparams({ [ctrl.key]: parseInt(e.target.value) })}
                  className="hyperparam-slider w-full h-1 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #58C4DD ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
                  }}
                />
              </div>

              {/* Min / Max tick labels */}
              <div className="flex justify-between">
                <span className="text-[8px] font-mono text-white/20">{ctrl.min}</span>
                <span className="text-[8px] font-mono text-white/20">{ctrl.max}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-10 flex items-center justify-center px-2">
        <AnimatePresence mode="wait">
          {activeInfo && (
            <motion.p
              key={activeInfo}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.18 }}
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
