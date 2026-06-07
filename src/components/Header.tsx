import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

import { CNN_STAGES } from '../types/cnn';

export const Header: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);
  const modelStatus = useLabStore(state => state.modelStatus);
  const inferenceError = useLabStore(state => state.inferenceError);

  return (
    <header className="relative w-full border-b border-white/5 bg-[#050508] z-10 py-2.5 px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
        {/* App Title Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-text-accent">Σ</span>
            <h1 className="text-xs font-semibold tracking-wider uppercase text-white/70">CNN Digit Lab</h1>
          </div>
          
          {/* Model status pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
            {modelStatus === 'loading' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-purple animate-pulse" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-tight">Model Loading...</span>
              </>
            )}
            {modelStatus === 'success' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-mint shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-tight">Model Ready</span>
              </>
            )}
            {modelStatus === 'error' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-tight" title={inferenceError || 'Error'}>Model Error</span>
              </>
            )}
          </div>
        </div>

        {/* Global Status Indicator */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-white/55">
          <span>Chapter <strong className="text-white font-bold">{currentStageId}</strong> / {CNN_STAGES.length}</span>
        </div>
      </div>
    </header>
  );
};
