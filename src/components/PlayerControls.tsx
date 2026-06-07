import React, { useEffect, useState } from 'react';
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
  const clearAll = useLabStore(state => state.clearAll);

  const [kbHint, setKbHint] = useState(false);

  const isPlaying = useTimelineStore((state) => state.isPlaying);
  const play = useTimelineStore((state) => state.play);
  const pause = useTimelineStore((state) => state.pause);
  const stepIndex = useTimelineStore((state) => state.stepIndex);
  const totalSteps = useTimelineStore((state) => state.totalSteps);
  const seek = useTimelineStore((state) => state.seek);

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
  const isLastStage = currentStageId === CNN_STAGES.length;

  return (
    <div
      className="flex flex-col gap-3 w-full mx-auto pointer-events-auto select-none"
      style={{ maxWidth: '1000px', padding: '0 16px' }}
    >
      {/* Progress bar */}
      <div className="relative flex items-center w-full" style={{ height: '4px' }}>
        <div className="absolute inset-0 bg-white/5 rounded-full" />
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 group flex items-center justify-center p-2 ${
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

      {/* Controls row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          {/* PREV */}
          <button
            onClick={() => canGoBack && setCurrentStageId(currentStageId - 1)}
            disabled={!canGoBack}
            aria-label="Previous stage"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all text-[11px] font-mono tracking-widest ${
              canGoBack
                ? 'text-white/70 hover:text-white hover:bg-white/5 cursor-pointer'
                : 'text-white/15 cursor-not-allowed'
            }`}
            type="button"
          >
            ← PREV
          </button>

          {/* Keyboard hint toggle */}
          <div className="relative">
            <button
              className="px-2 py-2 rounded-md text-[9px] font-mono text-white/20 hover:text-white/40 transition-colors"
              onMouseEnter={() => setKbHint(true)}
              onMouseLeave={() => setKbHint(false)}
              onFocus={() => setKbHint(true)}
              onBlur={() => setKbHint(false)}
              type="button"
              aria-label="Keyboard shortcuts"
            >
              <kbd className="px-1 py-0.5 rounded border border-white/15 text-[9px]">?</kbd>
            </button>
            <AnimatePresence>
              {kbHint && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-[#1e1e1e] border border-white/10 shadow-xl z-50 whitespace-nowrap"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 text-white/50">←</kbd>
                      <span className="text-white/40">Previous stage</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 text-white/50">→</kbd>
                      <span className="text-white/40">Next stage</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 text-white/50">Space</kbd>
                      <span className="text-white/40">Also next stage</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <kbd className="px-1.5 py-0.5 rounded border border-white/15 text-white/50">Ctrl+Z</kbd>
                      <span className="text-white/40">Undo stroke (draw)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NEXT */}
          <button
            onClick={() => canGoNext && setCurrentStageId(currentStageId + 1)}
            disabled={!canGoNext}
            aria-label="Next stage"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all text-[11px] font-mono tracking-widest ${
              canGoNext
                ? 'text-white/80 hover:text-white hover:bg-white/5 cursor-pointer'
                : 'text-white/15 cursor-not-allowed'
            }`}
            type="button"
          >
            NEXT →
          </button>
        </div>

        {/* Center: Timeline player controls (conditional) */}
        {[4, 6, 7, 8, 9, 12].includes(currentStageId) && preprocessedData && (
          <div className="hidden sm:flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-1.5 rounded-full backdrop-blur-md">
            {/* Play/Pause Button */}
            <button
              onClick={() => isPlaying ? pause() : play()}
              className="text-white/60 hover:text-white transition-colors cursor-pointer w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/5 active:scale-95"
              type="button"
              title={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Visual Scrubber Slider */}
            <input
              type="range"
              min={0}
              max={totalSteps - 1}
              value={stepIndex}
              onChange={(e) => seek(parseInt(e.target.value))}
              className="w-20 sm:w-28 md:w-36 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white hover:accent-aurora-purple transition-all"
              style={{
                outline: 'none',
              }}
              title="Drag to scrub animation"
            />

            {/* Frame/Step Display */}
            <span className="text-[9px] font-mono text-white/30 select-none min-w-[34px] text-right tracking-tighter">
              {stepIndex + 1}/{totalSteps}
            </span>
          </div>
        )}

        {/* Right side: stage label or finish */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {isLastStage ? (
              <motion.div
                key="finish-prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex items-center gap-4"
              >
                <span className="text-[10px] font-mono text-aurora-purple/60 uppercase tracking-widest animate-pulse">
                  Course Complete!
                </span>
                <button
                  onClick={clearAll}
                  className="px-4 py-1.5 rounded-md bg-aurora-purple/20 border border-aurora-purple/40 text-aurora-purple text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-aurora-purple/40 transition-all"
                >
                  Try another number
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={currentStageId}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">
                  Stage {currentStageId.toString().padStart(2, '0')}
                </span>
                <div className="w-[1px] h-3 bg-white/10" />
                <span className="text-[10px] font-serif italic text-white/70">{activeStage?.name}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
