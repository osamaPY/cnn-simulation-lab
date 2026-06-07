import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import type { TeachingMode } from '../types/cnn';

export const Header: React.FC = () => {
  const selectedMode = useLabStore(state => state.selectedMode);
  const setSelectedMode = useLabStore(state => state.setSelectedMode);
  const currentStageId = useLabStore(state => state.currentStageId);

  const modes: { id: TeachingMode; label: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', desc: 'Conceptual explanations' },
    { id: 'math', label: 'Mathematical', desc: 'Equations and dimensions' },
    { id: 'exam', label: 'Exam Prep', desc: 'Calculations and formulas' }
  ];

  return (
    <header className="relative w-full border-b border-border-muted bg-bg-panel z-10">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 xl:flex-row xl:items-center xl:justify-between">
      {/* App Logo & Title */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-text-accent/60 bg-bg-deep">
          <span className="font-mono text-base font-bold text-text-accent">Σ</span>
        </div>
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg sm:text-xl font-bold text-text-primary">
            CNN Digit Lab <span className="whitespace-nowrap rounded border border-border-muted px-1.5 py-0.5 font-mono text-[10px] font-normal text-text-accent sm:text-xs">Tensor Aurora</span>
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">See how a CNN transforms your handwritten digit.</p>
        </div>
      </div>



      {/* Global Status Indicator */}
      <div className="flex w-fit items-center gap-3 rounded border border-border-muted bg-bg-deep px-3 py-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-text-accent" />
        <span className="font-mono text-text-secondary">Chapter <strong className="text-text-primary">{currentStageId}/13</strong></span>
      </div>
      </div>
    </header>
  );
};
