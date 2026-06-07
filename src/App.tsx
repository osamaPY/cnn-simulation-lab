import React, { useEffect, Suspense } from 'react';
import { useLabStore } from './hooks/useLabStore';

const LessonShell = React.lazy(() => import('./scenes/LessonShell').then(m => ({ default: m.LessonShell })));

const App: React.FC = () => {
  const loadModel = useLabStore(state => state.loadModel);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-bg-deep text-text-primary flex-col gap-4">
        <div className="w-10 h-10 border-4 border-aurora-purple/30 border-t-aurora-purple rounded-full animate-spin"></div>
        <p className="text-sm font-medium animate-pulse">Loading CNN Visualizer...</p>
      </div>
    }>
      <LessonShell />
    </Suspense>
  );
};

export default App;
