import React, { Suspense } from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerControls } from '../components/PlayerControls';

function ParticleField() {
  const particles = React.useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 3 + Math.random() * 6,
      delay: Math.random() * 4,
      color: ['#50c9e6', '#8be9c1', '#a78bfa', '#f2c14e'][Math.floor(Math.random() * 4)],
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
            y: [-10, -30, -50],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function DrawScreen() {
  return (
    <motion.div
      key="draw"
      className="flex-1 flex flex-col items-center justify-center overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <ParticleField />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(80,201,230,0.06) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col items-center gap-8 p-10 bg-black/50 backdrop-blur-2xl rounded-3xl border border-white/8 shadow-2xl pointer-events-auto relative z-10"
           style={{ boxShadow: '0 0 80px rgba(80,201,230,0.08), 0 40px 120px rgba(0,0,0,0.8)' }}>
        <div className="text-center">
          <motion.p
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-aurora-mint/70 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CNN Visual Lab · Interactive Learning
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-display font-bold text-white mb-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            Draw a Digit
          </motion.h2>
          <motion.p
            className="text-white/50 text-sm max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
          >
            Your stroke becomes the input tensor. Watch the CNN process it step by step exactly like a real network.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <DrawCanvas />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-[10px] font-mono text-white/30 tracking-wider text-center">
            Draw digits 0–9 with mouse or touch
          </p>
          <p className="text-[10px] font-mono text-white/20">
            then press <kbd className="px-1.5 py-0.5 rounded bg-white/8 border border-white/8 text-white/50 text-[9px]">Run Simulation</kbd> to begin
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-2 w-full max-w-xs"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: '◫', label: 'Convolution', color: '#22d3ee' },
            { icon: '⌀', label: 'Activation', color: '#f97316' },
            { icon: '★', label: 'Prediction', color: '#34d399' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/3 border border-white/5">
              <span className="text-sm" style={{ color: item.color }}>{item.icon}</span>
              <span className="text-[9px] font-mono text-white/40">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

export const LessonShell: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);
  const currentStageId = useLabStore(state => state.currentStageId);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#050508] text-text-primary overflow-hidden font-sans">
      <Header />

      <main
        className="flex-1 relative flex flex-col overflow-hidden m-3 md:m-5 rounded-2xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#0a0a0e]"
        role="main"
        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.9)' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!preprocessedData && currentStageId === 1 ? (
            <DrawScreen key="draw" />
          ) : (
            <motion.div
              key="sim"
              className="flex-1 flex flex-col min-h-0 overflow-hidden relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden px-4">
                <StageViewer />
                {preprocessedData && (
                  <div className="absolute top-4 right-4 pointer-events-none z-30">
                    <ExplanationPanel mode="formula" />
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 w-full flex justify-center py-2 px-6 z-20 pointer-events-none">
                <ExplanationPanel mode="subtitles" />
              </div>

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
