/**
 * Tensor Aurora scene tokens. Color is reserved for mathematical meaning:
 * cyan for active data, gold for focus, and coral for negative/error states.
 */

export const tokens = {
  colors: {
    // Backgrounds
    background: {
      deep: '#071018',
      canvas: '#020609',
      card: '#0b1720',
      panel: '#09131c',
    },
    
    // Borders & Dividers
    border: {
      subtle: 'rgba(179, 216, 230, 0.10)',
      muted: 'rgba(179, 216, 230, 0.20)',
      focus: 'rgba(80, 201, 230, 0.55)',
    },

    // Typography
    text: {
      primary: '#f1f5ef',
      secondary: '#b4c5c9',
      muted: '#78909a',
      accent: '#f2c14e',
    },

    // Mathematical color roles
    aurora: {
      indigo: '#123447',
      violet: '#24566d',
      purple: '#50c9e6',
      teal: '#2fa6b8',
      mint: '#8be9c1',
    },

    // Activation Heat Scale (Low to High activations for feature maps and predictions)
    heatScale: [
      '#020609',
      '#081923',
      '#0b2b3a',
      '#0d4054',
      '#115b70',
      '#17778c',
      '#2695a6',
      '#50b6c5',
      '#7bd1cf',
      '#b5e7c8',
      '#f2c14e',
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
