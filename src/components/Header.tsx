import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';

const STAGE_COLORS: Record<number, string> = {
  1: '#6366f1', 2: '#0ea5e9', 3: '#22d3ee', 4: '#3b82f6',
  5: '#f97316', 6: '#a855f7', 7: '#ec4899', 8: '#f59e0b',
  9: '#8b5cf6', 10: '#34d399', 11: '#f87171',
};

const STAGE_ICONS: Record<number, string> = {
  1: '⊞', 2: '⋮⋮', 3: '◫', 4: '⊞⊞', 5: '⌀', 6: '⬛', 7: '⋯', 8: '⬡', 9: '∫', 10: '★', 11: '∂',
};

export const Header: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);
  const setCurrentStageId = useLabStore(state => state.setCurrentStageId);
  const modelStatus = useLabStore(state => state.modelStatus);
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const inferenceError = useLabStore(state => state.inferenceError);

  const activeColor = STAGE_COLORS[currentStageId] || '#50c9e6';
  const activeStage = CNN_STAGES.find(s => s.id === currentStageId);

  return (
    <header className="relative w-full border-b border-white/5 bg-[#050508]/95 backdrop-blur-xl z-10 py-2 px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-label="CNN Visual Lab" className="flex-shrink-0">
            <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="#50c9e6" strokeWidth="1.5" fill="none"/>
            <rect x="7" y="7" width="8" height="8" rx="1.5" stroke="#8be9c1" strokeWidth="1.5" fill="none" opacity="0.7"/>
            <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.5"/>
            <circle cx="11" cy="11" r="1.5" fill="#50c9e6"/>
          </svg>
          <div className="flex flex-col">
            <h1 className="text-xs font-semibold tracking-wider uppercase text-white/80 leading-none">CNN Visual Lab</h1>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStageId}
                className="text-[9px] font-mono leading-none mt-0.5"
                style={{ color: activeColor }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3 }}
              >
                {STAGE_ICONS[currentStageId]} {activeStage?.name}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center overflow-x-auto">
          {CNN_STAGES.map(stage => {
            const isActive = stage.id === currentStageId;
            const isUnlocked = Boolean(preprocessedData) || stage.id === 1;
            const color = STAGE_COLORS[stage.id] || '#50c9e6';

            return (
              <button
                key={stage.id}
                onClick={() => isUnlocked && setCurrentStageId(stage.id)}
                disabled={!isUnlocked}
                title={stage.name}
                type="button"
                className="relative flex flex-col items-center gap-0.5 px-1.5 py-1 rounded transition-all group"
                style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
              >
                <motion.div
                  className="w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-mono font-bold"
                  style={{
                    backgroundColor: isActive ? `${color}30` : 'transparent',
                    color: isActive ? color : 'rgba(255,255,255,0.3)',
                    borderWidth: 1,
                    borderColor: isActive ? `${color}80` : 'rgba(255,255,255,0.08)',
                  }}
                  animate={isActive ? { scale: [1, 1.12, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {stage.id}
                </motion.div>
                <span
                  className="text-[7px] font-mono leading-none max-w-[42px] text-center truncate"
                  style={{ color: isActive ? color : 'rgba(255,255,255,0.25)' }}
                >
                  {stage.shortName}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: color }}
                    layoutId="nav-indicator"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/4 border border-white/5">
            {modelStatus === 'loading' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-purple animate-pulse" />
                <span className="text-[9px] font-mono text-white/40">Loading</span>
              </>
            )}
            {modelStatus === 'success' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-mint shadow-[0_0_5px_rgba(139,233,193,0.5)]" />
                <span className="text-[9px] font-mono text-white/60">Model Ready</span>
              </>
            )}
            {modelStatus === 'error' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[9px] font-mono text-red-400" title={inferenceError || 'Error'}>Error</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
            <span className="text-white/20">#</span>
            <AnimatePresence mode="wait">
              <motion.strong
                key={currentStageId}
                className="text-white font-bold tabular-nums"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.25 }}
              >
                {currentStageId}
              </motion.strong>
            </AnimatePresence>
            <span className="text-white/20">/ {CNN_STAGES.length}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
