import React, { memo, useState, useEffect, useRef } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { renderFeatureMap } from '../canvas/FeatureMapRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { quickTransition } from '../animations/motion';
import type { ActivationRecord } from '../ml/activationModel';

// Mini Component to render a single channel canvas
const FeatureMapThumbnail = memo(function FeatureMapThumbnail({
  values,
  width,
  height,
  channelIndex,
  numChannels,
  globalMin,
  globalMax,
  isFocused,
  onFocus
}: {
  values: Float32Array;
  width: number;
  height: number;
  channelIndex: number;
  numChannels: number;
  globalMin: number;
  globalMax: number;
  isFocused: boolean;
  onFocus: () => void;
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
      onClick={onFocus}
      className={`relative flex min-w-0 flex-col items-center p-2 rounded-lg bg-bg-deep/40 border transition-all duration-300 cursor-pointer ${
        isFocused 
          ? 'border-text-accent bg-text-accent/5'
          : 'border-border-subtle hover:border-border-muted bg-transparent'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        className="block h-auto w-full max-w-20 rounded bg-black border border-black/40 group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-aurora-purple/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
      <span className="text-[9px] font-mono mt-1 text-text-secondary group-hover:text-aurora-purple transition-colors">
        Filter #{channelIndex}
      </span>
    </div>
  );
});

const FeatureMapStack = ({ records, selectedLayer }: { records: ActivationRecord[], selectedLayer: string }) => {
  const currentRecord = records.find(r => r.layerName === selectedLayer) || records[0];
  const shape = currentRecord.shape;
  const numChannels = shape.length === 4 ? shape[3] : 0;
  
  return (
    <div className="relative h-[400px] w-full flex items-center justify-center perspective-[1000px]">
      <div className="relative preserve-3d rotate-x-[60deg] rotate-z-[-45deg] scale-75">
        {Array.from({ length: Math.min(numChannels, 8) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ translateZ: -i * 40, opacity: 0 }}
            animate={{ translateZ: i * 40, opacity: 1 - i * 0.1 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 w-64 h-64 border-2 border-aurora-purple/30 bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-[0_0_30px_rgba(80,201,230,0.1)]"
            style={{ 
              transform: `translateZ(${i * 30}px)`,
              borderColor: `rgba(80, 201, 230, ${0.5 - i * 0.05})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-aurora-purple/10 to-transparent" />
            <div className="w-full h-full p-4 flex items-center justify-center">
               <div className="w-full h-full border border-white/5 rounded-lg opacity-40 overflow-hidden">
                  <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-px">
                    {Array.from({ length: 64 }).map((_, j) => (
                      <div key={j} className="bg-aurora-purple/20 rounded-[1px]" style={{ opacity: Math.random() }} />
                    ))}
                  </div>
               </div>
            </div>
            <div className="absolute top-2 left-2 text-[10px] font-mono text-aurora-purple/60">
              LAYER_MAP_{i}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const FeatureMapGrid: React.FC = () => {
  const activations = useLabStore(state => state.activations);
  const selectedActivationLayer = useLabStore(state => state.selectedActivationLayer);
  const setSelectedActivationLayer = useLabStore(state => state.setSelectedActivationLayer);
  const selectedChannel = useLabStore(state => state.selectedChannel);
  const setSelectedChannel = useLabStore(state => state.setSelectedChannel);
  const [viewMode, setViewMode] = useState<'grid' | 'stack'>('stack');

  const [page, setPage] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // If no activations, return empty prompt
  if (activations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[320px] bg-bg-card/20">
        <h4 className="text-sm font-display font-semibold uppercase tracking-wider text-text-secondary">
          No Feature Map Data
        </h4>
        <p className="text-xs text-text-muted mt-2 max-w-[220px]">
          Draw a digit and click 'Run Simulation' to load layer activations.
        </p>
      </div>
    );
  }

  // Get active record
  const currentRecord = activations.find(r => r.layerName === selectedActivationLayer) || activations[0];
  
  // Extract dimensions
  // Tensor shape: [batch, height, width, channels] for 4D, or [batch, features] for 2D
  const shape = currentRecord.shape;
  const is2D = shape.length === 2;
  const height = is2D ? 1 : shape[1];
  const width = is2D ? 1 : shape[2];
  const numChannels = is2D ? shape[1] : shape[3];

  // Grid pagination settings (show 8 maps at a time)
  const channelsPerPage = 8;
  const totalPages = Math.ceil(numChannels / channelsPerPage);
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const startIdx = safePage * channelsPerPage;
  const endIdx = Math.min(startIdx + channelsPerPage, numChannels);

  // Make list of channels currently on screen
  const visibleChannelIndices = Array.from(
    { length: endIdx - startIdx }, 
    (_, i) => startIdx + i
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Selector Tabs for Layers */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border-subtle pb-3">
        <div className="flex flex-wrap gap-1.5">
          {activations.map((rec) => (
            <button
              key={rec.layerName}
              onClick={() => {
                setPage(0);
                setSelectedActivationLayer(rec.layerName);
              }}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-mono transition-all duration-200 cursor-pointer ${
                selectedActivationLayer === rec.layerName
                  ? 'bg-aurora-purple/20 text-text-accent border border-aurora-purple/40 shadow-inner'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent'
              }`}
            >
              {rec.layerName}
            </button>
          ))}
        </div>

        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
           <button 
             onClick={() => setViewMode('stack')}
             className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${viewMode === 'stack' ? 'bg-aurora-purple text-black font-bold' : 'text-white/40 hover:text-white'}`}
           >
             3D Stack
           </button>
           <button 
             onClick={() => setViewMode('grid')}
             className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${viewMode === 'grid' ? 'bg-aurora-purple text-black font-bold' : 'text-white/40 hover:text-white'}`}
           >
             Grid
           </button>
        </div>
      </div>

      {/* Layer metadata bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono py-0.5 px-1.5 rounded bg-bg-deep border border-border-muted text-[10px]">
            Type: {currentRecord.layerType}
          </span>
          <span className="font-mono py-0.5 px-1.5 rounded bg-bg-deep border border-border-muted text-[10px]">
            Shape: [{shape.join(', ')}]
          </span>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          Range: [{currentRecord.min.toFixed(2)}, {currentRecord.max.toFixed(2)}]
        </span>
      </div>

      {is2D ? (
        // For 1D / Flattened Layers, show a vector list instead of grid
        <div className="p-4 bg-bg-deep/40 border border-border-subtle rounded-lg flex flex-col gap-3">
          <span className="text-[10px] font-mono text-text-secondary uppercase">
            1D Feature Vector representation (showing active segments)
          </span>
          <div className="flex flex-wrap gap-1 max-h-[160px] overflow-y-auto p-1 border border-border-subtle/50 rounded bg-black/50 scrollbar-thin">
            {Array.from(currentRecord.values).slice(0, 100).map((val, idx) => {
              const maxVal = currentRecord.max || 1;
              const intensity = (val - currentRecord.min) / (maxVal - currentRecord.min);
              return (
                <div
                  key={idx}
                  className="w-5 h-5 flex items-center justify-center rounded-[2px] text-[7px] font-mono select-none"
                  style={{
                    backgroundColor: `rgba(52, 211, 153, ${Math.max(0.05, intensity)})`,
                    color: intensity > 0.4 ? '#071018' : '#b4c5c9',
                    border: '1px solid rgba(255,255,255,0.02)'
                  }}
                  title={`Index: ${idx} | Val: ${val.toFixed(3)}`}
                >
                  {val.toFixed(0)}
                </div>
              );
            })}
            {currentRecord.values.length > 100 && (
              <div className="h-5 px-1.5 flex items-center justify-center text-[8px] font-mono text-text-muted border border-border-subtle rounded bg-bg-deep/60">
                + {currentRecord.values.length - 100} elements truncated
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'stack' ? (
        <FeatureMapStack records={activations} selectedLayer={selectedActivationLayer!} />
      ) : (
        // For Conv2D / MaxPool channels grid
        <div className="flex flex-col gap-3">
          {/* Channels Grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <AnimatePresence mode="popLayout">
              {visibleChannelIndices.map((chIdx) => (
                <motion.div
                  key={`${selectedActivationLayer}-${chIdx}`}
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : quickTransition}
                >
                  <FeatureMapThumbnail
                    values={currentRecord.values}
                    width={width}
                    height={height}
                    channelIndex={chIdx}
                    numChannels={numChannels}
                    globalMin={currentRecord.min}
                    globalMax={currentRecord.max}
                    isFocused={selectedChannel === chIdx}
                    onFocus={() => setSelectedChannel(chIdx)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-subtle pt-3 mt-1">
              <span className="text-[10px] font-mono text-text-muted">
                Showing Filters {startIdx}-{endIdx - 1} of {numChannels}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={safePage === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="btn-secondary text-[10px] py-1 px-2.5 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={safePage === totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-secondary text-[10px] py-1 px-2.5 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
