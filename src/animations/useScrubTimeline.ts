/**
 * useScrubTimeline — drives a 0..1 progress value that advances at a
 * configurable speed.  Used by 3b1b-style stages that want smooth
 * continuous motion rather than step-indexed jumps.
 */
import { useEffect, useRef, useState } from 'react';
import { useTimelineStore } from './useTimeline';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function useScrubTimeline(
  durationMs = 4000,
  autoPlay = true,
): { progress: number; restart: () => void } {
  const { isPlaying, speed, play, pause } = useTimelineStore();
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  const restart = () => {
    startRef.current = null;
    setProgress(0);
    play();
  };

  useEffect(() => {
    if (autoPlay) play();
    return () => pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) * (speed / 150);
      const t = Math.min(elapsed / durationMs, 1);
      setProgress(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        pause();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, durationMs, speed, reducedMotion, pause]);

  return { progress, restart };
}
