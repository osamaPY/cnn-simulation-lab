import React from 'react';
import { useTimeline } from '../animations/useTimeline';

interface TimelineStepperProps {
  stageTotalSteps?: number;
}

export const TimelineStepper: React.FC<TimelineStepperProps> = ({ stageTotalSteps }) => {
  const {
    stepIndex,
    isPlaying,
    speed,
    totalSteps,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    seek,
    setSpeed
  } = useTimeline(stageTotalSteps);

  const speedOptions = [
    { label: '0.5x', val: 400 },
    { label: '1.0x', val: 150 },
    { label: '2.0x', val: 50 }
  ];

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded border border-border-muted bg-bg-deep/80 p-3.5 z-10 lg:flex-row">
      {/* 1. Main Play/Pause/Navigation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          title="Reset"
          className="p-2 rounded bg-white/5 border border-border-subtle hover:bg-white/10 hover:border-border-muted text-text-secondary hover:text-text-primary transition-all cursor-pointer text-xs"
        >
          Reset
        </button>
        <button
          onClick={stepBack}
          disabled={stepIndex === 0}
          title="Step Back"
          className="p-2 rounded bg-white/5 border border-border-subtle hover:bg-white/10 hover:border-border-muted text-text-secondary hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
        >
          Back
        </button>
        <button
          onClick={isPlaying ? pause : play}
          title={isPlaying ? 'Pause' : 'Play'}
          className={`px-4 py-2 rounded font-display font-medium text-xs transition-all cursor-pointer border flex items-center justify-center min-w-[70px] ${
            isPlaying
              ? 'bg-aurora-purple/15 border-aurora-purple/50 text-aurora-purple'
              : 'bg-text-accent border-text-accent text-bg-deep hover:bg-yellow-300'
          }`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={stepForward}
          disabled={stepIndex >= totalSteps - 1}
          title="Step Forward"
          className="p-2 rounded bg-white/5 border border-border-subtle hover:bg-white/10 hover:border-border-muted text-text-secondary hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
        >
          Next
        </button>
      </div>

      {/* 2. Scrubber Slider */}
      <div className="flex-1 flex items-center gap-3 w-full">
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={stepIndex}
          onChange={(e) => seek(parseInt(e.target.value))}
          className="w-full h-1.5 bg-bg-deep rounded-lg appearance-none cursor-pointer border border-border-subtle accent-aurora-mint"
        />
        <span className="text-[10px] font-mono text-text-muted min-w-[55px] text-right">
          {stepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* 3. Speed selector */}
      <div className="flex items-center gap-1 bg-bg-deep border border-border-subtle p-0.5 rounded-lg">
        {speedOptions.map((opt) => (
          <button
            key={opt.val}
            onClick={() => setSpeed(opt.val)}
            className={`px-2 py-1 rounded text-[9px] font-mono transition-all cursor-pointer ${
              speed === opt.val
                ? 'bg-white/10 text-aurora-mint border border-white/5'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
