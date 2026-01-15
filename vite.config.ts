import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // CRITICAL: specific base path './' is required for assets 
  // to load correctly in the Android WebView
  base: './', 
})