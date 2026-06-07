import React from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { PreprocessingPreview } from '../stages/DrawingStage/PreprocessingPreview';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { Timeline } from '../components/Timeline';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { quickTransition } from '../animations/motion';
import { LessonDirector } from '../components/LessonDirector';
import { useLessonDirector } from '../animations/useLessonDirector';
import { PipelineFilm } from '../components/PipelineFilm';

export const LessonShell: React.FC = () => {
  const hasDrawing = useLabStore(state => state.hasDrawing);
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const prediction = useLabStore(state => state.prediction);
  const currentStageId = useLabStore(state => state.currentStageId);
  const shouldReduceMotion = useReducedMotion();
  const focusMode = useLessonDirector(state => state.focusMode);

  const guideMessage = React.useMemo(() => {
    if (!hasDrawing) {
      return {
        text: "Start by drawing a digit from 0 to 9, then run the simulation.",
        colorClass: "border-text-accent/40 text-text-primary bg-text-accent/5"
      };
    }
    if (hasDrawing && !preprocessedData) {
      return {
        text: "Drawing ready. Run the simulation to preprocess it and trace the CNN.",
        colorClass: "border-aurora-purple/45 text-aurora-purple bg-aurora-purple/5"
      };
    }
    // Simulation has run
    if (currentStageId === 1) {
      return {
        text: "Preprocessing complete. Use Next or the timeline to explore the network.",
        colorClass: "border-aurora-mint/40 text-aurora-mint bg-bg-card"
      };
    }
    if (currentStageId === 13 && prediction) {
      return {
        text: `Classification complete. The CNN predicted digit ${prediction?.digit} with ${(prediction?.confidence ? prediction.confidence * 100 : 0).toFixed(1)}% confidence.`,
        colorClass: "border-text-accent/50 text-text-primary bg-text-accent/5"
      };
    }
    if (currentStageId === 13) {
      return {
        text: "Prediction unavailable. Add the exported TensorFlow.js model, then draw a digit and run the simulation again.",
        colorClass: "border-red-500/30 text-red-300 bg-red-950/10"
      };
    }
    return {
      text: `Stage ${currentStageId}: observe the transformation, then use Next to continue.`,
      colorClass: "border-border-muted text-text-secondary bg-bg-panel/40"
    };
  }, [hasDrawing, preprocessedData, prediction, currentStageId]);

  return (
    <div className="relative min-h-screen flex flex-col bg-bg-deep text-text-primary overflow-x-hidden">
      <Header />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-3 py-4 sm:px-5 md:py-6 xl:px-6 flex flex-col gap-4 md:gap-5 z-10">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={guideMessage.text}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : quickTransition}
            className={`w-full px-4 py-3 border rounded text-sm font-medium flex items-center justify-center text-center ${guideMessage.colorClass}`}
          >
            {guideMessage.text}
          </motion.div>
        </AnimatePresence>

        <LessonDirector />
        <PipelineFilm />

        <div className={`lesson-workspace ${focusMode ? 'lesson-workspace--focus' : ''}`}>
          <section className="lesson-drawing flex min-w-0 flex-col gap-4 items-center justify-start">
            <div className="aurora-card p-4 sm:p-5 w-full flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-base font-semibold text-text-primary">
                  Draw the input
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Your stroke becomes the tensor the network reads.
                </p>
              </div>
              
              {/* Drawing Canvas */}
              <DrawCanvas />
            </div>

            {/* Preprocessing transformation preview */}
            <PreprocessingPreview />
          </section>

          {/* Center Zone: Stage Visualizer (5/12 width) */}
          <section className="lesson-stage flex min-w-0 flex-col">
            <StageViewer />
          </section>

          {/* Right Zone: Explanations & Softmax outputs (4/12 width) */}
          <section className="lesson-explanation flex min-w-0 flex-col">
            <ExplanationPanel />
          </section>
        </div>
      </main>

      {/* Bottom Zone: Architecture timeline navigation stepper */}
      <section className="w-full mt-2">
        <Timeline />
      </section>
    </div>
  );
};
