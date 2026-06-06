import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import type { TeachingMode } from '../types/cnn';

export const Header: React.FC = () => {
  const { selectedMode, setSelectedMode, currentStageId } = useLabStore();

  const modes: { id: TeachingMode; label: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', desc: 'Conceptual explanations' },
    { id: 'math', label: 'Mathematical', desc: 'Equations and dimensions' },
    { id: 'exam', label: 'Exam Prep', desc: 'Calculations and formulas' }
  ];

  return (
    <header className="relative w-full border-b border-border-muted bg-bg-panel/90 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
      {/* App Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-tr from-aurora-indigo via-aurora-purple to-aurora-mint flex items-center justify-center shadow-lg shadow-aurora-indigo/35 overflow-hidden">
          <span className="font-display font-extrabold text-sm text-text-primary tracking-tighter">Σ</span>
          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-text-primary via-text-primary to-text-accent bg-clip-text text-transparent font-display flex items-center gap-2">
            CNN Digit Lab <span className="text-xs py-0.5 px-1.5 rounded bg-aurora-indigo/40 border border-aurora-purple/30 text-text-accent font-normal font-sans">Tensor Aurora</span>
          </h1>
          <p className="text-xs text-text-secondary">Interactive Convolutional Neural Network Simulator</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-1.5 bg-bg-deep border border-border-muted p-1 rounded-lg">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-display font-medium transition-all duration-200 cursor-pointer ${
              selectedMode === mode.id
                ? 'bg-gradient-to-r from-aurora-violet to-aurora-indigo text-text-primary border border-aurora-purple/40 shadow-md shadow-aurora-violet/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
            }`}
            title={mode.desc}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Global Status Indicator */}
      <div className="flex items-center gap-3 text-xs bg-bg-card border border-border-muted rounded-full py-1 px-3">
        <span className="w-2.5 h-2.5 rounded-full bg-aurora-teal animate-pulse" />
        <span className="text-text-secondary font-mono">Stage: <strong className="text-text-primary">{currentStageId}/13</strong></span>
      </div>
    </header>
  );
};
