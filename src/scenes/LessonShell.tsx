import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { DimensionalityLedger } from '../components/DimensionalityLedger';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerControls } from '../components/PlayerControls';
import { HyperparamControls } from '../components/HyperparamControls';
import { CNN_STAGES } from '../types/cnn';

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
  const [showDetails, setShowDetails] = useState(false);

  const activeStage = CNN_STAGES.find(s => s.id === currentStageId) || CNN_STAGES[0];

  const STAGE_COLORS: Record<number, string> = {
    1: '#58C4DD', 2: '#58C4DD', 3: '#58C4DD', 4: '#F5CD47', 5: '#83C167',
    6: '#9C27B0', 7: '#FF6666', 8: '#E07A5F', 9: '#9C27B0',
    10: '#58C4DD', 11: '#83C167', 12: '#FF6666',
  };
  const activeColor = STAGE_COLORS[currentStageId] || '#58C4DD';

  const isFullScreenStage = currentStageId === 9 || currentStageId === 10;

  // Listen to Escape key to close details modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDetails(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="relative flex flex-col bg-[#161616] text-[#FFFEF0] font-sans"
      style={{ height: '100dvh', minWidth: '960px', overflow: 'hidden' }}
    >
      <div className={isFullScreenStage ? 'absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none' : ''}>
        <div className={isFullScreenStage ? 'pointer-events-auto opacity-40 hover:opacity-100 transition-opacity' : ''}>
          <Header />
        </div>
      </div>

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
                    className={`flex items-center justify-center stage-viewer-wrapper ${isFullScreenStage ? 'p-0' : 'p-1'}`}
                    style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
                  >
                    <StageViewer />
                  </div>

                  {/* Compact Stage Summary Bottom Bar */}
                  <div
                    className={`${isFullScreenStage ? 'absolute bottom-20 left-4 z-40 bg-black/60 backdrop-blur-sm rounded-full px-4 border border-white/10' : 'flex-shrink-0 flex items-center justify-between bg-black/45 border-t border-white/5'} subtitle-explanation-wrapper`}
                    style={{ minHeight: '34px', zIndex: 30 }}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColor, boxShadow: `0 0 8px ${activeColor}bb` }} />
                      <span>Stage {currentStageId.toString().padStart(2, '0')}:</span>
                      <span className="text-white/80 font-bold uppercase tracking-wide">{activeStage?.name}</span>
                    </div>

                    {!isFullScreenStage && (
                      <button
                        onClick={() => setShowDetails(true)}
                        className="px-2.5 py-0.5 rounded text-[8.5px] font-mono uppercase tracking-widest border border-aurora-teal/30 hover:border-aurora-teal hover:bg-aurora-teal/10 transition-all cursor-pointer text-aurora-teal font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(88,196,221,0.05)] bg-[#161616]"
                        type="button"
                      >
                        <span>Explanations & Formulas</span>
                        <span className="text-[7.5px] text-white/40">↵</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right sidebar: glossary + hyperparams */}
                <div
                  className={`flex-col border-l border-white/5 bg-[#161616] ${isFullScreenStage ? 'hidden' : 'hidden md:flex'} right-sidebar-wrapper`}
                  style={{ width: '180px', minWidth: '180px', maxWidth: '180px', overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px', gap: '8px' }}
                >
                  {preprocessedData && (
                    <>
                      <div className="w-full pointer-events-auto flex-shrink-0">
                        <ExplanationPanel mode="glossary" />
                      </div>
                      <div className="w-full border-t border-white/5 flex-shrink-0" style={{ paddingTop: '10px' }}>
                        <HyperparamControls />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Player controls — always at bottom, never overflows */}
              <div
                className={`${isFullScreenStage ? 'absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 w-auto min-w-[400px]' : 'flex-shrink-0 w-full bg-[#1c1c1c] border-t border-white/5'} player-controls-wrapper`}
                style={{ padding: isFullScreenStage ? '8px 24px' : '4px 16px 6px', zIndex: 40 }}
              >
                <PlayerControls />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cinematic Full-Screen Explanations Drawer Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 pointer-events-auto"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ y: 35, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 35, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-[#121212]/95 border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: activeColor, boxShadow: `0 0 10px ${activeColor}88` }} />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono uppercase text-white/40 tracking-[0.2em] font-bold">Deep Dive Analysis</span>
                    <h3 className="text-lg font-serif font-bold italic text-white/95 leading-none mt-0.5">{activeStage?.name}</h3>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-[9px] font-mono uppercase text-white/40 hover:text-white/80 border border-white/10 rounded px-2.5 py-1.5 hover:bg-white/5 transition-all cursor-pointer bg-black/25"
                  type="button"
                >
                  Close (ESC)
                </button>
              </div>

              {/* Explanations 3-Column Content */}
              <div className="w-full">
                <ExplanationPanel mode="subtitles" />
              </div>

              {/* Network shape & math dimension calculator ledger */}
              <div className="w-full border-t border-white/5 pt-4">
                <DimensionalityLedger />
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[8.5px] font-mono text-white/25 uppercase tracking-widest leading-none">
                <span>CNN Visual Lab study companion</span>
                <span>Click outside or press Escape to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
