import React, { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { renderFeatureMap } from '../canvas/FeatureMapRenderer';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Individual Canvas Plane in the 3D stack
const ChannelPlane = memo(function ChannelPlane({
  values,
  width,
  height,
  channelIndex,
  numChannels,
  globalMin,
  globalMax,
  zOffset,
  isFocused,
  isHovered,
  onHover,
  onLeave,
  onClick
}: {
  values: Float32Array;
  width: number;
  height: number;
  channelIndex: number;
  numChannels: number;
  globalMin: number;
  globalMax: number;
  zOffset: number;
  isFocused: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderFeatureMap({
      canvas,
      values,
      width,
      height,
      channelIndex,
      numChannels,
      globalMin,
      globalMax
    });
  }, [values, width, height, channelIndex, numChannels, globalMin, globalMax]);

  return (
    <div
      className={`absolute inset-0 transition-all duration-300 rounded-lg overflow-hidden border cursor-pointer ${
        isFocused
          ? 'border-[#f5cd47] shadow-[0_0_24px_rgba(245,205,71,0.55)] scale-105 z-40 ring-1 ring-[#f5cd47]/40'
          : isHovered
            ? 'border-aurora-teal shadow-[0_0_18px_rgba(88,196,221,0.4)] z-30 brightness-110'
            : 'border-white/10 opacity-75 hover:opacity-100 z-10'
      }`}
      style={{
        transform: `translateZ(${zOffset + (isFocused ? 24 : isHovered ? 12 : 0)}px)`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <canvas ref={canvasRef} width={140} height={140} className="w-full h-full bg-black block" />
      
      {/* Small indicator label */}
      <div className="absolute bottom-1.5 right-2 text-[8px] font-mono text-white/40 uppercase bg-black/60 px-1.5 py-0.5 rounded">
        Ch {channelIndex}
      </div>
    </div>
  );
});

// Flat Thumbnail Component for the Grid view
const FeatureMapThumbnail = memo(function FeatureMapThumbnail({
  values,
  width,
  height,
  channelIndex,
  numChannels,
  globalMin,
  globalMax,
  isFocused,
  isHovered,
  onHover,
  onLeave,
  onClick
}: {
  values: Float32Array;
  width: number;
  height: number;
  channelIndex: number;
  numChannels: number;
  globalMin: number;
  globalMax: number;
  isFocused: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    renderFeatureMap({
      canvas,
      values,
      width,
      height,
      channelIndex,
      numChannels,
      globalMin,
      globalMax
    });
  }, [values, width, height, channelIndex, numChannels, globalMin, globalMax]);

  return (
    <div 
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`relative flex min-w-0 flex-col items-center p-2 rounded-lg border transition-all duration-200 cursor-pointer group ${
        isFocused
          ? 'border-[#f5cd47] bg-[#f5cd47]/8 scale-105 ring-1 ring-[#f5cd47]/30'
          : isHovered
            ? 'border-aurora-teal bg-aurora-teal/8'
            : 'border-white/5 hover:border-white/15 bg-transparent'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={96}
        height={96}
        className="block h-auto w-full max-w-24 rounded bg-black border border-black/40 shadow-md"
      />
      <span className={`text-[10px] font-mono mt-1 ${isFocused ? 'text-[#f5cd47] font-bold' : isHovered ? 'text-aurora-teal' : 'text-white/40'}`}>
        Filter #{channelIndex}
      </span>
    </div>
  );
});

export const FeatureMapGrid: React.FC = () => {
  const activations = useLabStore(state => state.activations);
  const selectedActivationLayer = useLabStore(state => state.selectedActivationLayer);
  const setSelectedActivationLayer = useLabStore(state => state.setSelectedActivationLayer);
  const selectedChannel = useLabStore(state => state.selectedChannel);
  const setSelectedChannel = useLabStore(state => state.setSelectedChannel);
  
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>('stack');
  const [hoveredChannel, setHoveredChannel] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced hover: set immediately on enter, delay clearing on leave to prevent flicker
  const handlePlaneHover = useCallback((channelIdx: number) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredChannel(channelIdx);
  }, []);

  const handlePlaneLeave = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setHoveredChannel(null);
    }, 180);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  // Spacing & angle controls for the 3D view
  const [spacing, setSpacing] = useState(18); // 8px to 30px
  const [angleX, setAngleX] = useState(62);    // 30deg to 80deg
  const [angleZ, setAngleZ] = useState(-42);   // -180deg to 180deg
  const [autoRotate, setAutoRotate] = useState(true);

  const shouldReduceMotion = useReducedMotion();

  // Filter activations to only show Conv2D layers
  const convActivations = useMemo(() => {
    return activations.filter((r) => r.layerType === 'Conv2D' || r.layerType === 'MaxPooling2D');
  }, [activations]);

  // Handle auto-rotation along Z-axis
  useEffect(() => {
    if (!autoRotate || viewMode !== 'stack' || shouldReduceMotion) return;
    let frameId: number;
    const tick = () => {
      setAngleZ((prev) => (prev + 0.15) % 360);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [autoRotate, viewMode, shouldReduceMotion]);

  // Set default selected layer if none is selected or layer is not in filtered list
  const activeLayerName = convActivations.length > 0 
    ? (convActivations.some(r => r.layerName === selectedActivationLayer)
        ? selectedActivationLayer
        : convActivations[0].layerName)
    : null;

  useEffect(() => {
    if (activeLayerName && activeLayerName !== selectedActivationLayer) {
      setSelectedActivationLayer(activeLayerName);
    }
  }, [activeLayerName, selectedActivationLayer, setSelectedActivationLayer]);

  // If no activations, return empty state
  if (convActivations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[320px] bg-bg-card/20 w-full max-w-xl mx-auto">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          No Feature Map Data
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[220px]">
          Draw a digit and click 'Run Simulation' to load layer activations.
        </p>
      </div>
    );
  }

  const currentRecord = convActivations.find(r => r.layerName === activeLayerName) || convActivations[0];
  const shape = currentRecord.shape;
  const height = shape[1];
  const width = shape[2];
  const numChannels = shape[3];

  const targetNumFilters = numChannels;

  return (
    <div className="w-full flex flex-col gap-4 max-w-5xl px-4 py-2 feature-map-grid-wrapper select-none">
      {/* Top selector row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2">
        <div className="flex flex-wrap gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
          {convActivations.map((rec) => (
            <button
              key={rec.layerName}
              onClick={() => {
                setSelectedActivationLayer(rec.layerName);
                setSelectedChannel(0);
              }}
              className={`px-3 py-1.5 rounded-md text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer ${
                activeLayerName === rec.layerName
                  ? 'bg-[#1c1c1c] text-aurora-teal border border-white/5 shadow-md'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {rec.layerName} ({shape[1]}x{shape[2]})
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-black/20 p-0.5 rounded-lg border border-white/5">
          <button 
            onClick={() => setViewMode('stack')}
            className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all ${
              viewMode === 'stack' ? 'bg-white/10 text-aurora-teal' : 'text-white/40 hover:text-white'
            }`}
          >
            3D Stack
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white/10 text-aurora-teal' : 'text-white/40 hover:text-white'
            }`}
          >
            2D Grid
          </button>
        </div>
      </div>

      {/* Main interactive area */}
      {viewMode === 'stack' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_210px] items-center w-full">
          
          {/* Left Panel: 3D Stack Viewport */}
          <div className="flex flex-col items-center justify-center p-6 bg-black/30 border border-white/5 rounded-2xl relative overflow-hidden h-[280px] sm:h-[320px] md:h-[350px]">
            
            {/* 3D Perspective Stack Container */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48" style={{ perspective: '800px' }}>
              <div 
                className="absolute inset-0 transition-transform duration-100"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${angleX}deg) rotateZ(${angleZ}deg)` 
                }}
              >
                {Array.from({ length: targetNumFilters }).map((_, i) => {
                  const zOffset = (i - targetNumFilters / 2) * spacing;
                  const isHovered = hoveredChannel === i;
                  const isFocused = selectedChannel === i;

                  return (
                    <ChannelPlane
                      key={i}
                      values={currentRecord.values}
                      width={width}
                      height={height}
                      channelIndex={i}
                      numChannels={numChannels}
                      globalMin={currentRecord.min}
                      globalMax={currentRecord.max}
                      zOffset={zOffset}
                      isFocused={isFocused}
                      isHovered={isHovered}
                      onHover={() => handlePlaneHover(i)}
                      onLeave={handlePlaneLeave}
                      onClick={() => setSelectedChannel(i)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Float Info Overlay */}
            <div className="absolute bottom-3 left-3 p-2 rounded-lg bg-black/80 border border-white/5 font-mono text-[8px] text-white/40 z-20 pointer-events-none select-none">
              Hover a plane to preview it. Click to select a channel. Drag sliders to rotate.
            </div>
          </div>

          {/* Right Panel: Rotation and Layout Sliders */}
          <div className="flex flex-col gap-3 bg-black/20 p-4 border border-white/5 rounded-2xl h-full justify-center">
            <h5 className="text-[9px] font-mono text-white/30 uppercase tracking-widest text-center border-b border-white/5 pb-2 mb-1">
              3D View Setup
            </h5>

            {/* Spread Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-mono text-white/50 uppercase">
                <span>Spread</span>
                <span className="text-aurora-teal font-bold">{spacing}px</span>
              </div>
              <input 
                type="range" min={8} max={32} value={spacing} onChange={e => setSpacing(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
              />
            </div>

            {/* Rotation Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-mono text-white/50 uppercase">
                <span>Rotation</span>
                <span className="text-aurora-teal font-bold">{Math.round(angleZ)}°</span>
              </div>
              <input 
                type="range" min={-180} max={180} value={angleZ} onChange={e => { setAngleZ(Number(e.target.value)); setAutoRotate(false); }}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
              />
            </div>

            {/* Tilt Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[8px] font-mono text-white/50 uppercase">
                <span>Tilt</span>
                <span className="text-aurora-teal font-bold">{angleX}°</span>
              </div>
              <input 
                type="range" min={30} max={80} value={angleX} onChange={e => setAngleX(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
              />
            </div>

            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`mt-2 py-1.5 rounded-lg border text-[8px] font-mono uppercase tracking-wider font-bold transition-all ${
                autoRotate
                  ? 'border-aurora-mint/30 bg-aurora-mint/5 text-aurora-mint'
                  : 'border-white/5 bg-white/5 text-white/30 hover:text-white/60'
              }`}
            >
              {autoRotate ? '✓ Auto-Rotating' : 'Spin Stack'}
            </button>
          </div>

        </div>
      ) : (
        // Flat 2D Grid view
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {Array.from({ length: targetNumFilters }).map((_, chIdx) => (
              <FeatureMapThumbnail
                key={`${activeLayerName}-${chIdx}`}
                values={currentRecord.values}
                width={width}
                height={height}
                channelIndex={chIdx}
                numChannels={numChannels}
                globalMin={currentRecord.min}
                globalMax={currentRecord.max}
                isFocused={selectedChannel === chIdx}
                isHovered={hoveredChannel === chIdx}
                onHover={() => handlePlaneHover(chIdx)}
                onLeave={handlePlaneLeave}
                onClick={() => setSelectedChannel(chIdx)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Bottom Selected Details Panel */}
      <div className="p-3 bg-black/30 border border-white/5 rounded-xl text-center">
        <div className="text-[10px] font-mono text-[#f5cd47] font-bold uppercase tracking-wider">
          Focused Channel: Filter #{selectedChannel} (Shape: {width}x{height})
        </div>
        <p className="text-[9px] text-white/50 max-w-lg mx-auto mt-1 leading-normal">
          This feature map reveals the spatial locations where the filter weights detected matching patterns (e.g. diagonal strokes, outlines, or circles) inside your drawing.
        </p>
      </div>
    </div>
  );
};
