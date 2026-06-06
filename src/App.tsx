import React, { useEffect } from 'react';
import { useLabStore } from './hooks/useLabStore';
import { LessonShell } from './scenes/LessonShell';

const App: React.FC = () => {
  const { loadModel } = useLabStore();

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  return <LessonShell />;
};

export default App;
