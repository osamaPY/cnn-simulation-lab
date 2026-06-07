import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { preprocessCanvas } from '../../ml/preprocess';
import { scrollToStageViewer } from '../../utils/scrollToStage';

type Mode = 'draw' | 'erase';

export const DrawCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snapshotsRef = useRef<ImageData[]>([]);

  const hasDrawing = useLabStore(state => state.hasDrawing);
  const setHasDrawing = useLabStore(state => state.setHasDrawing);
  const setPrediction = useLabStore(state => state.setPrediction);
  const clearAll = useLabStore(state => state.clearAll);
  const setOriginalCanvasThumbnail = useLabStore(state => state.setOriginalCanvasThumbnail);
  const setPreprocessedData = useLabStore(state => state.setPreprocessedData);
  const setCurrentStageId = useLabStore(state => state.setCurrentStageId);
  const modelStatus = useLabStore(state => state.modelStatus);
  const runInference = useLabStore(state => state.runInference);

  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<Mode>('draw');
  const [strokeCount, setStrokeCount] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    snapshotsRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // Keep undo stack to 30 entries max
    if (snapshotsRef.current.length > 30) snapshotsRef.current.shift();
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = snapshotsRef.current.pop();
    setCanUndo(snapshotsRef.current.length > 0);
    if (snap) {
      ctx.putImageData(snap, 0, 0);
      setStrokeCount(c => Math.max(0, c - 1));
      // Check if canvas is blank after undo
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const hasPixels = data.some((v, i) => i % 4 === 3 && v > 10);
      if (!hasPixels) clearAll();
    }
  }, [clearAll]);

  // Keyboard shortcut: Ctrl+Z / Cmd+Z for undo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo]);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    if (!coords) return;
    saveSnapshot();
    setIsDrawing(true);
    lastPos.current = coords;
    if (!hasDrawing && mode === 'draw') setHasDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    const coords = getCoords(e);
    if (!coords) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 28;
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 16;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
    lastPos.current = coords;
  };

  const stopDrawing = () => {
    if (isDrawing) setStrokeCount(c => c + 1);
    setIsDrawing(false);
    lastPos.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    snapshotsRef.current = [];
    setCanUndo(false);
    setStrokeCount(0);
    clearAll();
  };

  const handleRun = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawing) return;
    const result = preprocessCanvas(canvas);
    const thumbnail = canvas.toDataURL();
    setOriginalCanvasThumbnail(thumbnail);
    setPreprocessedData(result.data, result.debug);
    if (modelStatus === 'success') {
      await runInference();
    } else {
      setPrediction(null);
    }
    setCurrentStageId(1);
    scrollToStageViewer();
  };

  const cursorStyle = mode === 'erase' ? 'cursor-cell' : 'cursor-crosshair';

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Canvas */}
      <div className="relative aspect-square w-full max-w-[320px] rounded-2xl border border-white/10 bg-black/40 p-1.5">
        <canvas
          aria-label="Digit drawing canvas — draw a number 0 to 9"
          ref={canvasRef}
          width={320}
          height={320}
          style={{
            backgroundColor: '#0c141a',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          className={`block h-full w-full rounded-xl touch-none select-none border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] ${cursorStyle}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Placeholder when blank */}
        {!hasDrawing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none rounded-xl">
            <span className="text-white/15 text-5xl font-serif italic leading-none">0–9</span>
            <span className="mt-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">draw a digit</span>
          </div>
        )}

        {/* Stroke counter badge */}
        {strokeCount > 0 && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm bg-black/60 border border-white/10 text-[8px] font-mono text-white/30">
            {strokeCount} stroke{strokeCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Eraser mode indicator */}
        {mode === 'erase' && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm bg-aurora-purple/20 border border-aurora-purple/40 text-[8px] font-mono text-aurora-purple">
            eraser
          </div>
        )}
      </div>

      {/* Tool row */}
      <div className="flex items-center gap-2 w-full max-w-[320px]">
        <button
          onClick={() => setMode(m => m === 'draw' ? 'erase' : 'draw')}
          type="button"
          title={mode === 'draw' ? 'Switch to Eraser' : 'Switch to Draw'}
          className={`flex-none px-2.5 py-1.5 rounded-md border text-[10px] font-mono uppercase tracking-wider transition-all ${
            mode === 'erase'
              ? 'border-aurora-purple/60 text-aurora-purple bg-aurora-purple/10'
              : 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
          }`}
        >
          {mode === 'erase' ? '✕ erase' : '◌ draw'}
        </button>

        <button
          onClick={undo}
          type="button"
          title="Undo last stroke (Ctrl+Z)"
          disabled={!canUndo}
          className="flex-none px-2.5 py-1.5 rounded-md border border-white/10 text-[10px] font-mono text-white/30 hover:border-white/20 hover:text-white/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ↩ undo
        </button>

        <div className="flex-1" />

        <button
          onClick={handleClear}
          type="button"
          className="flex-none btn-secondary text-[10px] py-1.5 px-3"
        >
          clear
        </button>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={!hasDrawing}
        type="button"
        className="w-full max-w-[320px] btn-primary text-sm py-2.5 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Run Simulation →
      </button>
    </div>
  );
};
