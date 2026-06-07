import React from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerControls } from '../components/PlayerControls';

export const LessonShell: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const currentStageId = useLabStore(state => state.currentStageId);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#050508] text-text-primary overflow-hidden font-sans">
      <Header />

      {/* 3B1B Cinematic Viewport */}
      <main
        className="flex-1 relative flex flex-col overflow-hidden m-4 md:m-6 rounded-2xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#0a0a0e]"
        role="main"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!preprocessedData && currentStageId === 1 ? (
            /* ── Drawing screen ── */
            <motion.div
              key="draw"
              className="flex-1 flex flex-col items-center justify-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center gap-8 p-10 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl pointer-events-auto">
                <div className="text-center">
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-aurora-mint/70 mb-2">CNN Visual Lab</p>
                  <h2 className="text-4xl font-display text-white mb-3">Draw the Input</h2>
                  <p className="text-white/55 text-base">Your stroke becomes the tensor processed by the CNN.</p>
                </div>
                <DrawCanvas />
                <p className="text-[10px] font-mono text-white/30 tracking-wider">
                  Use mouse or touch · then press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-white/60 text-[9px]">Run Simulation</kbd>
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── Simulation or stage preview active ── */
            <motion.div
              key="sim"
              className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Visualizer */}
              <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden px-4">
                <StageViewer />
                {/* Floating formula overlay */}
                {preprocessedData && (
                  <div className="absolute top-4 right-4 pointer-events-none z-30">
                    <ExplanationPanel mode="formula" />
                  </div>
                )}
              </div>

              {/* Subtitles */}
              <div className="flex-shrink-0 w-full flex justify-center py-2 px-6 z-20 pointer-events-none">
                <ExplanationPanel mode="subtitles" />
              </div>

              {/* Controls bar */}
              <div className="flex-shrink-0 w-full pt-2 pb-5 px-8 bg-gradient-to-t from-black via-black/90 to-transparent z-10 flex flex-col justify-end">
                <PlayerControls />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
