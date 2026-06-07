import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import { useTimelineStore } from '../animations/useTimeline';

const STAGE_COLORS: Record<number, string> = {
  1: '#58C4DD', 2: '#58C4DD', 3: '#58C4DD', 4: '#F5CD47', 5: '#83C167',
  6: '#9C27B0', 7: '#FF6666', 8: '#E07A5F', 9: '#9C27B0',
  10: '#58C4DD', 11: '#83C167', 12: '#FF6666',
};

export const PlayerControls: React.FC = () => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const setCurrentStageId = useLabStore((state) => state.setCurrentStageId);
  const preprocessedData = useLabStore((state) => state.preprocessedData);

  const canGoNext = Boolean(preprocessedData) && currentStageId < CNN_STAGES.length;
  const canGoBack = Boolean(preprocessedData) && currentStageId > 1;

  useEffect(() => {
    const timeline = useTimelineStore.getState();
    timeline.reset();
    timeline.play();
  }, [currentStageId]);

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

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1000px] mx-auto pointer-events-auto select-none px-6">
      <div className="relative flex items-center w-full h-1">
        <div className="absolute inset-0 bg-white/5 rounded-full" />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
          style={{
            background: activeColor,
          }}
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 group flex items-center justify-center ${
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{ left: `${pct}%` }}
              title={`${stage.id}. ${stage.shortName ?? stage.name}${isLocked ? ' (Draw first)' : ''}`}
              type="button"
              disabled={isLocked}
            >
              <motion.div
                animate={{
                  width: isActive ? 6 : 4,
                  height: isActive ? 6 : 4,
                  backgroundColor: isActive ? '#fff' : isCompleted ? stageColor : 'rgba(255,255,255,0.15)',
                  rotate: isActive ? 45 : 0,
                }}
                transition={{ duration: 0.4 }}
                className={`${isActive ? 'rounded-none' : 'rounded-full'}`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-6">
          <motion.button
            onClick={() => canGoBack && setCurrentStageId(currentStageId - 1)}
            disabled={!canGoBack}
            className={`text-[11px] font-mono tracking-widest transition-all ${
              canGoBack
                ? 'text-white/40 hover:text-white cursor-pointer'
                : 'text-white/5 cursor-not-allowed'
            }`}
            type="button"
          >
            ← PREV
          </motion.button>

          <div className="flex items-center gap-2 text-[10px] font-mono text-white/20">
            <kbd className="opacity-40">←</kbd>
            <span className="opacity-20">/</span>
            <kbd className="opacity-40">→</kbd>
          </div>

          <motion.button
            onClick={() => canGoNext && setCurrentStageId(currentStageId + 1)}
            disabled={!canGoNext}
            className={`text-[11px] font-mono tracking-widest transition-all ${
              canGoNext
                ? 'text-white/60 hover:text-white cursor-pointer'
                : 'text-white/5 cursor-not-allowed'
            }`}
            type="button"
          >
            NEXT →
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStageId}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">Stage {currentStageId.toString().padStart(2, '0')}</span>
            <div className="w-[1px] h-3 bg-white/10" />
            <span className="text-[10px] font-serif italic text-white/70">{activeStage?.name}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
