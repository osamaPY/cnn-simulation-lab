import React from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { useLabStore } from '../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerControls } from '../components/PlayerControls';
import { HyperparamControls } from '../components/HyperparamControls';

// Pre-generated particle data — stable, created once at module load (not inside render)
const PARTICLE_DATA = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 37.3 + 11.7) % 100,
  y: (i * 53.1 + 7.3) % 100,
  size: 1 + (i % 3) * 0.7,
  dur: 3 + (i % 7),
  delay: (i * 0.4) % 4,
  color: ['#50c9e6', '#8be9c1', '#a78bfa', '#f2c14e'][i % 4],
}));

function ParticleField() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {PARTICLE_DATA.map(p => (
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

      <div
        className="flex flex-col items-center gap-8 p-10 bg-black/50 backdrop-blur-2xl rounded-3xl border border-white/8 shadow-2xl pointer-events-auto relative z-10"
        style={{ boxShadow: '0 0 80px rgba(80,201,230,0.08), 0 40px 120px rgba(0,0,0,0.8)' }}
      >
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
            then press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/8 border border-white/8 text-white/50 text-[9px]">
              Run Simulation
            </kbd>{' '}
            to begin
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
            { icon: '⌀', label: 'Activation',  color: '#f97316' },
            { icon: '★', label: 'Prediction',  color: '#34d399' },
          ].map(item => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/3 border border-white/5"
            >
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
  const currentStageId   = useLabStore(state => state.currentStageId);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#050508] text-text-primary overflow-hidden font-sans">
      <Header />

      <main
        className="flex-1 relative flex flex-col overflow-hidden m-3 md:m-5 rounded-2xl border border-white/5 bg-[#0a0a0e]"
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
              <div className="flex-1 min-h-0 relative flex flex-col md:grid md:grid-cols-[1fr_300px] overflow-hidden">
                <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden px-4 py-8">
                  <StageViewer />
                </div>
                
                <div className="hidden md:flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm p-6 overflow-y-auto gap-8">
                  {preprocessedData && (
                    <>
                      <div className="w-full pointer-events-auto">
                        <ExplanationPanel mode="formula" />
                      </div>
                      <div className="w-full pt-4 border-t border-white/5">
                        <HyperparamControls />
                      </div>
                    </>
                  )}
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 pointer-events-none z-30">
                  <ExplanationPanel mode="subtitles" />
                </div>
              </div>

              <div className="flex-shrink-0 w-full pt-4 pb-6 px-8 bg-gradient-to-t from-black via-black/90 to-transparent z-40">
                <PlayerControls />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
