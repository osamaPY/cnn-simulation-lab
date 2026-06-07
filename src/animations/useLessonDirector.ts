import { create } from 'zustand';

export type LessonPace = 8000 | 12000 | 18000;

interface LessonDirectorState {
  isPlaying: boolean;
  focusMode: boolean;
  pace: LessonPace;
  play: () => void;
  pause: () => void;
  toggleFocusMode: () => void;
  setPace: (pace: LessonPace) => void;
}

export const useLessonDirector = create<LessonDirectorState>((set) => ({
  isPlaying: false,
  focusMode: false,
  pace: 12000,
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  setPace: (pace) => set({ pace }),
}));
