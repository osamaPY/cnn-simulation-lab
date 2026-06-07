import React, { useRef, useState, useEffect } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { preprocessCanvas } from '../../ml/preprocess';
import { scrollToStageViewer } from '../../utils/scrollToStage';

export const DrawCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Pointer coordinates must be scaled when CSS and canvas dimensions differ.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPos.current = coords;
    
    if (!hasDrawing) {
      setHasDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;

    const coords = getCoords(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        
        lastPos.current = coords;
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
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

    setCurrentStageId(2);
    scrollToStageViewer();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative aspect-square w-full max-w-[280px] rounded-lg border border-border-muted bg-bg-canvas p-1">
        <canvas
          aria-label="Digit drawing canvas"
          ref={canvasRef}
          width={280}
          height={280}
          className="block h-full w-full rounded-md cursor-crosshair touch-none select-none bg-black border border-border-subtle"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-text-secondary text-sm bg-black/50 rounded-md">
            Draw a digit from 0 to 9
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[288px]">
        <button
          onClick={handleClear}
          type="button"
          className="flex-1 btn-secondary text-sm py-2 px-4 border border-border-muted"
        >
          Clear
        </button>
        <button
          onClick={handleRun}
          disabled={!hasDrawing}
          type="button"
          className="flex-1 btn-primary text-sm py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
};
