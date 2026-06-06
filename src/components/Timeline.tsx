import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import type { StageInfo } from '../types/cnn';

export const Timeline: React.FC = () => {
  const { currentStageId, setCurrentStageId, preprocessedData } = useLabStore();

  return (
    <div className="w-full bg-bg-panel border-t border-border-muted px-6 py-4 z-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Timeline Title & Controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-text-secondary">
            CNN Architecture Timeline
          </span>
          <div className="flex gap-2 text-xs font-mono text-text-muted">
            <span>Click any node to jump to stage</span>
          </div>
        </div>

        {/* Scrollable Timeline Tracker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-6 px-6">
          {CNN_STAGES.map((stage: StageInfo, idx: number) => {
            const isSelf = stage.id === currentStageId;
            const isCompleted = stage.id < currentStageId;
            const isLocked = stage.id > 1 && !preprocessedData;

            // Compute border and text color styles
            let statusStyle = "";
            let dotStyle = "";
            
            if (isLocked) {
              statusStyle = "border-dashed border-border-muted/50 text-text-muted opacity-45 cursor-not-allowed bg-bg-deep/5";
              dotStyle = "bg-text-muted/30";
            } else if (isSelf) {
              statusStyle = "border-aurora-mint text-text-primary bg-bg-card shadow-md shadow-aurora-mint/10 ring-1 ring-aurora-mint/30 cursor-pointer";
              dotStyle = "bg-aurora-mint shadow-md shadow-aurora-mint/50";
            } else if (isCompleted) {
              statusStyle = "border-aurora-purple/60 text-text-secondary hover:text-text-primary hover:border-aurora-purple bg-bg-deep/40 cursor-pointer";
              dotStyle = "bg-aurora-purple/70";
            } else {
              statusStyle = "border-border-muted text-text-muted hover:text-text-secondary hover:border-border-subtle bg-bg-deep/10 cursor-pointer";
              dotStyle = "bg-border-muted";
            }

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Button Card */}
                <button
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentStageId(stage.id);
                    }
                  }}
                  disabled={isLocked}
                  className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg transition-all duration-200 min-w-[120px] max-w-[160px] flex-shrink-0 text-left ${statusStyle}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyle}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono leading-none text-text-muted flex items-center gap-1">
                      L{stage.id.toString().padStart(2, '0')}
                      {isLocked && <span className="text-[9px]">🔒</span>}
                    </span>
                    <span className="text-xs font-display font-medium leading-tight truncate">
                      {stage.shortName}
                    </span>
                  </div>
                </button>

                {/* Line Separator (except for last element) */}
                {idx < CNN_STAGES.length - 1 && (
                  <div
                    className={`h-[1px] w-4 flex-shrink-0 ${
                      isCompleted ? 'bg-gradient-to-r from-aurora-purple to-border-muted' : 'bg-border-subtle'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
