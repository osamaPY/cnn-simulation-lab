import React, { useEffect, useRef } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Lightweight canvas confetti — no external lib needed
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  const COLORS = ['#34d399', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#fb923c'];
  const particles = Array.from({ length: 90 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 60,
    y: H / 2 - 20,
    vx: (Math.random() - 0.5) * 8,
    vy: -(Math.random() * 7 + 3),
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.35,
    w: Math.random() * 9 + 4,
    h: Math.random() * 4 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 1,
  }));

  let frame = 0;
  const MAX_FRAMES = 90;

  function draw() {
    if (frame >= MAX_FRAMES) { ctx!.clearRect(0, 0, W, H); return; }
    ctx!.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.rot += p.rotV;
      p.alpha = Math.max(0, 1 - frame / MAX_FRAMES);
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = p.alpha;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    });
    frame++;
    requestAnimationFrame(draw);
  }
  draw();
}

export const PredictionStage: React.FC = () => {
  const prediction = useLabStore(state => state.prediction);
  const originalCanvasThumbnail = useLabStore(state => state.originalCanvasThumbnail);
  const clearAll = useLabStore(state => state.clearAll);
  const shouldReduceMotion = useReducedMotion();
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const launchedRef = useRef(false);

  useEffect(() => {
    if (prediction && confettiRef.current && !shouldReduceMotion && !launchedRef.current) {
      launchedRef.current = true;
      // Short delay so the digit card animates in first
      setTimeout(() => launchConfetti(confettiRef.current!), 550);
    }
  }, [prediction, shouldReduceMotion]);

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[360px] bg-bg-card/20">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          No Classification Result
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[200px]">
          Draw a digit on the canvas and run the simulation to see the final prediction.
        </p>
      </div>
    );
  }

  const confidencePct = (prediction.confidence * 100).toFixed(1);
  const isHighConf = prediction.confidence >= 0.90;
  const isMedConf = prediction.confidence >= 0.70 && !isHighConf;

  const spring = { type: 'spring' as const, damping: 14, stiffness: 240, mass: 0.9 };

  return (
    <div className="relative flex flex-col gap-6 w-full max-w-xl items-center py-6 px-4">
      {/* Confetti canvas — absolutely positioned, pointer-events-none */}
      <canvas
        ref={confettiRef}
        width={500}
        height={400}
        className="absolute inset-0 w-full h-full pointer-events-none z-50"
        aria-hidden="true"
      />

      {/* Input vs Prediction row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 w-full">
        {/* Draw Input Thumbnail */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-28 h-28 bg-black border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
            {originalCanvasThumbnail ? (
              <img
                src={originalCanvasThumbnail}
                alt="Original Drawing"
                className="w-full h-full object-contain filter invert opacity-90 scale-95"
              />
            ) : (
              <div className="text-[9px] text-text-muted">Awaiting Ink</div>
            )}
            <div className="absolute inset-1.5 border border-dashed border-white/5 rounded-xl pointer-events-none" />
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex items-center justify-center" aria-hidden="true">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.div>
        </div>

        {/* Prediction Card */}
        <div className="flex flex-col items-center gap-2.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={prediction.digit}
              className="w-28 h-28 rounded-2xl bg-[#030306]/90 border-2 border-amber-500/60 flex flex-col items-center justify-center relative"
              style={{ boxShadow: '0 0 40px rgba(245,158,11,0.22), 0 0 80px rgba(245,158,11,0.08)' }}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.65, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : spring}
            >
              <motion.span
                className="font-display font-extrabold text-amber-400 leading-none"
                style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', filter: 'drop-shadow(0 0 14px rgba(245,158,11,0.45))' }}
                initial={shouldReduceMotion ? false : { scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { ...spring, delay: 0.08 }}
              >
                {prediction.digit}
              </motion.span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider mt-1">
                Digit {prediction.digit}
              </span>
              <div className="absolute inset-1 rounded-xl border border-dashed border-amber-500/10 pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Confidence gauge */}
      <motion.div
        className="w-full bg-[#030306]/70 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col gap-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-secondary uppercase tracking-wider">Classification Confidence</span>
          <motion.span
            className={`font-bold text-sm ${ isHighConf ? 'text-emerald-400' : isMedConf ? 'text-amber-400' : 'text-orange-400' }`}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.4 }}
          >
            {confidencePct}%
          </motion.span>
        </div>

        <div className="w-full h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden relative">
          <motion.div
            className="h-full w-full origin-left rounded-r"
            style={{
              background: isHighConf
                ? 'linear-gradient(90deg, #0d9488, #34d399, #22d3ee)'
                : isMedConf
                ? 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)'
                : 'linear-gradient(90deg, #c2410c, #ea580c, #fb923c)',
            }}
            initial={shouldReduceMotion ? { scaleX: prediction.confidence } : { scaleX: 0 }}
            animate={{ scaleX: prediction.confidence }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.0, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Shimmer overlay */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 0.9, delay: 1.2, ease: 'easeInOut' }}
            />
          )}
        </div>

        {/* Contextual confidence label */}
        <AnimatePresence>
          {isHighConf && (
            <motion.p
              className="text-[10px] font-mono text-emerald-400/80 text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
            >
              ✓ High confidence — the network is sure!
            </motion.p>
          )}
          {isMedConf && (
            <motion.p
              className="text-[10px] font-mono text-amber-400/70 text-center"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.85, duration: 0.4 }}
            >
              ~ Medium confidence — try a cleaner drawing.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.button
        className="btn-primary mt-1 px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black border-amber-500 hover:border-amber-400 rounded-xl transition-all duration-200 font-bold tracking-wide shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        onClick={clearAll}
        type="button"
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Try another digit →
      </motion.button>
    </div>
  );
};
