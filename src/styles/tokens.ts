/**
 * Tensor Aurora Design Tokens
 * 
 * Elegant, premium dark theme tokens featuring deep indigo/violet/teal/mint highlights.
 * Built for a high-end educational user experience.
 */

export const tokens = {
  colors: {
    // Backgrounds
    background: {
      deep: '#03000a',     // Pitch dark background with a tiny violet tint
      canvas: '#000000',   // Absolute black for ML drawing canvas
      card: '#0c0717',     // Solid card overlay background
      panel: '#080410',    // Sidebar and timeline panel background
    },
    
    // Borders & Dividers
    border: {
      subtle: 'rgba(255, 255, 255, 0.04)',
      muted: 'rgba(255, 255, 255, 0.08)',
      focus: 'rgba(99, 102, 241, 0.4)', // Indigo glow
    },

    // Typography
    text: {
      primary: '#f3f1f7',   // Crisp off-white
      secondary: '#9e99a8', // Muted slate gray
      muted: '#625d6b',     // Deep placeholder/disabled gray
      accent: '#a78bfa',    // Bright violet highlight
    },

    // Aurora Accents (Harmonious gradient points)
    aurora: {
      indigo: '#312e81',    // Deep Indigo base
      violet: '#6d28d9',    // Violet mid-point
      purple: '#8b5cf6',    // Bright Purple accent
      teal: '#0d9488',      // Deep Teal focus
      mint: '#34d399',      // Bright Mint highlight
    },

    // Activation Heat Scale (Low to High activations for feature maps and predictions)
    heatScale: [
      '#05020c', // 0.0: Pitch violet/black (Inactive)
      '#13092b', // 0.1
      '#230c4e', // 0.2
      '#350d75', // 0.3
      '#470d9e', // 0.4: Deep violet
      '#1e2d83', // 0.5: Transitioning to blue/teal
      '#0d568c', // 0.6
      '#0b7f8c', // 0.7: Soft teal
      '#0d9488', // 0.8: Solid teal
      '#10b981', // 0.9: Green/mint
      '#34d399', // 1.0: Bright Mint (Max Activation)
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
