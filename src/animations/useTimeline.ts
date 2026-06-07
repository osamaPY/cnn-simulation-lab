import { create } from 'zustand';
import { useCallback, useEffect, useRef } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface TimelineState {
  stepIndex: number;
  isPlaying: boolean;
  speed: number;
  totalSteps: number;
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
  speed: 150,
  totalSteps: 100,

  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  stepForward: () => {
    const { stepIndex, totalSteps } = get();
    if (stepIndex < totalSteps - 1) {
      set({ stepIndex: stepIndex + 1 });
    } else {
      set({ isPlaying: false });
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
  
  setSpeed: (speed) => set({ speed: Math.max(20, speed) }),
  
  setTotalSteps: (steps) => {
    const safeSteps = Math.max(1, steps);
    const currentIdx = get().stepIndex;
    set({ 
      totalSteps: safeSteps,
      stepIndex: Math.min(currentIdx, safeSteps - 1)
    });
  }
}));

/**
 * Drives deterministic, step-based educational animations. Reduced-motion
 * users jump directly to the completed state rather than running the loop.
 */
export function useTimeline(stageTotalSteps?: number, autoPlay = false) {
  const stepIndex = useTimelineStore(state => state.stepIndex);
  const isPlaying = useTimelineStore(state => state.isPlaying);
  const speed = useTimelineStore(state => state.speed);
  const totalSteps = useTimelineStore(state => state.totalSteps);
  const storePlay = useTimelineStore(state => state.play);
  const pause = useTimelineStore(state => state.pause);
  const stepForward = useTimelineStore(state => state.stepForward);
  const stepBack = useTimelineStore(state => state.stepBack);
  const reset = useTimelineStore(state => state.reset);
  const seek = useTimelineStore(state => state.seek);
  const setSpeed = useTimelineStore(state => state.setSpeed);
  const setTotalSteps = useTimelineStore(state => state.setTotalSteps);
  const shouldReduceMotion = useReducedMotion();

  const lastTick = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const play = useCallback(() => {
    if (shouldReduceMotion) {
      seek(totalSteps - 1);
      return;
    }
    storePlay();
  }, [seek, shouldReduceMotion, storePlay, totalSteps]);

  useEffect(() => {
    if (stageTotalSteps !== undefined) {
      setTotalSteps(stageTotalSteps);
    }
  }, [stageTotalSteps, setTotalSteps]);

  useEffect(() => {
    if (!autoPlay || shouldReduceMotion) return;
    reset();
    const timer = window.setTimeout(storePlay, 260);
    return () => window.clearTimeout(timer);
  }, [autoPlay, reset, shouldReduceMotion, stageTotalSteps, storePlay]);

  useEffect(() => {
    if (shouldReduceMotion && isPlaying) {
      pause();
      seek(totalSteps - 1);
      return;
    }

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
  }, [isPlaying, pause, seek, shouldReduceMotion, speed, stepForward, totalSteps]);

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
