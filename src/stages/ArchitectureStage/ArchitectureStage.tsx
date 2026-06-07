import React from 'react';
import { motion } from 'framer-motion';

interface TensorBlockProps {
  width: number;
  height: number;
  depth: number;
  color: string;
  delay: number;
}

const TensorBlock: React.FC<TensorBlockProps> = ({ width, height, depth, color, delay }) => {
  // Scaling factors for visual representation
  const sw = width * 1.5;
  const sh = height * 1.5;
  const sd = depth * 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      <svg width={sw + sd + 10} height={sh + sd + 10} viewBox={`0 0 ${sw + sd + 10} ${sh + sd + 10}`} className="drop-shadow-2xl">
        {/* Right Face */}
        <path
          d={`M ${sw} 0 L ${sw + sd} ${sd / 2} L ${sw + sd} ${sh + sd / 2} L ${sw} ${sh} Z`}
          fill={color}
          fillOpacity={0.2}
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Top Face */}
        <path
          d={`M 0 0 L ${sd} ${sd / 2} L ${sw + sd} ${sd / 2} L ${sw} 0 Z`}
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
          fillOpacity={0.1}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
};

export const ArchitectureStage: React.FC = () => {
  const layers = [
    { name: 'Input', type: 'image', shape: [28, 28, 1], color: '#58C4DD' },
    { name: 'Conv Block 1', type: 'block', shape: [26, 26, 8], color: '#F5CD47', layers: ['Conv 3x3', 'ReLU'] },
    { name: 'Pool 1', type: 'pooling', shape: [13, 13, 8], color: '#83C167' },
    { name: 'Conv Block 2', type: 'block', shape: [11, 11, 16], color: '#F5CD47', layers: ['Conv 3x3', 'ReLU'] },
    { name: 'Pool 2', type: 'pooling', shape: [5, 5, 16], color: '#83C167' },
    { name: 'Flatten', type: 'operation', shape: [1, 1, 400], color: '#E07A5F' },
    { name: 'Dense', type: 'dense', shape: [1, 1, 64], color: '#9C27B0' },
    { name: 'Output', type: 'output', shape: [1, 1, 10], color: '#FF6666' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-[#1c1c1c]">
      <div className="relative flex items-center justify-center gap-6 w-full max-w-6xl h-64">
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
                className="w-4 h-[1px] bg-white/10"
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
