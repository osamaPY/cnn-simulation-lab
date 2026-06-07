import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import { useTimelineStore } from '../animations/useTimeline';

const STAGE_COLORS: Record<number, string> = {
  1: '#6366f1', 2: '#8b5cf6', 3: '#0ea5e9', 4: '#22d3ee', 5: '#3b82f6',
  6: '#f97316', 7: '#a855f7', 8: '#ec4899', 9: '#f59e0b',
  10: '#8b5cf6', 11: '#34d399', 12: '#f87171',
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
  const activeColor = STAGE_COLORS[currentStageId] || '#50c9e6';
  const activeStage = CNN_STAGES.find(s => s.id === currentStageId);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[1000px] mx-auto pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStageId}
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="text-[9px] font-mono uppercase tracking-[0.2em] font-semibold"
            style={{ color: activeColor }}
          >
            Stage {currentStageId} — {activeStage?.name}
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="relative flex items-center gap-0 w-full h-8">
        <div className="absolute inset-y-[13px] left-0 right-0 h-[2px] bg-white/6 rounded-full" />
        <motion.div
          className="absolute inset-y-[13px] left-0 h-[2px] rounded-full pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${STAGE_COLORS[1]}, ${activeColor})`,
            boxShadow: `0 0 8px ${activeColor}60`,
          }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {CNN_STAGES.map((stage) => {
          const pct = ((stage.id - 1) / (CNN_STAGES.length - 1)) * 100;
          const isCompleted = stage.id < currentStageId;
          const isActive = stage.id === currentStageId;
          const isLocked = !preprocessedData && stage.id > 1;
          const stageColor = STAGE_COLORS[stage.id] || '#50c9e6';

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
              aria-label={`Go to stage ${stage.id}: ${stage.name}`}
              disabled={isLocked}
            >
              <motion.div
                animate={{
                  width: isActive ? 14 : isCompleted ? 8 : 5,
                  height: isActive ? 14 : isCompleted ? 8 : 5,
                  backgroundColor: isActive ? stageColor : isCompleted ? `${stageColor}aa` : 'rgba(255,255,255,0.15)',
                  boxShadow: isActive ? `0 0 14px ${stageColor}bb, 0 0 6px ${stageColor}66` : 'none',
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-full"
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                <div className="bg-[#0a0a14] border border-white/15 rounded px-2 py-1 whitespace-nowrap">
                  <span className="text-[9px] font-mono text-white/80">{stage.shortName}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-1">
        <motion.button
          onClick={() => canGoBack && setCurrentStageId(currentStageId - 1)}
          disabled={!canGoBack}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${
            canGoBack
              ? 'border-white/15 text-white/70 hover:border-white/35 hover:text-white cursor-pointer'
              : 'border-white/5 text-white/20 cursor-not-allowed'
          }`}
          whileHover={canGoBack ? { scale: 1.04 } : {}}
          whileTap={canGoBack ? { scale: 0.96 } : {}}
          type="button"
          aria-label="Previous stage"
        >
          ← Prev
        </motion.button>

        <div className="flex items-center gap-1 text-[9px] font-mono text-white/25">
          <kbd className="px-1.5 py-0.5 rounded bg-white/6 border border-white/8 text-white/30 text-[9px]">←</kbd>
          <span>/</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/6 border border-white/8 text-white/30 text-[9px]">→</kbd>
        </div>

        <motion.button
          onClick={() => canGoNext && setCurrentStageId(currentStageId + 1)}
          disabled={!canGoNext}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${
            canGoNext
              ? 'text-white cursor-pointer'
              : 'border-white/5 text-white/20 cursor-not-allowed'
          }`}
          style={canGoNext ? {
            borderColor: `${activeColor}60`,
            background: `${activeColor}18`,
            boxShadow: `0 0 12px ${activeColor}25`,
          } : { borderColor: 'rgba(255,255,255,0.05)' }}
          whileHover={canGoNext ? { scale: 1.04 } : {}}
          whileTap={canGoNext ? { scale: 0.96 } : {}}
          type="button"
          aria-label="Next stage"
        >
          Next →
        </motion.button>
      </div>
    </div>
  );
};
