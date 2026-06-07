import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import { useTimelineStore } from '../animations/useTimeline';

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

  return (
    <div className="flex flex-col gap-3 w-full max-w-[1000px] mx-auto pointer-events-auto select-none">
      {/* Stage dots + smooth fill bar */}
      <div className="relative flex items-center gap-0 w-full h-8">
        {/* Background track */}
        <div className="absolute inset-y-[13px] left-0 right-0 h-[3px] bg-white/8 rounded-full" />

        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-[13px] left-0 h-[3px] rounded-full bg-gradient-to-r from-aurora-teal via-aurora-mint to-cyan-400 pointer-events-none"
          style={{ boxShadow: '0 0 8px rgba(52,211,153,0.4)' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Stage dot markers */}
        {CNN_STAGES.map((stage) => {
          const pct = ((stage.id - 1) / (CNN_STAGES.length - 1)) * 100;
          const isCompleted = stage.id < currentStageId;
          const isActive = stage.id === currentStageId;
          const isLocked = !preprocessedData && stage.id > 1;

          return (
            <button
              key={stage.id}
              onClick={() => { if (!isLocked) setCurrentStageId(stage.id); }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 group flex items-center justify-center ${
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              style={{ left: `${pct}%` }}
              title={
                isLocked
                  ? `${stage.id}. ${stage.shortName ?? stage.name} (Requires drawing)`
                  : `${stage.id}. ${stage.shortName ?? stage.name}`
              }
              type="button"
              aria-label={`Go to stage ${stage.id}: ${stage.name}`}
              disabled={isLocked}
            >
              <motion.div
                animate={{
                  width: isActive ? 14 : isCompleted ? 9 : 6,
                  height: isActive ? 14 : isCompleted ? 9 : 6,
                  backgroundColor: isActive
                    ? '#34d399'
                    : isCompleted
                    ? '#0d9488'
                    : isLocked
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.22)',
                  boxShadow: isActive
                    ? '0 0 0 3px rgba(52,211,153,0.20), 0 0 14px 4px rgba(52,211,153,0.50)'
                    : isCompleted
                    ? '0 0 6px 1px rgba(13,148,136,0.30)'
                    : 'none',
                }}
                transition={{ type: 'spring', damping: 18, stiffness: 280 }}
                className="rounded-full"
              />
              {/* Tooltip on hover */}
              <span className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-black/95 border border-white/12 text-[9px] font-mono text-white/85 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-2xl z-50">
                {stage.id}. {stage.name} {isLocked && '🔒'}
                {isActive && <span className="ml-1 text-aurora-mint">←</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1">
        <button
          className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-white/20 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white/5 flex items-center justify-center gap-2 active:scale-[0.98]"
          disabled={!canGoBack}
          onClick={() => setCurrentStageId(currentStageId - 1)}
          title="Previous Chapter (Left Arrow)"
          type="button"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back
        </button>

        <div className="flex items-center gap-2.5 font-display text-sm">
          <span className="text-white/35 font-mono text-xs">{currentStageId} / {CNN_STAGES.length}</span>
          <span className="text-white/20">·</span>
          <motion.span
            key={currentStageId}
            className="text-white font-semibold tracking-wide text-sm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {CNN_STAGES[currentStageId - 1].name}
          </motion.span>
          <button
            className="ml-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors text-[11px] font-sans border border-white/5 active:scale-95"
            onClick={() => { useLabStore.getState().clearAll(); }}
            title="Reset simulation"
            type="button"
            aria-label="Restart simulation"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
            Restart
          </button>
        </div>

        <button
          className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-aurora-teal to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#071018] disabled:opacity-30 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]"
          disabled={!canGoNext}
          onClick={() => setCurrentStageId(currentStageId + 1)}
          title="Next Chapter (Right Arrow / Space)"
          type="button"
        >
          Next
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </button>
      </div>
    </div>
  );
};
