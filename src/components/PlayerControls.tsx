import React, { useEffect } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { useLessonDirector } from '../animations/useLessonDirector';
import { CNN_STAGES } from '../types/cnn';
import { motion } from 'framer-motion';
import { useTimelineStore } from '../animations/useTimeline';

export const PlayerControls: React.FC = () => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const setCurrentStageId = useLabStore((state) => state.setCurrentStageId);
  const preprocessedData = useLabStore((state) => state.preprocessedData);
  
  const isPlaying = useLessonDirector((state) => state.isPlaying);
  const pace = useLessonDirector((state) => state.pace);
  const play = useLessonDirector((state) => state.play);
  const pause = useLessonDirector((state) => state.pause);

  const canPlay = Boolean(preprocessedData) && currentStageId < CNN_STAGES.length;

  useEffect(() => {
    if (!isPlaying || !canPlay) return;
    const timer = window.setTimeout(() => {
      const nextStage = Math.min(CNN_STAGES.length, currentStageId + 1);
      setCurrentStageId(nextStage);
      if (nextStage === CNN_STAGES.length) pause();
    }, pace);
    return () => window.clearTimeout(timer);
  }, [canPlay, currentStageId, isPlaying, pace, pause, setCurrentStageId]);

  useEffect(() => {
    if (!isPlaying) {
      useTimelineStore.getState().pause();
      return;
    }
    const timer = window.setTimeout(() => {
      const timeline = useTimelineStore.getState();
      timeline.reset();
      timeline.setSpeed(Math.max(20, Math.floor(pace / timeline.totalSteps)));
      timeline.play();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [currentStageId, isPlaying, pace]);

  useEffect(() => {
    if (!canPlay && isPlaying) pause();
  }, [canPlay, isPlaying, pause]);

  const progressPercent = ((currentStageId - 1) / (CNN_STAGES.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-3 w-full max-w-[1200px] mx-auto pointer-events-auto">
      {/* Scrubber Bar */}
      <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer flex items-center group">
         {CNN_STAGES.map((stage) => (
            <div 
              key={stage.id}
              onClick={() => { if(preprocessedData) setCurrentStageId(stage.id) }}
              className="h-full border-r border-[#0a0a0e] last:border-0 relative z-20 flex-1 hover:bg-white/30 transition-colors"
              title={stage.shortName}
            />
         ))}
         <div 
           className="absolute top-0 left-0 h-full bg-aurora-mint pointer-events-none z-10 origin-left transition-transform duration-300 ease-out"
           style={{ width: `${progressPercent}%` }}
         />
         {isPlaying && (
            <motion.div
              className="absolute top-0 left-0 h-full bg-aurora-mint/50 pointer-events-none z-10 origin-left"
              style={{ width: `${100 / (CNN_STAGES.length - 1)}%`, left: `${((currentStageId - 1) / (CNN_STAGES.length - 1)) * 100}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              key={`${currentStageId}-${pace}`}
              transition={{ duration: pace / 1000, ease: 'linear' }}
            />
         )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button 
             className="text-white hover:text-aurora-mint transition-colors disabled:opacity-50"
             disabled={!preprocessedData || currentStageId === 1}
             onClick={() => setCurrentStageId(currentStageId - 1)}
             title="Previous Chapter"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
           </button>

           <button 
             className="text-white hover:text-aurora-mint transition-colors disabled:opacity-50"
             disabled={!canPlay}
             onClick={isPlaying ? pause : play}
             title={isPlaying ? "Pause" : "Play"}
           >
             {isPlaying ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
             ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
             )}
           </button>

           <button 
             className="text-white hover:text-aurora-mint transition-colors disabled:opacity-50"
             disabled={!preprocessedData || currentStageId === CNN_STAGES.length}
             onClick={() => setCurrentStageId(currentStageId + 1)}
             title="Next Chapter"
           >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
           </button>

           {/* Time/Chapter Info */}
           <div className="text-[13px] font-mono text-white/70 ml-2 border-l border-white/20 pl-4 flex items-center gap-4">
             <span>Chapter {currentStageId} / {CNN_STAGES.length}</span>
             <span className="text-white/20">|</span> 
             <span className="text-white font-semibold">{CNN_STAGES[currentStageId - 1].shortName}</span>
             
             <button 
               className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-sans tracking-wide"
               onClick={() => {
                  pause();
                  useLabStore.getState().clearAll();
               }}
               title="Restart from beginning"
             >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
               Restart
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
