import React from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '../../hooks/useLabStore';

interface TensorBlockProps {
  width: number;
  height: number;
  depth: number;
  color: string;
  delay: number;
}

const TensorBlock: React.FC<TensorBlockProps> = ({ width, height, depth, color, delay }) => {
  // Scaling factors for visual representation
  const sw = Math.max(width * 1.5, 4);
  const sh = Math.max(height * 1.5, 4);
  const sd = Math.min(Math.max(Math.sqrt(depth) * 8, 4), 160); // Cap depth so it doesn't break layout
  // Offset to ensure top face fits in view
  const ty = sd / 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <svg width={sw + sd + 10} height={sh + ty + 10} viewBox={`0 0 ${sw + sd + 10} ${sh + ty + 10}`} className="drop-shadow-2xl">
        <g transform={`translate(2, ${ty + 2})`}>
          {/* Right Face */}
          <path
            d={`M ${sw} 0 L ${sw + sd} ${-sd / 2} L ${sw + sd} ${sh - sd / 2} L ${sw} ${sh} Z`}
            fill={color}
            fillOpacity={0.2}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Top Face */}
          <path
            d={`M 0 0 L ${sd} ${-sd / 2} L ${sw + sd} ${-sd / 2} L ${sw} 0 Z`}
            fill={color}
            fillOpacity={0.4}
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Front Face */}
          <path
            d={`M 0 0 L ${sw} 0 L ${sw} ${sh} L 0 ${sh} Z`}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </motion.div>
  );
};

export const ArchitectureStage: React.FC = () => {
  const hyperparams = useLabStore(state => state.hyperparams);

  const c1Dim = Math.max(1, Math.floor((28 + 2 * hyperparams.padding - hyperparams.kernelSize) / hyperparams.stride) + 1);
  const p1Dim = Math.max(1, Math.floor(c1Dim / hyperparams.poolingSize));
  const c2Dim = Math.max(1, Math.floor((p1Dim + 2 * hyperparams.padding - hyperparams.kernelSize) / hyperparams.stride) + 1);
  const p2Dim = Math.max(1, Math.floor(c2Dim / hyperparams.poolingSize));

  const layers = [
    { name: 'Input', type: 'image', shape: [28, 28, 1], color: '#58C4DD' },
    { name: 'Conv Block 1', type: 'block', shape: [c1Dim, c1Dim, hyperparams.numFilters], color: '#F5CD47', layers: [`Conv ${hyperparams.kernelSize}x${hyperparams.kernelSize}`, 'ReLU'] },
    { name: 'Pool 1', type: 'pooling', shape: [p1Dim, p1Dim, hyperparams.numFilters], color: '#83C167' },
    { name: 'Conv Block 2', type: 'block', shape: [c2Dim, c2Dim, hyperparams.numFilters * 2], color: '#F5CD47', layers: [`Conv ${hyperparams.kernelSize}x${hyperparams.kernelSize}`, 'ReLU'] },
    { name: 'Pool 2', type: 'pooling', shape: [p2Dim, p2Dim, hyperparams.numFilters * 2], color: '#83C167' },
    { name: 'Flatten', type: 'operation', shape: [1, 1, p2Dim * p2Dim * hyperparams.numFilters * 2], color: '#E07A5F' },
    { name: 'Dense', type: 'dense', shape: [1, 1, 64], color: '#9C27B0' },
    { name: 'Output', type: 'output', shape: [1, 1, 10], color: '#FF6666' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden bg-[#1c1c1c]">
      <div className="w-full overflow-x-auto no-scrollbar py-12 flex items-center justify-start lg:justify-center">
        <div className="flex items-center gap-6 px-12 min-w-max">
          {layers.map((layer, i) => (
            <React.Fragment key={layer.name}>
              <div className="flex flex-col items-center gap-6">
                <TensorBlock
                  width={layer.shape[0]}
                  height={layer.shape[1]}
                  depth={layer.shape[2]}
                  color={layer.color}
                  delay={i * 0.1}
                />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono font-bold text-white/90 uppercase tracking-tighter whitespace-nowrap">{layer.name}</span>
                  <span className="text-[9px] font-mono text-white/30">{layer.shape.join('×')}</span>
                </div>
              </div>

              {i < layers.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                  className="w-4 h-[1px] bg-white/10 flex-shrink-0"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
