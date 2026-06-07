import React from 'react';
import { motion } from 'framer-motion';

export const ArchitectureStage: React.FC = () => {
  const layers = [
    { name: 'Input', type: 'image', shape: '28x28x1', color: '#6366f1' },
    { name: 'Conv Block 1', type: 'block', shape: '26x26x8', color: '#22d3ee', layers: ['Conv 3x3', 'ReLU'] },
    { name: 'Pool 1', type: 'pooling', shape: '13x13x8', color: '#a855f7' },
    { name: 'Conv Block 2', type: 'block', shape: '11x11x16', color: '#3b82f6', layers: ['Conv 3x3', 'ReLU'] },
    { name: 'Pool 2', type: 'pooling', shape: '5x5x16', color: '#ec4899' },
    { name: 'Flatten', type: 'operation', shape: '400', color: '#f97316' },
    { name: 'Dense', type: 'dense', shape: '64', color: '#f59e0b' },
    { name: 'Output', type: 'output', shape: '10', color: '#34d399' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="flex flex-col items-center gap-4 mb-12">
        <h2 className="text-4xl font-display font-bold text-white tracking-tight">Macro Architecture</h2>
        <div className="flex items-center gap-2 text-aurora-purple font-mono text-sm uppercase tracking-widest">
           <span className="w-2 h-2 rounded-full bg-aurora-purple animate-pulse" />
           VGG-Inspired Sequential Flow
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-4 w-full max-w-5xl">
        {layers.map((layer, i) => (
          <React.Fragment key={layer.name}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group flex flex-col items-center gap-3"
            >
              <div 
                className="relative w-16 h-40 rounded-xl border-2 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden cursor-help"
                style={{ 
                  borderColor: `${layer.color}40`,
                  background: `linear-gradient(to bottom, ${layer.color}10, ${layer.color}05)`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                   {layer.type === 'block' ? (
                     <div className="flex flex-col gap-1 w-full">
                        <div className="h-4 w-full bg-white/10 rounded-sm" />
                        <div className="h-4 w-full bg-white/10 rounded-sm" />
                        <div className="h-4 w-full bg-white/10 rounded-sm" />
                     </div>
                   ) : (
                     <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40">
                        {layer.name[0]}
                     </div>
                   )}
                </div>
                
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ backgroundColor: layer.color }}
                />
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-tighter whitespace-nowrap">{layer.name}</span>
                <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{layer.shape}</span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-32 p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                 <p className="text-[9px] font-mono text-white/60 leading-tight">
                    {layer.type === 'block' ? 'Feature Extraction Block' : 'Vector Transformation'}
                 </p>
                 <div className="mt-2 flex flex-col gap-1">
                    {layer.layers?.map(l => (
                      <span key={l} className="text-[8px] font-mono text-aurora-purple">• {l}</span>
                    ))}
                 </div>
              </div>
            </motion.div>

            {i < layers.length - 1 && (
              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                className="w-8 h-px bg-gradient-to-right from-white/20 to-transparent"
                style={{ 
                   background: `linear-gradient(to right, ${layer.color}40, ${layers[i+1].color}40)` 
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-16 max-w-2xl text-center"
      >
        <p className="text-sm font-mono text-white/50 leading-relaxed italic">
          "The network is a series of repeated <span className="text-aurora-purple font-bold">Convolution + ReLU + Pooling</span> blocks. As data flows deeper, spatial dimensions decrease while the number of filters increases, allowing the network to recognize complex semantic patterns from simple edges."
        </p>
      </motion.div>
    </div>
  );
};
