import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/cnn-simulation-lab/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('katex')) return 'math';
            if (id.includes('react') || id.includes('framer-motion') || id.includes('zustand')) return 'vendor';
            return 'dependencies';
          }
        }
      }
    }
  }
}))
