import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';

const STAGE_COLORS: Record<number, string> = {
  1: '#58C4DD', 2: '#58C4DD', 3: '#58C4DD', 4: '#F5CD47', 5: '#83C167',
  6: '#9C27B0', 7: '#FF6666', 8: '#E07A5F', 9: '#9C27B0',
  10: '#58C4DD', 11: '#83C167', 12: '#FF6666',
};

export const PlayerControls: React.FC = () => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const setCurrentStageId = useLabStore((state) => state.setCurrentStageId);
  const preprocessedData = useLabStore((state) => state.preprocessedData);
  const clearAll = useLabStore(state => state.clearAll);
  const setShowDetails = useLabStore(state => state.setShowDetails);
  const showTuning = useLabStore(state => state.showTuning);
  const setShowTuning = useLabStore(state => state.setShowTuning);

  const canGoNext = Boolean(preprocessedData) && currentStageId < CNN_STAGES.length;
  const canGoBack = Boolean(preprocessedData) && currentStageId > 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (canGoNext) { e.preventDefault(); setCurrentStageId(currentStageId + 1); }
      } else if (e.key === 'ArrowLeft') {
        if (canGoBack) { e.preventDefault(); setCurrentStageId(currentStageId - 1); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStageId, canGoNext, canGoBack, setCurrentStageId]);

  const progressPercent = ((currentStageId - 1) / (CNN_STAGES.length - 1)) * 100;
  const activeColor = STAGE_COLORS[currentStageId] || '#58C4DD';
  const activeStage = CNN_STAGES.find(s => s.id === currentStageId);
  const isLastStage = currentStageId === CNN_STAGES.length;

  return (
    <div
      className="flex flex-col gap-2 w-full mx-auto pointer-events-auto select-none"
      style={{ maxWidth: '1000px', padding: '0 8px' }}
    >
      {/* Progress bar */}
      <div className="relative flex items-center w-full mb-1" style={{ height: '2px' }}>
        <div className="absolute inset-0 bg-white/10 rounded-full" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
          style={{ background: activeColor }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {CNN_STAGES.map((stage) => {
          const pct = ((stage.id - 1) / (CNN_STAGES.length - 1)) * 100;
          const isCompleted = stage.id < currentStageId;
          const isActive = stage.id === currentStageId;
          const isLocked = !preprocessedData && stage.id > 1;
          const stageColor = STAGE_COLORS[stage.id] || '#58C4DD';
          return (
            <button
              key={stage.id}
              onClick={() => { if (!isLocked) setCurrentStageId(stage.id); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 group flex items-center justify-center p-1.5 ${
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{ left: `${pct}%` }}
              title={`${stage.id}. ${stage.shortName ?? stage.name}${isLocked ? ' (Draw first)' : ''}`}
              type="button"
              disabled={isLocked}
            >
              <motion.div
                animate={{
                  width: isActive ? 6 : 3,
                  height: isActive ? 6 : 3,
                  backgroundColor: isActive ? '#fff' : isCompleted ? stageColor : 'rgba(255,255,255,0.2)',
                  rotate: isActive ? 45 : 0,
                }}
                transition={{ duration: 0.4 }}
                className={`${isActive ? 'rounded-none shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'rounded-full'}`}
              />
            </button>
          );
        })}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-6">
          {/* PREV */}
          <button
            onClick={() => canGoBack && setCurrentStageId(currentStageId - 1)}
            disabled={!canGoBack}
            className={`flex items-center gap-1 transition-all text-[10px] font-mono tracking-widest font-bold ${
              canGoBack
                ? 'text-white/60 hover:text-white cursor-pointer'
                : 'text-white/10 cursor-not-allowed'
            }`}
            type="button"
          >
            ← PREV
          </button>

          <div className="flex items-center gap-4">
            {/* Explanations Toggle */}
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded transition-all text-[8px] font-mono font-bold tracking-widest text-aurora-teal hover:text-white hover:bg-aurora-teal/20 cursor-pointer border border-aurora-teal/20 bg-aurora-teal/5"
              type="button"
              title="Explanations & Formulas"
            >
              DOCS
            </button>

            {/* Help/Hint */}
            <button
              className="w-5 h-5 flex items-center justify-center rounded-full border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all text-[10px] bg-white/5"
              type="button"
              title="Keyboard Shortcuts"
            >
              ?
            </button>

            {/* Tuning Toggle */}
            <button
              onClick={() => setShowTuning(!showTuning)}
              className={`w-5 h-5 flex items-center justify-center rounded-full border transition-all text-[8px] bg-white/5 font-mono ${
                showTuning ? 'border-aurora-teal text-aurora-teal shadow-[0_0_8px_rgba(45,212,191,0.3)]' : 'border-white/10 text-white/30 hover:text-white hover:border-white/30'
              }`}
              type="button"
              title="Tune Hyperparameters"
            >
              T
            </button>

            {/* NEXT */}
            <button
              onClick={() => canGoNext && setCurrentStageId(currentStageId + 1)}
              disabled={!canGoNext}
              className={`flex items-center gap-1 transition-all text-[10px] font-mono tracking-widest font-bold ${
                canGoNext
                  ? 'text-white/80 hover:text-white cursor-pointer'
                  : 'text-white/10 cursor-not-allowed'
              }`}
              type="button"
            >
              NEXT →
            </button>
          </div>
        </div>

        {/* Right side: stage label */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {isLastStage ? (
              <motion.button
                key="finish-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clearAll}
                className="text-[10px] font-mono text-aurora-purple uppercase tracking-widest font-bold hover:brightness-125 transition-all"
              >
                FINISH & RESTART
              </motion.button>
            ) : (
              <motion.div
                key={currentStageId}
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] font-bold">
                  STAGE {currentStageId.toString().padStart(2, '0')}
                </span>
                <div className="w-[1px] h-3 bg-white/10" />
                <span className="text-[11px] font-serif italic text-white/70 font-medium">
                  {activeStage?.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
