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
        {/* Left: navigation */}
        <div className="flex items-center gap-3">
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
            aria-label="Previous stage"
          >
            ← PREV
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
            aria-label="Next stage"
          >
            NEXT →
          </button>
        </div>

        {/* Center: utility controls */}
        <div className="flex items-center gap-3">
          {/* Divider */}
          <div className="w-[1px] h-4 bg-white/10" />

          {/* Explanations Toggle — prominent outlined button */}
          <button
            onClick={() => setShowDetails(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md transition-all text-[10px] font-mono font-bold tracking-wider text-aurora-teal hover:text-white hover:bg-aurora-teal/25 cursor-pointer border border-aurora-teal/40 bg-aurora-teal/10 hover:shadow-[0_0_14px_rgba(45,212,191,0.25)]"
            type="button"
            title="Open explanations, formulas & shape ledger"
            aria-label="Open documentation and explanations drawer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-80">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            DOCS
          </button>

          {/* Tuning Toggle — independent pill button */}
          <button
            onClick={() => setShowTuning(!showTuning)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all text-[10px] font-mono font-bold tracking-wider border cursor-pointer ${
              showTuning
                ? 'border-aurora-teal/70 text-aurora-teal bg-aurora-teal/15 shadow-[0_0_14px_rgba(45,212,191,0.3)]'
                : 'border-white/15 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5'
            }`}
            type="button"
            title="Tune hyperparameters (kernel, stride, padding, pool, filters)"
            aria-label="Toggle hyperparameter tuning panel"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-80">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            TUNE
          </button>

          {/* Help/Hint */}
          <button
            className="w-6 h-6 flex items-center justify-center rounded-full border border-white/10 text-white/30 hover:text-white hover:border-white/30 transition-all text-[11px] bg-white/5"
            type="button"
            title="Keyboard shortcuts: ← → arrow keys or click stage dots"
            aria-label="Keyboard shortcuts help"
          >
            ?
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-white/10" />
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
