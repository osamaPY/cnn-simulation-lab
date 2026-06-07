import React from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerControls } from '../components/PlayerControls';
import { HyperparamControls } from '../components/HyperparamControls';

function DrawScreen() {
  return (
    <motion.div
      key="draw"
      className="flex-1 flex flex-col items-center justify-center overflow-hidden relative bg-[#161616]"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="flex flex-col items-center gap-10 p-12 bg-[#1c1c1c] rounded-lg border border-white/5 shadow-2xl pointer-events-auto relative z-10"
      >
        <div className="text-center">
          <motion.p
            className="text-[11px] font-mono uppercase tracking-[0.4em] text-[#83C167] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CNN Visual Lab
          </motion.p>
          <motion.h2
            className="text-4xl font-serif font-bold text-[#FFFEF0] mb-4 italic"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            Input Geometry
          </motion.h2>
          <motion.p
            className="text-white/40 text-sm max-w-xs font-sans leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
          >
            Every image is a grid of numbers. Draw a digit to see how mathematics perceives form.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="p-1 border border-white/10 rounded-sm bg-black/20"
        >
          <DrawCanvas />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
            0—9 · Interaction Required
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export const LessonShell: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const currentStageId   = useLabStore(state => state.currentStageId);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#161616] text-[#FFFEF0] overflow-hidden font-sans">
      <Header />

      <main
        className="flex-1 relative flex flex-col overflow-hidden"
        role="main"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!preprocessedData && currentStageId === 1 ? (
            <DrawScreen key="draw" />
          ) : (
            <motion.div
              key="sim"
              className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-[#1c1c1c]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1 min-h-0 relative flex flex-col md:grid md:grid-cols-[1fr_320px] overflow-hidden">
                <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden bg-[#161616]">
                  <div className="flex-[4] min-h-0 flex items-center justify-center overflow-hidden p-4">
                    <StageViewer />
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center justify-center p-8 bg-black/20 border-t border-white/5 z-30">
                    <ExplanationPanel mode="subtitles" />
                  </div>
                </div>
                
                <div className="hidden md:flex flex-col border-l border-white/5 bg-[#161616] p-6 overflow-y-auto gap-8 shadow-2xl">
                  {preprocessedData && (
                    <>
                      <div className="w-full pointer-events-auto">
                        <ExplanationPanel mode="formula" />
                      </div>
                      <div className="w-full pt-6 border-t border-white/5">
                        <HyperparamControls />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 w-full pt-4 pb-10 px-8 bg-[#1c1c1c] border-t border-white/5 z-40">
                <PlayerControls />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
