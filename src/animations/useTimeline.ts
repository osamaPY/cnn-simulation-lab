import { create } from 'zustand';
import { useEffect, useRef } from 'react';

interface TimelineState {
  stepIndex: number;
  isPlaying: boolean;
  speed: number; // Duration of one step in milliseconds
  totalSteps: number;
  
  // Actions
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  seek: (index: number) => void;
  setSpeed: (speed: number) => void;
  setTotalSteps: (steps: number) => void;
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  stepIndex: 0,
  isPlaying: false,
  speed: 150, // default 150ms per step
  totalSteps: 100, // default total steps, will be overridden by stages

  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  stepForward: () => {
    const { stepIndex, totalSteps } = get();
    if (stepIndex < totalSteps - 1) {
      set({ stepIndex: stepIndex + 1 });
    } else {
      set({ isPlaying: false }); // Stop at the end
    }
  },
  
  stepBack: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) {
      set({ stepIndex: stepIndex - 1 });
    }
  },
  
  reset: () => set({ stepIndex: 0, isPlaying: false }),
  
  seek: (index) => {
    const { totalSteps } = get();
    const safeIndex = Math.max(0, Math.min(totalSteps - 1, index));
    set({ stepIndex: safeIndex });
  },
  
  setSpeed: (speed) => set({ speed: Math.max(20, speed) }), // Cap speed to 20ms min
  
  setTotalSteps: (steps) => {
    const safeSteps = Math.max(1, steps);
    const currentIdx = get().stepIndex;
    set({ 
      totalSteps: safeSteps,
      // clamp current index in case steps shrunk
      stepIndex: Math.min(currentIdx, safeSteps - 1)
    });
  }
}));

/**
 * Hook to run the animation requestAnimationFrame loop based on isPlaying state.
 */
export function useTimeline(stageTotalSteps?: number) {
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
    setSpeed,
    setTotalSteps
  } = useTimelineStore();

  const lastTick = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  // Sync total steps when stage mounts/changes
  useEffect(() => {
    if (stageTotalSteps !== undefined) {
      setTotalSteps(stageTotalSteps);
    }
  }, [stageTotalSteps, setTotalSteps]);

  // Animation loop runner
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTick.current) {
        lastTick.current = timestamp;
      }
      
      const elapsed = timestamp - lastTick.current;

      if (elapsed >= speed) {
        stepForward();
        lastTick.current = timestamp;
      }

      if (useTimelineStore.getState().isPlaying) {
        animationFrameId.current = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      lastTick.current = 0;
      animationFrameId.current = requestAnimationFrame(loop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, speed, stepForward]);

  return {
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
  };
}
export type { TimelineState };
