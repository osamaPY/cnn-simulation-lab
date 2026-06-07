import React from 'react';
import { Header } from '../components/Header';
import { DrawCanvas } from '../stages/DrawingStage/DrawCanvas';
import { StageViewer } from '../stages/StageViewer';
import { ExplanationPanel } from '../components/ExplanationPanel';
import { useLabStore } from '../hooks/useLabStore';
import { motion } from 'framer-motion';
import { PlayerControls } from '../components/PlayerControls';

export const LessonShell: React.FC = () => {
  const preprocessedData = useLabStore(state => state.preprocessedData);

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#050508] text-text-primary overflow-hidden font-sans">
      <Header />
      
      {/* 3B1B Cinematic Viewport */}
      <main className="flex-1 relative flex flex-col overflow-hidden m-4 md:m-6 rounded-2xl border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] bg-[#0a0a0e]">
        
        {!preprocessedData ? (
          /* Initial Drawing canvas centered */
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 1.05 }}
               className="flex flex-col items-center gap-8 p-12 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl pointer-events-auto"
             >
               <div className="text-center">
                  <h2 className="text-4xl font-display text-white mb-3">Draw the Input</h2>
                  <p className="text-white/60 text-lg">Your stroke will be the tensor processed by the CNN.</p>
               </div>
               <DrawCanvas />
             </motion.div>
          </div>
        ) : (
          /* Active Simulation state: Stack visualization, subtitles and controls vertically in a flex layout */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            
            {/* Visualizer Frame - takes up remaining space */}
            <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden px-4">
              <StageViewer />
              
              {/* Floating Math Formula (top-right overlay inside the canvas area) */}
              <div className="absolute top-4 right-4 pointer-events-none z-30">
                <ExplanationPanel mode="formula" />
              </div>
            </div>
            
            {/* Subtitles Area - sits cleanly below the StageViewer */}
            <div className="flex-shrink-0 w-full flex justify-center py-2 px-6 z-20 pointer-events-none">
              <ExplanationPanel mode="subtitles" />
            </div>

            {/* Controls Bottom Bar - sits cleanly below subtitles */}
            <div className="flex-shrink-0 w-full pt-2 pb-6 px-8 bg-gradient-to-t from-black via-black/90 to-transparent z-10 flex flex-col justify-end">
              <PlayerControls />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
