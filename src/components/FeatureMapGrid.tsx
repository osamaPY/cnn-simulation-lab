import React, { useState, useEffect, useRef } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { renderFeatureMap } from '../canvas/FeatureMapRenderer';
import { motion, AnimatePresence } from 'framer-motion';

// Mini Component to render a single channel canvas
const FeatureMapThumbnail: React.FC<{
  values: Float32Array;
  width: number;
  height: number;
  channelIndex: number;
  numChannels: number;
  globalMin: number;
  globalMax: number;
  isFocused: boolean;
  onFocus: () => void;
}> = ({ values, width, height, channelIndex, numChannels, globalMin, globalMax, isFocused, onFocus }) => {
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
      className={`relative flex flex-col items-center p-2 rounded-lg bg-bg-deep/40 border transition-all duration-300 cursor-pointer ${
        isFocused 
          ? 'border-aurora-mint shadow-[0_0_12px_rgba(52,211,153,0.15)] bg-bg-card' 
          : 'border-border-subtle hover:border-border-muted bg-transparent'
      }`}
    >
      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        className="rounded bg-black block border border-black/40"
      />
      <span className="text-[9px] font-mono mt-1 text-text-secondary">
        Filter #{channelIndex}
      </span>
    </div>
  );
};

export const FeatureMapGrid: React.FC = () => {
  const { 
    activations, 
    selectedActivationLayer, 
    setSelectedActivationLayer,
    selectedChannel,
    setSelectedChannel
  } = useLabStore();

  const [page, setPage] = useState(0);

  // If no activations, return empty prompt
  if (activations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted border border-dashed border-border-muted rounded-xl min-h-[320px] bg-bg-card/20">
        <span className="text-3xl mb-3">🧊</span>
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
  const startIdx = page * channelsPerPage;
  const endIdx = Math.min(startIdx + channelsPerPage, numChannels);
  
  // Reset page when layer changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setPage(0);
  }, [selectedActivationLayer]);

  // Make list of channels currently on screen
  const visibleChannelIndices = Array.from(
    { length: endIdx - startIdx }, 
    (_, i) => startIdx + i
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Selector Tabs for Layers */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border-subtle pb-3">
        {activations.map((rec) => (
          <button
            key={rec.layerName}
            onClick={() => setSelectedActivationLayer(rec.layerName)}
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

      {/* Layer metadata bar */}
      <div className="flex items-center justify-between text-xs text-text-secondary px-1">
        <div className="flex items-center gap-2">
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
                    color: intensity > 0.4 ? '#03000a' : '#9e99a8',
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
      ) : (
        // For Conv2D / MaxPool channels grid
        <div className="flex flex-col gap-3">
          {/* Channels Grid */}
          <div className="grid grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {visibleChannelIndices.map((chIdx) => (
                <motion.div
                  key={`${selectedActivationLayer}-${chIdx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
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
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="btn-secondary text-[10px] py-1 px-2.5 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  ◀ Prev
                </button>
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-secondary text-[10px] py-1 px-2.5 disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  Next ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tensor active channel details overlay */}
      {!is2D && (
        <div className="p-3 bg-bg-deep/60 border border-border-subtle rounded-lg text-xs leading-relaxed text-text-secondary flex items-start gap-2.5">
          <div className="w-5 h-5 rounded bg-aurora-purple/15 text-text-accent flex items-center justify-center font-mono text-[10px] flex-shrink-0 border border-aurora-purple/20">
            {selectedChannel}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-display font-semibold uppercase text-text-muted leading-none">
              Selected Channel activation
            </span>
            <p className="text-[11px] text-text-secondary mt-1">
              Currently focused on filter channel index <strong className="text-text-primary">#{selectedChannel}</strong>. 
              The heatmap displays local patterns matched by this convolution weight matrix.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
