import React from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { PreprocessingPreview } from '../stages/DrawingStage/PreprocessingPreview';
import { StagePlaceholder } from '../stages/StagePlaceholder';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { Timeline } from '../components/Timeline';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const LessonShell: React.FC = () => {
  const { hasDrawing, preprocessedData, prediction, currentStageId } = useLabStore();
  const shouldReduceMotion = useReducedMotion();

  // Compute guided banner instructions based on application state
  const guideMessage = React.useMemo(() => {
    if (!hasDrawing) {
      return {
        text: "👉 Welcome to Tensor Aurora! Start by drawing a digit (0–9) on the canvas to the left.",
        colorClass: "border-aurora-purple/35 text-text-accent bg-aurora-indigo/10"
      };
    }
    if (hasDrawing && !preprocessedData) {
      return {
        text: "⚡ Drawing registered! Click 'Run Simulation' under the canvas to preprocess and trace the CNN.",
        colorClass: "border-aurora-teal/40 text-aurora-mint bg-aurora-teal/10 animate-pulse"
      };
    }
    // Simulation has run
    if (currentStageId === 1) {
      return {
        text: "🎉 Preprocessing complete! Click 'Next ➔' on the visualizer card to step through the neural network.",
        colorClass: "border-aurora-mint/40 text-aurora-mint bg-bg-card shadow-inner"
      };
    }
    if (currentStageId === 13) {
      return {
        text: `🎓 Classification Complete! The CNN predicted Digit ${prediction?.digit} with ${(prediction?.confidence ? prediction.confidence * 100 : 0).toFixed(1)}% confidence. Click 'Clear' to draw again.`,
        colorClass: "border-aurora-mint/50 text-text-primary bg-bg-card shadow-[0_0_15px_rgba(52,211,153,0.1)]"
      };
    }
    return {
      text: `🔍 Tracing Stage ${currentStageId}: Observe the feature transformations. Click 'Next ➔' to advance the story.`,
      colorClass: "border-border-muted text-text-secondary bg-bg-panel/40"
    };
  }, [hasDrawing, preprocessedData, prediction, currentStageId]);

  // Motion variants for staggered dashboard layout
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const columnVariants = (direction: 'left' | 'center' | 'right'): Variants => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.25 } }
      };
    }
    
    const xOffset = direction === 'left' ? -20 : direction === 'right' ? 20 : 0;
    const yOffset = direction === 'center' ? 20 : 0;

    return {
      hidden: { opacity: 0, x: xOffset, y: yOffset },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1] as const
        }
      }
    };
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-bg-deep text-text-primary overflow-x-hidden">
      
      {/* Premium Aurora Background Ambient Glows */}
      <div className="aurora-bg-glow glow-indigo" />
      <div className="aurora-bg-glow glow-violet" />

      {/* Main Header */}
      <Header />

      {/* Dashboard container */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-5 overflow-hidden z-10">
        
        {/* Top Guided Instruction Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={guideMessage.text}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            transition={shouldReduceMotion ? { duration: 0.15 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className={`w-full p-3.5 border rounded-xl font-display text-xs md:text-sm font-semibold flex items-center justify-center text-center shadow-lg backdrop-blur-md ${guideMessage.colorClass}`}
          >
            {guideMessage.text}
          </motion.div>
        </AnimatePresence>

        {/* 3-Zone Dashboard Panel Grid with Staggered Entrance */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left Zone: Drawing canvas (3/12 width) */}
          <motion.section 
            variants={columnVariants('left')}
            className="lg:col-span-3 flex flex-col gap-4 items-center justify-start"
          >
            <div className="aurora-card p-5 w-full flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
                  1. Draw Digit
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Provide custom input to feed the CNN network
                </p>
              </div>
              
              {/* Drawing Canvas */}
              <DrawCanvas />
            </div>

            {/* Preprocessing debug telemetry preview */}
            <PreprocessingPreview />
          </motion.section>

          {/* Center Zone: Stage Visualizer (5/12 width) */}
          <motion.section 
            variants={columnVariants('center')}
            className="lg:col-span-5 flex flex-col min-h-[420px] lg:min-h-0"
          >
            <StagePlaceholder />
          </motion.section>

          {/* Right Zone: Explanations & Softmax outputs (4/12 width) */}
          <motion.section 
            variants={columnVariants('right')}
            className="lg:col-span-4 flex flex-col"
          >
            <ExplanationPanel />
          </motion.section>
        </motion.div>
      </div>

      {/* Bottom Zone: Architecture timeline navigation stepper */}
      <motion.section
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0.2 } : { duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
        className="w-full mt-auto"
      >
        <Timeline />
      </motion.section>
    </div>
  );
};
