import React, { useEffect } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import { useTimelineStore } from '../animations/useTimeline';

export const PlayerControls: React.FC = () => {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const setCurrentStageId = useLabStore((state) => state.setCurrentStageId);
  const preprocessedData = useLabStore((state) => state.preprocessedData);

  const canGoNext = Boolean(preprocessedData) && currentStageId < CNN_STAGES.length;
  const canGoBack = Boolean(preprocessedData) && currentStageId > 1;

  // Sync local timeline reset on chapter changes
  useEffect(() => {
    const timeline = useTimelineStore.getState();
    timeline.reset();
    // Start local animation automatically
    timeline.play();
  }, [currentStageId]);

  // Keyboard navigation support: Left Arrow -> Back, Right Arrow -> Next, Space -> Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input (though we don't have inputs here)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (canGoNext) {
          e.preventDefault();
          setCurrentStageId(currentStageId + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (canGoBack) {
          e.preventDefault();
          setCurrentStageId(currentStageId - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStageId, canGoNext, canGoBack, setCurrentStageId]);

  const progressPercent = ((currentStageId - 1) / (CNN_STAGES.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1000px] mx-auto pointer-events-auto select-none">
      {/* Chapter Scrubber Segment Bar */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer flex items-center group">
         {CNN_STAGES.map((stage) => (
            <div 
              key={stage.id}
              onClick={() => { if(preprocessedData) setCurrentStageId(stage.id) }}
              className="h-full border-r border-[#0a0a0e] last:border-0 relative z-20 flex-1 hover:bg-white/25 transition-colors"
              title={`${stage.id}. ${stage.shortName}`}
            />
         ))}
         <div 
           className="absolute top-0 left-0 h-full bg-gradient-to-r from-aurora-teal via-aurora-mint to-cyan-400 pointer-events-none z-10 origin-left transition-transform duration-300 ease-out"
           style={{ width: `${progressPercent}%` }}
         />
      </div>

      {/* Control Buttons and Chapter Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous Button */}
        <button 
          className="w-full sm:w-auto px-5 py-2 rounded-xl text-sm font-medium border border-white/10 hover:border-white/20 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-white/5 flex items-center justify-center gap-2"
          disabled={!canGoBack}
          onClick={() => setCurrentStageId(currentStageId - 1)}
          title="Previous Chapter (Left Arrow)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Previous Chapter
        </button>

        {/* Chapter Title / Count Info */}
        <div className="flex items-center gap-3 font-display text-sm">
          <span className="text-white/40 font-mono">Chapter {currentStageId} / {CNN_STAGES.length}</span>
          <span className="text-white/20">|</span> 
          <span className="text-white font-semibold tracking-wide">{CNN_STAGES[currentStageId - 1].name}</span>
          
          <button 
            className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-[11px] font-sans border border-white/5"
            onClick={() => {
               useLabStore.getState().clearAll();
            }}
            title="Reset simulation and draw a new digit"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Restart
          </button>
        </div>

        {/* Next Button */}
        <button 
          className="w-full sm:w-auto px-6 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-aurora-teal to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[#071018] disabled:opacity-30 disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-white/40 transition-all shadow-lg hover:shadow-cyan-500/10 flex items-center justify-center gap-2"
          disabled={!canGoNext}
          onClick={() => setCurrentStageId(currentStageId + 1)}
          title="Next Chapter (Right Arrow / Space)"
        >
          Next Chapter
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    </div>
  );
};
