import React, { useRef, useState, useEffect } from 'react';
import { useLabStore } from '../../hooks/useLabStore';
import { preprocessCanvas } from '../../ml/preprocess';

export const DrawCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { 
    hasDrawing, 
    setHasDrawing, 
    setPrediction, 
    clearAll,
    setOriginalCanvasThumbnail,
    setPreprocessedData,
    setCurrentStageId,
    modelStatus,
    runInference
  } = useLabStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas with black background
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

  // Helper to get coordinates relative to canvas
  const getCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    // Scale factor in case canvas client width/height differs from drawing width/height
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      // Mouse event
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  // Drawing Actions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling for touch events
    if ('touches' in e) {
      e.preventDefault();
    }
    
    const coords = getCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    lastPos.current = coords;
    
    // Set drawing flag in store
    if (!hasDrawing) {
      setHasDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current) return;
    if ('touches' in e) {
      e.preventDefault();
    }

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
    clearAll(); // Reset store
  };

  const handleRun = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawing) return;

    // 1. Run real preprocessing
    const result = preprocessCanvas(canvas);

    // 2. Capture raw canvas state as thumbnail snapshot
    const thumbnail = canvas.toDataURL();

    // 3. Update Zustand store
    setOriginalCanvasThumbnail(thumbnail);
    setPreprocessedData(result.data, result.debug);

    // 4. Run real inference if model is loaded successfully
    if (modelStatus === 'success') {
      await runInference();
    } else {
      // Clear prediction since model is missing
      setPrediction(null);
    }

    // 5. Automatically jump to Stage 2 to show the tensor grid
    setCurrentStageId(2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas container with styled card borders and a glow on focus/drawing */}
      <div className="relative p-1 rounded-xl bg-gradient-to-br from-border-muted to-bg-card border border-border-muted shadow-lg shadow-black/40">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-lg cursor-crosshair touch-none select-none bg-black block border border-border-subtle"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-text-muted text-sm font-display uppercase tracking-wider bg-black/60 rounded-lg">
            Draw a digit (0-9) here
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="flex gap-3 w-full max-w-[288px]">
        <button
          onClick={handleClear}
          className="flex-1 btn-secondary text-sm py-2 px-4 border border-border-muted"
        >
          Clear
        </button>
        <button
          onClick={handleRun}
          disabled={!hasDrawing}
          className="flex-1 btn-primary text-sm py-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Run Simulation
        </button>
      </div>
    </div>
  );
};
