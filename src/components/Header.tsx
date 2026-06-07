import React from 'react';
import { useLabStore } from '../hooks/useLabStore';

import { CNN_STAGES } from '../types/cnn';

export const Header: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);

  return (
    <header className="relative w-full border-b border-white/5 bg-[#050508] z-10 py-2.5 px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
        {/* App Title Badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-text-accent">Σ</span>
          <h1 className="text-xs font-semibold tracking-wider uppercase text-white/70">CNN Digit Lab</h1>
        </div>

        {/* Global Status Indicator */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-white/55">
          <span>Chapter <strong className="text-white font-bold">{currentStageId}</strong> / {CNN_STAGES.length}</span>
        </div>
      </div>
    </header>
  );
};
