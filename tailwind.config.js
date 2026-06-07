/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': 'var(--bg-deep)',
        'bg-canvas': 'var(--bg-canvas)',
        'bg-card': 'var(--bg-card)',
        'bg-panel': 'var(--bg-panel)',
        'border-subtle': 'var(--border-subtle)',
        'border-muted': 'var(--border-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-accent': 'var(--text-accent)',
        'aurora-indigo': 'var(--aurora-indigo)',
        'aurora-violet': 'var(--aurora-violet)',
        'aurora-purple': 'var(--aurora-purple)',
        'aurora-teal': 'var(--aurora-teal)',
        'aurora-mint': 'var(--aurora-mint)',
        'signal-coral': 'var(--signal-coral)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

