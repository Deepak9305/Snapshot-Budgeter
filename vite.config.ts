import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base' must be './' for GitHub Pages project repositories
  base: './', 
  build: {
    rollupOptions: {
      input: {
        // Define multiple entry points
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
})