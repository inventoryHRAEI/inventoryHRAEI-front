import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Ensure pdfjs-dist is pre-bundled by Vite to avoid import resolution issues
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  server: {
    // Expose dev server on the local network so other devices can access it
    host: true,
    port: 5173,
    // Si 5173 está ocupado, preferimos fallar (en vez de saltar a 5174)
    // para mantener URLs/configuración consistentes.
    strictPort: true,
    // HMR will usually work without extra config, but if clients need to
    // connect via LAN/IP you can set hmr.host to the machine IP.
    // hmr: { host: '192.168.x.x' },
    proxy: {
      // Proxy API calls in development to the backend server
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        ws: false
      }
    }
  }
})
