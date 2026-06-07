import React from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import type { StageInfo } from '../types/cnn';
import { scrollToStageViewer } from '../utils/scrollToStage';

export const Timeline: React.FC = () => {
  const currentStageId = useLabStore(state => state.currentStageId);
  const setCurrentStageId = useLabStore(state => state.setCurrentStageId);
  const preprocessedData = useLabStore(state => state.preprocessedData);

  return (
    <div className="w-full bg-bg-panel border-t border-border-muted px-3 py-4 sm:px-5 md:px-6 z-10">
      <div className="max-w-[1600px] mx-auto flex min-w-0 flex-col gap-2">
        {/* Timeline Title & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-text-primary">
            Network chapters
          </span>
          <div className="hidden gap-2 text-xs font-mono text-text-muted sm:flex">
            <span>Click any node to jump to stage</span>
          </div>
        </div>

        {/* Scrollable Timeline Tracker */}
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain pb-2 pt-1 no-scrollbar">
          {CNN_STAGES.map((stage: StageInfo, idx: number) => {
            const isSelf = stage.id === currentStageId;
            const isCompleted = stage.id < currentStageId;
            const isLocked = stage.id > 1 && !preprocessedData;

            // Compute border and text color styles
            let statusStyle: string;
            let dotStyle: string;
            
            if (isLocked) {
              statusStyle = "border-dashed border-border-muted/50 text-text-muted opacity-45 cursor-not-allowed bg-bg-deep";
              dotStyle = "bg-text-muted/30";
            } else if (isSelf) {
              statusStyle = "border-text-accent text-text-primary bg-text-accent/5 cursor-pointer";
              dotStyle = "bg-text-accent";
            } else if (isCompleted) {
              statusStyle = "border-aurora-purple/50 text-text-secondary hover:text-text-primary hover:border-aurora-purple bg-bg-deep cursor-pointer";
              dotStyle = "bg-aurora-purple";
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
                      scrollToStageViewer();
                    }
                  }}
                  disabled={isLocked}
                  aria-label={`L${stage.id.toString().padStart(2, '0')} ${stage.shortName}${isLocked ? ', locked until simulation runs' : ''}`}
                  className={`flex min-h-11 items-center gap-2.5 px-3 py-2 border rounded transition-all duration-200 min-w-[112px] max-w-[152px] flex-shrink-0 text-left ${statusStyle}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyle}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono leading-none text-text-muted flex items-center gap-1">
                      L{stage.id.toString().padStart(2, '0')}
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
                      isCompleted ? 'bg-aurora-purple/50' : 'bg-border-subtle'
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
