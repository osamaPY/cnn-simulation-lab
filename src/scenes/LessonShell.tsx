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
        


        {/* Floating Subtitles and Math - Absolute overlay */}
        {preprocessedData && (
          <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 pb-28">
             <ExplanationPanel />
          </div>
        )}

        {/* The Cinematic Canvas */}
        <div className="absolute top-0 left-0 right-0 bottom-[140px] z-10 flex flex-col items-center justify-center overflow-hidden">
          {!preprocessedData ? (
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
          ) : (
             <StageViewer />
          )}
        </div>

        {/* Unified Player Controls Bottom Bar */}
        {preprocessedData && (
          <div className="absolute bottom-0 left-0 right-0 pt-24 pb-6 px-8 bg-gradient-to-t from-black via-black/80 to-transparent z-40 pointer-events-none flex flex-col justify-end">
            <PlayerControls />
          </div>
        )}
      </main>
    </div>
  );
};
