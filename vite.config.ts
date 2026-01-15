import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base' must be './' for GitHub Pages to serve assets correctly from subdirectories
  base: './', 
  build: {
    rollupOptions: {
      input: {
        // Define multiple entry points for the multi-page app
        main: 'index.html',
        privacy: 'privacy.html',
      },
    },
  },
})