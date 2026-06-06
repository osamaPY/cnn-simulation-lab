/**
 * Tensor Aurora Motion Parameters & Easing Curves
 * Follows the Animation Bible principles: smooth ease-out curves, no bouncy toy feel.
 */

export const transitions = {
  // Cubic-bezier easing values
  easings: {
    // 3Blue1Brown-caliber smooth ease-out curve
    smoothOut: [0.22, 1, 0.36, 1],
    easeInOut: [0.65, 0, 0.35, 1],
    accentOut: [0.16, 1, 0.3, 1],
  },
  
  // Transition duration constants (seconds)
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    stagger: 0.05,
  },

  // Ready-to-use Framer Motion transition configs
  presets: {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3, ease: 'linear' }
    },
    
    slideUp: {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -15 },
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    },
    
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    },
    
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    }
  }
};
