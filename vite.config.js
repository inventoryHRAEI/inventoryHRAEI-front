import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import os from 'node:os';

function pickPrimaryIPv4() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        candidates.push({ name, address: net.address });
      }
    }
  }
  // Prefer common LAN ranges (192.168.x.x then 10.x.x.x), otherwise pick first
  const prefer192 = candidates.find(c => /^192\.168\./.test(c.address));
  if (prefer192) return prefer192.address;
  const prefer10 = candidates.find(c => /^10\./.test(c.address));
  if (prefer10) return prefer10.address;
  return candidates.length ? candidates[0].address : undefined;
}

const envHost = process.env.DEV_HOST || process.env.HOST || undefined;
const selectedHost = envHost || pickPrimaryIPv4() || true; // fallback to true (0.0.0.0)
if (typeof selectedHost === 'string') console.log('[vite.config] selected dev host:', selectedHost);

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: selectedHost,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  plugins: [
    vue(),
    // Plugin to print a concise and clear URL summary for mobile testing
    {
      name: 'prefer-host-logger',
      configureServer(server) {
        server.httpServer?.once('listening', () => {
          try {
            const addr = server.httpServer.address()
            const port = (addr && addr.port) || 5173
            const local = `http://localhost:${port}`
            const preferred = typeof selectedHost === 'string' ? `http://${selectedHost}:${port}` : null
            console.log('\n---------------------------------------------------')
            console.log('  Use these URLs to access the dev server:')
            console.log(`    Local:   ${local}`)
            if (preferred) console.log(`    Network: ${preferred}  <-- recommended for mobile`)
            console.log('---------------------------------------------------\n')
          } catch (e) { /* ignore */ }
        })
      }
    }
  ]
});
