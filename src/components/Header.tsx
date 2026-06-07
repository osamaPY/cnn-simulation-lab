import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';

const STAGE_COLORS: Record<number, string> = {
  1: '#58C4DD', 2: '#58C4DD', 3: '#58C4DD', 4: '#F5CD47',
  5: '#83C167', 6: '#9C27B0', 7: '#FF6666', 8: '#E07A5F',
  9: '#9C27B0', 10: '#58C4DD', 11: '#83C167',
};

export const Header: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);
  const setCurrentStageId = useLabStore(state => state.setCurrentStageId);
  const modelStatus = useLabStore(state => state.modelStatus);
  const preprocessedData = useLabStore(state => state.preprocessedData);

  const activeColor = STAGE_COLORS[currentStageId] || '#58C4DD';
  const activeStage = CNN_STAGES.find(s => s.id === currentStageId);

  return (
    <header
      className="relative w-full border-b border-white/5 bg-[#161616] z-10"
      style={{ padding: '10px 16px', flexShrink: 0 }}
    >
      <div className="flex w-full items-center justify-between gap-4" style={{ minWidth: 0 }}>
        {/* Brand */}
        <div className="flex items-center gap-4" style={{ flexShrink: 0 }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColor }} />
          <div className="flex flex-col">
            <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/90 leading-none font-sans">CNN Visual Lab</h1>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentStageId}
                className="text-[10px] font-serif leading-none mt-1.5 italic"
                style={{ color: '#B4B4B4' }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.4 }}
              >
                {activeStage?.name}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Stage dots — flex, overflow hidden so they never push the layout */}
        <div
          className="hidden lg:flex items-center gap-1 flex-1 justify-center"
          style={{ overflow: 'hidden', minWidth: 0 }}
        >
          {CNN_STAGES.map(stage => {
            const isActive = stage.id === currentStageId;
            const isUnlocked = Boolean(preprocessedData) || stage.id === 1;
            const color = STAGE_COLORS[stage.id] || '#58C4DD';

            return (
              <button
                key={stage.id}
                onClick={() => isUnlocked && setCurrentStageId(stage.id)}
                disabled={!isUnlocked}
                title={stage.name}
                type="button"
                className="relative flex flex-col items-center gap-1.5 px-1.5 py-1 rounded transition-all group flex-shrink-0"
                style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? color : isUnlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    transform: isActive ? 'scale(1.5)' : 'scale(1)',
                    boxShadow: isActive ? `0 0 10px ${color}40` : 'none'
                  }}
                />
                <span
                  className="text-[8px] font-mono leading-none tracking-tighter"
                  style={{ color: isActive ? color : 'rgba(255,255,255,0.25)', fontWeight: isActive ? 'bold' : 'normal' }}
                >
                  {stage.id.toString().padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Model status */}
        <div className="flex items-center gap-5" style={{ flexShrink: 0 }}>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded border border-white/5 bg-white/2">
            {modelStatus === 'loading' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#58C4DD] animate-pulse" />
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Inference Engine</span>
              </>
            )}
            {modelStatus === 'success' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#83C167]" />
                <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest">Model Loaded</span>
              </>
            )}
            {modelStatus === 'error' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6666]" />
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">Engine Error</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
