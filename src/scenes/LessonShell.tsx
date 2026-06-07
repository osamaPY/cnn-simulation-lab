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
        className="flex flex-col items-center gap-8 p-10 bg-[#1c1c1c] rounded-lg border border-white/5 shadow-2xl pointer-events-auto relative z-10"
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
    <div
      className="relative flex flex-col bg-[#161616] text-[#FFFEF0] font-sans"
      style={{ height: '100dvh', minWidth: '960px', overflow: 'hidden' }}
    >
      <Header />

      <main
        className="flex-1 relative flex flex-col"
        style={{ minHeight: 0, overflow: 'hidden' }}
        role="main"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!preprocessedData && currentStageId === 1 ? (
            <DrawScreen key="draw" />
          ) : (
            <motion.div
              key="sim"
              className="flex flex-col bg-[#1c1c1c]"
              style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main content area: canvas left, sidebar right */}
              <div
                className="flex"
                style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
              >
                {/* Left column: stage viewer + subtitle explanation */}
                <div
                  className="flex flex-col bg-[#161616]"
                  style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden' }}
                >
                  {/* Stage viewer — takes available space */}
                  <div
                    className="flex items-center justify-center"
                    style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '12px' }}
                  >
                    <StageViewer />
                  </div>

                  {/* Subtitle / explanation text — fixed height, no overflow */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center bg-black/20 border-t border-white/5"
                    style={{ minHeight: '72px', maxHeight: '110px', padding: '10px 24px', zIndex: 30 }}
                  >
                    <ExplanationPanel mode="subtitles" />
                  </div>
                </div>

                {/* Right sidebar: formula + hyperparams */}
                <div
                  className="flex-col border-l border-white/5 bg-[#161616] hidden md:flex"
                  style={{ width: '280px', minWidth: '280px', maxWidth: '280px', overflowY: 'auto', overflowX: 'hidden', padding: '20px', gap: '24px' }}
                >
                  {preprocessedData && (
                    <>
                      <div className="w-full pointer-events-auto flex-shrink-0">
                        <ExplanationPanel mode="formula" />
                      </div>
                      <div className="w-full border-t border-white/5 flex-shrink-0" style={{ paddingTop: '20px' }}>
                        <HyperparamControls />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Player controls — always at bottom, never overflows */}
              <div
                className="flex-shrink-0 w-full bg-[#1c1c1c] border-t border-white/5"
                style={{ padding: '12px 32px 16px', zIndex: 40 }}
              >
                <PlayerControls />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
