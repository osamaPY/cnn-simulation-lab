import React, { useState, useEffect } from 'react';
import { useLabStore } from '../hooks/useLabStore';
import { CNN_STAGES } from '../types/cnn';
import { TensorGridPreview } from './TensorGridStage/TensorGridPreview';
import { FeatureMapGrid } from '../components/FeatureMapGrid';
import { ConvolutionStage } from './ConvolutionStage/ConvolutionStage';
import { PoolingStage } from './PoolingStage/PoolingStage';
import { FlattenStage } from './FlattenStage/FlattenStage';
import { DenseStage } from './DenseStage/DenseStage';
import { SoftmaxStage } from './SoftmaxStage/SoftmaxStage';
import { PredictionStage } from './PredictionStage/PredictionStage';
import { StageEmptyState } from '../components/StageEmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const StagePlaceholder: React.FC = () => {
  const { currentStageId, preprocessedData, activations, setCurrentStageId } = useLabStore();
  const [showValues, setShowValues] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const stage = CNN_STAGES.find(s => s.id === currentStageId) || CNN_STAGES[0];

  // Sync selected activation layer with current stage when activations exist
  useEffect(() => {
    if (activations.length === 0) return;
    
    let targetLayer = null;
    if (currentStageId === 7 || currentStageId === 8) {
      targetLayer = 'conv2d_1';
    } else if (currentStageId === 9) {
      targetLayer = 'max_pooling2d_1';
    } else if (currentStageId === 10) {
      targetLayer = 'flatten';
    } else if (currentStageId === 11) {
      targetLayer = 'dense_1';
    } else if (currentStageId === 12) {
      targetLayer = 'dense_2';
    }

    if (targetLayer) {
      // Find matching layer name from real activations (handles naming variations)
      const matchingRecord = activations.find(r => 
        r.layerName.toLowerCase() === targetLayer || 
        r.layerName.toLowerCase().startsWith(targetLayer + '_') ||
        (targetLayer === 'conv2d_1' && r.layerType === 'Conv2D')
      );
      if (matchingRecord) {
        useLabStore.getState().setSelectedActivationLayer(matchingRecord.layerName);
      }
    }
  }, [currentStageId, activations]);

  // Helper to draw a pixelated number '3' for grid previews
  const mockDigitPixels = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 8, 8, 8, 8, 0, 0],
    [0, 0, 0, 0, 0, 8, 0, 0],
    [0, 0, 0, 8, 8, 8, 0, 0],
    [0, 0, 0, 0, 0, 8, 0, 0],
    [0, 0, 8, 8, 8, 8, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Render a specific visual layout per stage type
  const renderVisualArea = () => {
    switch (currentStageId) {
      case 1: // Normalization
        return (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-text-muted mb-2">1. Raw Ink Stroke</span>
              <div className="w-40 h-40 bg-black border border-border-muted rounded flex items-center justify-center relative overflow-hidden">
                <svg className="w-32 h-32 text-white stroke-current" viewBox="0 0 100 100" fill="none" strokeWidth="4">
                  <path d="M 30,30 Q 75,20 70,50 Q 65,75 30,75 Q 50,75 75,80" />
                </svg>
                {/* Simulated off-center bounding box */}
                <div className="absolute top-4 left-6 w-24 h-24 border border-dashed border-aurora-purple/60" />
              </div>
            </div>
            
            <div className="text-text-accent font-mono text-lg animate-pulse">➔</div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-mono text-text-muted mb-2">2. Centered & Normalized (28x28)</span>
              <div className="w-40 h-40 bg-black border border-aurora-teal/40 rounded flex items-center justify-center relative shadow-[0_0_15px_rgba(13,148,136,0.1)]">
                <svg className="w-24 h-24 text-white stroke-current opacity-80" viewBox="0 0 100 100" fill="none" strokeWidth="6">
                  <path d="M 35,35 Q 70,25 65,50 Q 60,70 35,70 Q 50,70 70,75" />
                </svg>
                <div className="absolute inset-2 border border-dashed border-aurora-teal/20" />
              </div>
            </div>
          </div>
        );

      case 2: // Grid Discretization
      case 3: // Pixel Probe
        if (preprocessedData) {
          return <TensorGridPreview />;
        }
        return (
          <div className="flex flex-col items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowValues(!showValues)}
                className="btn-secondary text-[11px] py-1 px-3"
              >
                Toggle: {showValues ? "Show Intensity Mode" : "Show Numerical Mode"}
              </button>
            </div>
            
            <div className="bg-black p-3 rounded-lg border border-border-muted grid grid-cols-8 gap-0.5 max-w-[240px]">
              {mockDigitPixels.map((row, rIdx) => 
                row.map((val, cIdx) => {
                  const intensity = val / 10;
                  return (
                    <div 
                      key={`${rIdx}-${cIdx}`}
                      className="w-6 h-6 flex items-center justify-center rounded-[2px] transition-all text-[8px] font-mono select-none"
                      style={{ 
                        backgroundColor: `rgba(52, 211, 153, ${intensity})`,
                        color: intensity > 0.4 ? '#03000a' : '#9e99a8'
                      }}
                      title={`Val: ${intensity}`}
                    >
                      {showValues ? (intensity > 0 ? intensity.toFixed(1) : "0") : ""}
                    </div>
                  );
                })
              )}
            </div>
            <span className="text-[10px] font-mono text-text-muted">8x8 representation of digit 3</span>
          </div>
        );

      case 4: // Conv Scan
      case 5: // Multiply
      case 6: // Sum
        if (preprocessedData) {
          return <ConvolutionStage />;
        }
        return (
          <div className="flex flex-col items-center py-6 gap-6 w-full">
            <div className="flex flex-wrap items-center justify-center gap-6 w-full">
              {/* Input volume */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-text-muted mb-2">Input Grid [28x28]</span>
                <div className="w-24 h-24 bg-bg-deep border border-border-muted rounded relative flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-0.5 p-1 w-full h-full opacity-30">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="bg-aurora-indigo/50 rounded-sm" />
                    ))}
                  </div>
                  {/* Sliding 3x3 window overlay */}
                  <div className="absolute top-4 left-4 w-10 h-10 border-2 border-aurora-purple bg-aurora-purple/20 animate-pulse" />
                </div>
              </div>

              {/* Convolution operator */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-text-muted mb-2">Kernel [3x3]</span>
                <div className="w-16 h-16 bg-bg-deep border border-aurora-purple/50 rounded p-1 grid grid-cols-3 gap-0.5">
                  {[-1, 0, 1, -2, 0, 2, -1, 0, 1].map((weight, i) => (
                    <div key={i} className="flex items-center justify-center rounded-sm bg-aurora-indigo/80 text-[8px] font-mono text-text-primary">
                      {weight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-text-accent font-mono text-lg font-bold">➔</div>

              {/* Feature map */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-text-muted mb-2">Feature Map [26x26]</span>
                <div className="w-20 h-20 bg-bg-deep border border-aurora-teal/50 rounded relative flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-0.5 p-1 w-full h-full opacity-45">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className="bg-aurora-teal/40 rounded-sm" />
                    ))}
                  </div>
                  {/* Highlighted computed output pixel */}
                  <div className="absolute top-3 left-3 w-4 h-4 bg-aurora-mint border border-text-primary rounded-sm shadow-md" />
                </div>
              </div>
            </div>
            
            <div className="text-center max-w-sm text-xs text-text-secondary border border-border-muted p-2 rounded bg-bg-deep/40">
              <span className="font-semibold text-text-accent">Slide Mechanics:</span> The kernel traverses spatial coordinates, multiplying local activations by weights, then sums them up with a bias scalar.
            </div>
          </div>
        );

      case 7: // Multi-Filter Stack
      case 8: // ReLU
        if (activations.length > 0) {
          return <FeatureMapGrid />;
        }
        return (
          <div className="relative h-48 w-full flex items-center justify-center overflow-hidden">
            {/* Stacked 3D layers layout */}
            <div className="relative w-64 h-32 flex items-center justify-center">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="absolute w-28 h-28 border border-aurora-purple/55 bg-gradient-to-br from-aurora-indigo/20 to-bg-card rounded-md shadow-lg"
                  style={{
                    transform: `rotateX(55deg) rotateZ(-45deg) translate3d(${idx * 16}px, ${idx * -16}px, ${idx * 4}px)`,
                    borderColor: idx === 0 ? 'var(--aurora-mint)' : 'rgba(139, 92, 246, 0.4)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className="w-full h-full grid grid-cols-4 gap-1 p-2 opacity-50">
                    {Array.from({ length: 16 }).map((_, cellIdx) => (
                      <div 
                        key={cellIdx} 
                        className={`rounded-sm ${
                          cellIdx % 3 === 0 
                            ? 'bg-aurora-teal/60' 
                            : currentStageId === 8 
                              ? 'bg-black/60' // Negative outputs clipped to 0
                              : 'bg-aurora-violet/35'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {currentStageId === 8 && (
              <div className="absolute bottom-2 bg-aurora-purple/20 border border-aurora-purple/40 text-[10px] py-1 px-3 rounded font-mono text-text-primary">
                Clipped Negatives: f(x) = max(0, x)
              </div>
            )}
          </div>
        );

      case 9: // Max Pooling
        if (preprocessedData) {
          return <PoolingStage />;
        }
        if (activations.length > 0) {
          return <FeatureMapGrid />;
        }
        return (
          <div className="flex flex-col items-center py-6 gap-6 w-full">
            <div className="flex items-center justify-center gap-8">
              {/* Large Grid before pooling */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-text-muted mb-2">Feature Map [26x26]</span>
                <div className="w-28 h-28 bg-bg-deep border border-border-muted p-1 rounded grid grid-cols-4 gap-1">
                  {[4, 8, 2, 1, 0, 5, 9, 3, 3, 1, 0, 4, 2, 7, 5, 6].map((val, i) => (
                    <div key={i} className={`flex items-center justify-center rounded-sm text-xs font-mono font-bold ${
                      i === 2 || i === 6 || i === 1 || i === 5 ? 'bg-aurora-purple/30 text-text-primary border border-aurora-purple/60' : 'bg-bg-deep border border-border-subtle text-text-muted'
                    }`}>
                      {val}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-text-accent font-mono text-lg">➔</div>

              {/* Shrunk Grid after pooling */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-text-muted mb-2">Max Pooled [13x13]</span>
                <div className="w-16 h-16 bg-bg-deep border border-aurora-teal/50 p-1 rounded grid grid-cols-2 gap-1 shadow-[0_0_15px_rgba(20,185,129,0.1)]">
                  {[8, 9, 3, 7].map((val, i) => (
                    <div key={i} className="flex items-center justify-center bg-aurora-teal/20 text-xs font-mono font-bold text-aurora-mint border border-aurora-mint/30 rounded-sm">
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-text-muted">Example: Keeps the maximum value in each 2x2 grid cell</span>
          </div>
        );

      case 10: // Flatten
        return <FlattenStage />;

      case 11: // Dense Connected
        return <DenseStage />;

      case 12: // Softmax
        return <SoftmaxStage />;

      case 13: // Prediction
        return <PredictionStage />;

      default:
        return (
          <div className="flex items-center justify-center py-12 text-text-muted">
            Visualizer content loading...
          </div>
        );
    }
  };

  return (
    <div className="aurora-card p-6 h-full flex flex-col justify-between">
      {/* Visualizer Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-aurora-teal" />
          <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-text-primary">
            {stage.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono py-0.5 px-2 bg-bg-deep rounded border border-border-muted text-text-secondary">
            Shape: {stage.shapeLabel}
          </span>
          <span className="text-[9px] font-sans font-semibold py-0.5 px-1.5 rounded bg-aurora-indigo/30 border border-aurora-purple/20 text-text-accent uppercase tracking-wider">
            Preview
          </span>
        </div>
      </div>

      {/* Interactive / Visual Area with smooth slide/fade transition */}
      <div className="flex-1 flex items-center justify-center bg-bg-deep/30 rounded-lg border border-border-subtle overflow-hidden min-h-[300px] relative w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStageId + (preprocessedData ? '-act' : '-empty')}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -15 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full h-full flex items-center justify-center"
          >
            {currentStageId > 1 && !preprocessedData ? (
              <StageEmptyState
                stageName={stage.name}
                description="This stage requires active network activations. Draw a digit on the canvas (left) and click 'Run Simulation' to run preprocessing and unlock the CNN stages."
              />
            ) : (
              renderVisualArea()
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption footer with guided Back/Next navigation */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between gap-4">
        <div className="text-xs text-text-secondary leading-relaxed flex items-center gap-2 flex-1 min-w-0">
          <span className="text-text-accent font-display font-semibold uppercase text-[9px] tracking-wider py-0.5 px-1.5 rounded bg-bg-deep border border-border-muted flex-shrink-0">
            Concept
          </span>
          <span className="truncate">{stage.description}</span>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          {currentStageId > 1 && (
            <button
              onClick={() => setCurrentStageId(currentStageId - 1)}
              className="btn-secondary text-[10.5px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
            >
              ⬅ Back
            </button>
          )}
          {preprocessedData && currentStageId < 13 && (
            <button
              onClick={() => setCurrentStageId(currentStageId + 1)}
              className="btn-primary text-[10.5px] py-1 px-2.5 flex items-center gap-1 cursor-pointer shadow-md shadow-aurora-purple/10"
            >
              Next ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
