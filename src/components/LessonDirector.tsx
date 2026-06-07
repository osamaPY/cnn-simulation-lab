import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLessonDirector, type LessonPace } from '../animations/useLessonDirector';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import { scrollToStageViewer } from '../utils/scrollToStage';
import { useTimelineStore } from '../animations/useTimeline';

const paceOptions: { label: string; value: LessonPace }[] = [
  { label: 'Quick', value: 8000 },
  { label: 'Study', value: 12000 },
  { label: 'Reflect', value: 18000 },
];

export function LessonDirector() {
  const currentStageId = useLabStore((state) => state.currentStageId);
  const setCurrentStageId = useLabStore((state) => state.setCurrentStageId);
  const preprocessedData = useLabStore((state) => state.preprocessedData);
  const isPlaying = useLessonDirector((state) => state.isPlaying);
  const focusMode = useLessonDirector((state) => state.focusMode);
  const pace = useLessonDirector((state) => state.pace);
  const play = useLessonDirector((state) => state.play);
  const pause = useLessonDirector((state) => state.pause);
  const toggleFocusMode = useLessonDirector((state) => state.toggleFocusMode);
  const setPace = useLessonDirector((state) => state.setPace);
  const stage = CNN_STAGES[currentStageId - 1];
  const canPlay = Boolean(preprocessedData) && currentStageId < CNN_STAGES.length;

  useEffect(() => {
    if (!isPlaying || !canPlay) return;

    const timer = window.setTimeout(() => {
      const nextStage = Math.min(CNN_STAGES.length, currentStageId + 1);
      setCurrentStageId(nextStage);
      scrollToStageViewer();
      if (nextStage === CNN_STAGES.length) pause();
    }, pace);

    return () => window.clearTimeout(timer);
  }, [canPlay, currentStageId, isPlaying, pace, pause, setCurrentStageId]);

  useEffect(() => {
    if (!isPlaying) {
      useTimelineStore.getState().pause();
      return;
    }

    const timer = window.setTimeout(() => {
      const timeline = useTimelineStore.getState();
      timeline.reset();
      timeline.setSpeed(Math.max(20, Math.floor(pace / timeline.totalSteps)));
      timeline.play();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [currentStageId, isPlaying, pace]);

  useEffect(() => {
    if (!canPlay && isPlaying) pause();
  }, [canPlay, isPlaying, pause]);

  const moveTo = (stageId: number) => {
    pause();
    setCurrentStageId(stageId);
    scrollToStageViewer();
  };

  return (
    <section className="lesson-director" aria-label="Guided lesson controls">
      <div className="lesson-director__story">
        <span className="lesson-director__chapter">Scene {currentStageId} of {CNN_STAGES.length}</span>
        <div className="min-w-0">
          <strong>{stage.shortName}</strong>
          <p>{stage.description}</p>
        </div>
      </div>

      <div className="lesson-director__controls">
        <button
          className="btn-secondary"
          disabled={currentStageId === 1}
          onClick={() => moveTo(currentStageId - 1)}
          type="button"
        >
          Previous scene
        </button>
        <button
          className="btn-primary min-w-28"
          disabled={!canPlay}
          onClick={isPlaying ? pause : play}
          type="button"
        >
          {isPlaying ? 'Pause lesson' : 'Play lesson'}
        </button>
        <button
          className="btn-secondary"
          disabled={!preprocessedData || currentStageId === CNN_STAGES.length}
          onClick={() => moveTo(currentStageId + 1)}
          type="button"
        >
          Next scene
        </button>
        <button
          aria-pressed={focusMode}
          className={`btn-secondary ${focusMode ? 'lesson-director__active' : ''}`}
          onClick={toggleFocusMode}
          type="button"
        >
          {focusMode ? 'Show workspace' : 'Focus scene'}
        </button>
      </div>

      <div className="lesson-director__pace" aria-label="Lesson pace">
        {paceOptions.map((option) => (
          <button
            aria-pressed={pace === option.value}
            className={pace === option.value ? 'lesson-director__pace-active' : ''}
            key={option.value}
            onClick={() => setPace(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="lesson-director__track" aria-hidden="true">
        <div className="lesson-director__track-complete" style={{ transform: `scaleX(${(currentStageId - 1) / (CNN_STAGES.length - 1)})` }} />
        {isPlaying && (
          <motion.div
            animate={{ scaleX: 1 }}
            className="lesson-director__track-current"
            initial={{ scaleX: 0 }}
            key={`${currentStageId}-${pace}`}
            transition={{ duration: pace / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </section>
  );
}
