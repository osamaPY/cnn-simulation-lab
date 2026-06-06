import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the user's OS preference has reduced motion enabled.
 * Useful to disable heavy SVG path animations, layout morphs, or sliding loops.
 */
export function useReducedMotion(): boolean {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Check client environment media query support
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setShouldReduceMotion(mediaQuery.matches);

    // Event listener callback
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    // Attach listeners
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return shouldReduceMotion;
}
