import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5500,
    proxy: {
      // Proxy API requests to the backend to avoid CORS in development
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false,
        // keep the /api prefix
      }
    }
  }
})
