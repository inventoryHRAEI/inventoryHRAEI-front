import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import VueIconsPlugin from '@kalimahapps/vue-icons/vite';
import fs from 'fs'
import os from 'os'

export default defineConfig({
  plugins: [vue(), VueIconsPlugin()],
  // Keep Vite cache off OneDrive to avoid slow FS sync overhead on Windows.
  cacheDir: path.join(os.tmpdir(), 'inventoryHRAEI-front-vite-cache'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist', '@kalimahapps/vue-icons', 'flatpickr', 'jspdf', 'xlsx', 'qrcode']
  },
  build: {
    // Aggressive minification for tunnel transmission
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        pure_funcs: ['console.log', 'console.debug'],
        drop_console: false,
        drop_debugger: true
      },
      mangle: true,
      format: {
        comments: false
      }
    },
    // Code splitting para chunks más pequeños
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-core': ['vue'],
          'pdf': ['pdfjs-dist'],
          'utils': ['xlsx', 'jspdf', 'qrcode'],
          'icons': ['@kalimahapps/vue-icons']
        }
      }
    },
    // Reduce bundle size
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    // Enable source maps in dev for debugging, but disable in production
    sourcemap: process.env.NODE_ENV === 'development' ? 'hidden' : false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // ES module output
    target: 'esnext',
    // Increase timeout for tunnel builds
    reportCompressedSize: false
  },
  server: (function() {
    const host = true
    const port = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173
    const strictPort = true
    const allowedHosts = ['.ngrok-free.dev', '.loca.lt', '.trycloudflare.com', 'localhost']

    // If a Cloudflare quick tunnel provides a public host, use it to configure HMR via WSS
    const rawCfHost = process.env.VITE_CLOUDFLARE_HOST || ''
    const cfHost = rawCfHost ? String(rawCfHost).replace(/^https?:\/\//i, '').replace(/\/$/, '') : null

    const disableHmr = process.env.VITE_DISABLE_HMR === '1' || process.env.VITE_DISABLE_HMR === 'true'
    if (disableHmr && cfHost) console.warn('[vite] VITE_DISABLE_HMR set: HMR disabled despite cloudflared host', cfHost)

    const hmrConfig = (!disableHmr && cfHost) ? { protocol: 'wss', host: cfHost, port: 443 } : (disableHmr ? false : undefined)

    // Middleware for compression and performance optimization
    const middlewares = (app) => {
      // Dynamic network address updater
      app.use('/refresh-hosts', (req, res) => {
        try {
          // Update dev-hosts.json with current network addresses
          const networkInterfaces = os.networkInterfaces()
          const hosts = []
          
          Object.keys(networkInterfaces).forEach(interfaceName => {
            const addresses = networkInterfaces[interfaceName]
            addresses.forEach(addr => {
              if (addr.family === 'IPv4' && !addr.internal) {
                hosts.push(addr.address)
              }
            })
          })
          
          hosts.unshift('localhost')
          
          const publicDir = path.resolve(process.cwd(), 'public')
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true })
          }
          
          const devHostsFile = path.resolve(publicDir, 'dev-hosts.json')
          const hostData = { hosts, timestamp: Date.now() }
          fs.writeFileSync(devHostsFile, JSON.stringify(hostData, null, 2))
          
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(hostData))
          console.log('[vite] Refreshed network addresses:', hosts)
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        }
      })
      
      // Add gzip compression for tunnel transmission
      app.use((req, res, next) => {
        // Add cache headers to JS/CSS chunks (1 hour for dev)
        if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate')
        }
        // Always revalidate HTML
        if (req.url.endsWith('.html') || req.url === '/') {
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
        }
        next()
      })
    }

    const baseConfig = {
      host,
      port,
      strictPort,
      allowedHosts,
      hmr: hmrConfig,
      watch: {
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/tmp/**',
          '**/uploads/**',
          '**/inventoryHRAEI-back/**'
        ]
      },
      middlewares,
      proxy: {
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true,
          secure: false,
          ws: false
        }
      }
    }

    // HTTPS support using mkcert-generated certificates
    const useHttps = (process.env.VITE_USE_HTTPS === 'true') || (process.env.VITE_USE_HTTPS === '1')
    if (useHttps) {
      const certFile = process.env.VITE_HTTPS_CERT || './.certs/dev-cert.pem'
      const keyFile = process.env.VITE_HTTPS_KEY || './.certs/dev-key.pem'
      try {
        const cert = fs.readFileSync(certFile)
        const key = fs.readFileSync(keyFile)
        return {
          ...baseConfig,
          https: {
            cert,
            key
          }
        }
      } catch (e) {
        console.warn('[vite] Could not read HTTPS cert/key, falling back to http server:', e && e.message)
      }
    }

    // Default HTTP server
    return baseConfig
  })()
})
