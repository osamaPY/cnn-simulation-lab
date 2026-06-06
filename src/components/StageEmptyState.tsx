import React from 'react';

interface StageEmptyStateProps {
  stageName: string;
  description: string;
}

export const StageEmptyState: React.FC<StageEmptyStateProps> = ({ stageName, description }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[340px] w-full bg-bg-deep/30 backdrop-blur-md relative overflow-hidden rounded-lg border border-border-subtle">
      <div className="absolute inset-0 bg-gradient-to-b from-aurora-purple/5 to-transparent pointer-events-none" />
      
      {/* Locked Symbol */}
      <div className="w-16 h-16 rounded-full border border-dashed border-aurora-purple/40 flex items-center justify-center text-text-muted mb-4 font-mono relative">
        <span className="text-xl animate-pulse">🔒</span>
        <div className="absolute inset-0 rounded-full border border-dashed border-aurora-mint/20 animate-spin" style={{ animationDuration: '20s' }} />
      </div>
      
      <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary mb-2">
        {stageName} Locked
      </h3>
      
      <p className="text-xs text-text-secondary max-w-xs leading-relaxed mb-4">
        {description}
      </p>
      
      <div className="text-[10px] font-mono text-text-muted border border-border-subtle px-3 py-1.5 rounded bg-bg-deep/50 shadow-inner">
        Step 1: Draw a digit on the left ➔ Step 2: Click "Run Simulation"
      </div>
    </div>
  );
};
