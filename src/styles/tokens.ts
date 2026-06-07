/**
 * Tensor Aurora scene tokens. Color is reserved for mathematical meaning:
 * cyan for active data, gold for focus, and coral for negative/error states.
 */

export const tokens = {
  colors: {
    // Backgrounds
    background: {
      deep: '#161616',
      canvas: '#1c1c1c',
      card: '#242424',
      panel: '#1e1e1e',
    },
    
    // Borders & Dividers
    border: {
      subtle: 'rgba(255, 255, 240, 0.05)',
      muted: 'rgba(255, 255, 240, 0.12)',
      focus: '#58C4DD',
    },

    // Typography
    text: {
      primary: '#FFFEF0',
      secondary: '#B4B4B4',
      muted: '#7D7D7D',
      accent: '#F5CD47',
    },

    // Mathematical color roles
    aurora: {
      indigo: '#34495e',
      violet: '#9C27B0',
      purple: '#58C4DD',
      teal: '#2980b9',
      mint: '#83C167',
    },

    // Activation Heat Scale (Low to High activations for feature maps and predictions)
    heatScale: [
      '#1C1C1C', // Deep charcoal (zero activation)
      '#1e2d4d', // Dark blue
      '#58C4DD', // Manim Blue
      '#83C167', // Manim Green
      '#F5CD47', // Manim Yellow
      '#E07A5F', // Manim Orange
      '#FF6666', // Manim Red (maximum activation)
    ]
  },

  // Premium spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    xxl: '3rem',     // 48px
  },

  // Premium border radius
  radius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },

  // Framer motion duration and easing curves
  motion: {
    duration: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5,
      timeline: 0.7,
    },
    easing: {
      // 3Blue1Brown-caliber smooth ease-out (smooth, no bouncy toy feel)
      smoothOut: [0.22, 1, 0.36, 1], 
      easeInOut: [0.65, 0, 0.35, 1],
      accentOut: [0.16, 1, 0.3, 1],
    }
  }
};
