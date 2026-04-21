// vite.config.mjs
import { defineConfig } from "file:///C:/xampp/htdocs/inventario/inventoryHRAEI-front/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/xampp/htdocs/inventario/inventoryHRAEI-front/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import VueIconsPlugin from "file:///C:/xampp/htdocs/inventario/inventoryHRAEI-front/node_modules/@kalimahapps/vue-icons/vite-plugin/dist/index.js";
import fs from "fs";
import os from "os";
var __vite_injected_original_dirname = "C:\\xampp\\htdocs\\inventario\\inventoryHRAEI-front";
function VueIconsWrapper() {
  const base = VueIconsPlugin();
  return {
    name: "vite-plugin-vue-icons-wrapper",
    enforce: base.enforce,
    transform(code, id) {
      if (id && (id.endsWith("EquipmentHistoryPanel.vue") || id.includes("UserSettings.vue"))) {
        return null;
      }
      return base.transform(code, id);
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [vue(), VueIconsWrapper()],
  // Keep Vite cache off OneDrive to avoid slow FS sync overhead on Windows.
  cacheDir: path.join(os.tmpdir(), "inventoryHRAEI-front-vite-cache"),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  optimizeDeps: {
    include: ["pdfjs-dist", "@kalimahapps/vue-icons", "flatpickr", "jspdf", "xlsx", "qrcode"]
  },
  build: {
    // Aggressive minification for tunnel transmission
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2,
        pure_funcs: ["console.log", "console.debug"],
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
          "vue-core": ["vue"],
          "pdf": ["pdfjs-dist"],
          "utils": ["xlsx", "jspdf", "qrcode"],
          "icons": ["@kalimahapps/vue-icons"]
        }
      }
    },
    // Reduce bundle size
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    // Enable source maps in dev for debugging, but disable in production
    sourcemap: process.env.NODE_ENV === "development" ? "hidden" : false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1e3,
    // ES module output
    target: "esnext",
    // Increase timeout for tunnel builds
    reportCompressedSize: false
  },
  server: function() {
    const host = true;
    const port = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173;
    const strictPort = true;
    const allowedHosts = [".ngrok-free.dev", ".loca.lt", ".trycloudflare.com", "localhost"];
    const rawCfHost = process.env.VITE_CLOUDFLARE_HOST || "";
    const cfHost = rawCfHost ? String(rawCfHost).replace(/^https?:\/\//i, "").replace(/\/$/, "") : null;
    const disableHmr = process.env.VITE_DISABLE_HMR === "1" || process.env.VITE_DISABLE_HMR === "true";
    if (disableHmr && cfHost) console.warn("[vite] VITE_DISABLE_HMR set: HMR disabled despite cloudflared host", cfHost);
    const hmrConfig = !disableHmr && cfHost ? { protocol: "wss", host: cfHost, port: 443 } : disableHmr ? false : void 0;
    const middlewares = (app) => {
      app.use("/refresh-hosts", (req, res) => {
        try {
          const networkInterfaces = os.networkInterfaces();
          const hosts = [];
          Object.keys(networkInterfaces).forEach((interfaceName) => {
            const addresses = networkInterfaces[interfaceName];
            addresses.forEach((addr) => {
              if (addr.family === "IPv4" && !addr.internal) {
                hosts.push(addr.address);
              }
            });
          });
          hosts.unshift("localhost");
          const publicDir = path.resolve(process.cwd(), "public");
          if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
          }
          const devHostsFile = path.resolve(publicDir, "dev-hosts.json");
          const hostData = { hosts, timestamp: Date.now() };
          fs.writeFileSync(devHostsFile, JSON.stringify(hostData, null, 2));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(hostData));
          console.log("[vite] Refreshed network addresses:", hosts);
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      app.use((req, res, next) => {
        if (req.url.endsWith(".js") || req.url.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
        }
        if (req.url.endsWith(".html") || req.url === "/") {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
        next();
      });
    };
    const baseConfig = {
      host,
      port,
      strictPort,
      allowedHosts,
      hmr: hmrConfig,
      watch: {
        ignored: [
          "**/.git/**",
          "**/node_modules/**",
          "**/dist/**",
          "**/tmp/**",
          "**/uploads/**",
          "**/inventoryHRAEI-back/**"
        ]
      },
      middlewares,
      proxy: {
        "/api": {
          target: "http://localhost:3002",
          changeOrigin: true,
          secure: false,
          ws: false
        }
      }
    };
    const useHttps = process.env.VITE_USE_HTTPS === "true" || process.env.VITE_USE_HTTPS === "1";
    if (useHttps) {
      const certFile = process.env.VITE_HTTPS_CERT || "./.certs/dev-cert.pem";
      const keyFile = process.env.VITE_HTTPS_KEY || "./.certs/dev-key.pem";
      try {
        const cert = fs.readFileSync(certFile);
        const key = fs.readFileSync(keyFile);
        return {
          ...baseConfig,
          https: {
            cert,
            key
          }
        };
      } catch (e) {
        console.warn("[vite] Could not read HTTPS cert/key, falling back to http server:", e && e.message);
      }
    }
    return baseConfig;
  }()
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxceGFtcHBcXFxcaHRkb2NzXFxcXGludmVudGFyaW9cXFxcaW52ZW50b3J5SFJBRUktZnJvbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXHhhbXBwXFxcXGh0ZG9jc1xcXFxpbnZlbnRhcmlvXFxcXGludmVudG9yeUhSQUVJLWZyb250XFxcXHZpdGUuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzoveGFtcHAvaHRkb2NzL2ludmVudGFyaW8vaW52ZW50b3J5SFJBRUktZnJvbnQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBWdWVJY29uc1BsdWdpbiBmcm9tICdAa2FsaW1haGFwcHMvdnVlLWljb25zL3ZpdGUnO1xuXG4vLyB3cmFwcGVyIHRvIHNraXAgcHJvYmxlbWF0aWMgZmlsZXNcbmZ1bmN0aW9uIFZ1ZUljb25zV3JhcHBlcigpIHtcbiAgY29uc3QgYmFzZSA9IFZ1ZUljb25zUGx1Z2luKCk7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLXZ1ZS1pY29ucy13cmFwcGVyJyxcbiAgICBlbmZvcmNlOiBiYXNlLmVuZm9yY2UsXG4gICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICAvLyBTa2lwIHByb2Nlc3NpbmcgZmlsZXMgdGhhdCBjb250YWluIHByb2JsZW1hdGljIEphdmFTY3JpcHQgY29kZVxuICAgICAgaWYgKGlkICYmIChpZC5lbmRzV2l0aCgnRXF1aXBtZW50SGlzdG9yeVBhbmVsLnZ1ZScpIHx8IGlkLmluY2x1ZGVzKCdVc2VyU2V0dGluZ3MudnVlJykpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJhc2UudHJhbnNmb3JtKGNvZGUsIGlkKTtcbiAgICB9XG4gIH07XG59XG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFt2dWUoKSwgVnVlSWNvbnNXcmFwcGVyKCldLFxuICAvLyBLZWVwIFZpdGUgY2FjaGUgb2ZmIE9uZURyaXZlIHRvIGF2b2lkIHNsb3cgRlMgc3luYyBvdmVyaGVhZCBvbiBXaW5kb3dzLlxuICBjYWNoZURpcjogcGF0aC5qb2luKG9zLnRtcGRpcigpLCAnaW52ZW50b3J5SFJBRUktZnJvbnQtdml0ZS1jYWNoZScpLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJylcbiAgICB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncGRmanMtZGlzdCcsICdAa2FsaW1haGFwcHMvdnVlLWljb25zJywgJ2ZsYXRwaWNrcicsICdqc3BkZicsICd4bHN4JywgJ3FyY29kZSddXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgLy8gQWdncmVzc2l2ZSBtaW5pZmljYXRpb24gZm9yIHR1bm5lbCB0cmFuc21pc3Npb25cbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgIHRlcnNlck9wdGlvbnM6IHtcbiAgICAgIGNvbXByZXNzOiB7XG4gICAgICAgIHBhc3NlczogMixcbiAgICAgICAgcHVyZV9mdW5jczogWydjb25zb2xlLmxvZycsICdjb25zb2xlLmRlYnVnJ10sXG4gICAgICAgIGRyb3BfY29uc29sZTogZmFsc2UsXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcbiAgICAgIH0sXG4gICAgICBtYW5nbGU6IHRydWUsXG4gICAgICBmb3JtYXQ6IHtcbiAgICAgICAgY29tbWVudHM6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBDb2RlIHNwbGl0dGluZyBwYXJhIGNodW5rcyBtXHUwMEUxcyBwZXF1ZVx1MDBGMW9zXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICd2dWUtY29yZSc6IFsndnVlJ10sXG4gICAgICAgICAgJ3BkZic6IFsncGRmanMtZGlzdCddLFxuICAgICAgICAgICd1dGlscyc6IFsneGxzeCcsICdqc3BkZicsICdxcmNvZGUnXSxcbiAgICAgICAgICAnaWNvbnMnOiBbJ0BrYWxpbWFoYXBwcy92dWUtaWNvbnMnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICAvLyBSZWR1Y2UgYnVuZGxlIHNpemVcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGluIGRldiBmb3IgZGVidWdnaW5nLCBidXQgZGlzYWJsZSBpbiBwcm9kdWN0aW9uXG4gICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyA/ICdoaWRkZW4nIDogZmFsc2UsXG4gICAgLy8gQ2h1bmsgc2l6ZSB3YXJuaW5nc1xuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICAvLyBFUyBtb2R1bGUgb3V0cHV0XG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICAvLyBJbmNyZWFzZSB0aW1lb3V0IGZvciB0dW5uZWwgYnVpbGRzXG4gICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IGZhbHNlXG4gIH0sXG4gIHNlcnZlcjogKGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IGhvc3QgPSB0cnVlXG4gICAgY29uc3QgcG9ydCA9IHByb2Nlc3MuZW52LlZJVEVfUE9SVCA/IHBhcnNlSW50KHByb2Nlc3MuZW52LlZJVEVfUE9SVCkgOiA1MTczXG4gICAgY29uc3Qgc3RyaWN0UG9ydCA9IHRydWVcbiAgICBjb25zdCBhbGxvd2VkSG9zdHMgPSBbJy5uZ3Jvay1mcmVlLmRldicsICcubG9jYS5sdCcsICcudHJ5Y2xvdWRmbGFyZS5jb20nLCAnbG9jYWxob3N0J11cblxuICAgIC8vIElmIGEgQ2xvdWRmbGFyZSBxdWljayB0dW5uZWwgcHJvdmlkZXMgYSBwdWJsaWMgaG9zdCwgdXNlIGl0IHRvIGNvbmZpZ3VyZSBITVIgdmlhIFdTU1xuICAgIGNvbnN0IHJhd0NmSG9zdCA9IHByb2Nlc3MuZW52LlZJVEVfQ0xPVURGTEFSRV9IT1NUIHx8ICcnXG4gICAgY29uc3QgY2ZIb3N0ID0gcmF3Q2ZIb3N0ID8gU3RyaW5nKHJhd0NmSG9zdCkucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC8vaSwgJycpLnJlcGxhY2UoL1xcLyQvLCAnJykgOiBudWxsXG5cbiAgICBjb25zdCBkaXNhYmxlSG1yID0gcHJvY2Vzcy5lbnYuVklURV9ESVNBQkxFX0hNUiA9PT0gJzEnIHx8IHByb2Nlc3MuZW52LlZJVEVfRElTQUJMRV9ITVIgPT09ICd0cnVlJ1xuICAgIGlmIChkaXNhYmxlSG1yICYmIGNmSG9zdCkgY29uc29sZS53YXJuKCdbdml0ZV0gVklURV9ESVNBQkxFX0hNUiBzZXQ6IEhNUiBkaXNhYmxlZCBkZXNwaXRlIGNsb3VkZmxhcmVkIGhvc3QnLCBjZkhvc3QpXG5cbiAgICBjb25zdCBobXJDb25maWcgPSAoIWRpc2FibGVIbXIgJiYgY2ZIb3N0KSA/IHsgcHJvdG9jb2w6ICd3c3MnLCBob3N0OiBjZkhvc3QsIHBvcnQ6IDQ0MyB9IDogKGRpc2FibGVIbXIgPyBmYWxzZSA6IHVuZGVmaW5lZClcblxuICAgIC8vIE1pZGRsZXdhcmUgZm9yIGNvbXByZXNzaW9uIGFuZCBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25cbiAgICBjb25zdCBtaWRkbGV3YXJlcyA9IChhcHApID0+IHtcbiAgICAgIC8vIER5bmFtaWMgbmV0d29yayBhZGRyZXNzIHVwZGF0ZXJcbiAgICAgIGFwcC51c2UoJy9yZWZyZXNoLWhvc3RzJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gVXBkYXRlIGRldi1ob3N0cy5qc29uIHdpdGggY3VycmVudCBuZXR3b3JrIGFkZHJlc3Nlc1xuICAgICAgICAgIGNvbnN0IG5ldHdvcmtJbnRlcmZhY2VzID0gb3MubmV0d29ya0ludGVyZmFjZXMoKVxuICAgICAgICAgIGNvbnN0IGhvc3RzID0gW11cbiAgICAgICAgICBcbiAgICAgICAgICBPYmplY3Qua2V5cyhuZXR3b3JrSW50ZXJmYWNlcykuZm9yRWFjaChpbnRlcmZhY2VOYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NlcyA9IG5ldHdvcmtJbnRlcmZhY2VzW2ludGVyZmFjZU5hbWVdXG4gICAgICAgICAgICBhZGRyZXNzZXMuZm9yRWFjaChhZGRyID0+IHtcbiAgICAgICAgICAgICAgaWYgKGFkZHIuZmFtaWx5ID09PSAnSVB2NCcgJiYgIWFkZHIuaW50ZXJuYWwpIHtcbiAgICAgICAgICAgICAgICBob3N0cy5wdXNoKGFkZHIuYWRkcmVzcylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIFxuICAgICAgICAgIGhvc3RzLnVuc2hpZnQoJ2xvY2FsaG9zdCcpXG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcHVibGljRGlyID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdwdWJsaWMnKVxuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwdWJsaWNEaXIpKSB7XG4gICAgICAgICAgICBmcy5ta2RpclN5bmMocHVibGljRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICBjb25zdCBkZXZIb3N0c0ZpbGUgPSBwYXRoLnJlc29sdmUocHVibGljRGlyLCAnZGV2LWhvc3RzLmpzb24nKVxuICAgICAgICAgIGNvbnN0IGhvc3REYXRhID0geyBob3N0cywgdGltZXN0YW1wOiBEYXRlLm5vdygpIH1cbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGRldkhvc3RzRmlsZSwgSlNPTi5zdHJpbmdpZnkoaG9zdERhdGEsIG51bGwsIDIpKVxuICAgICAgICAgIFxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJylcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGhvc3REYXRhKSlcbiAgICAgICAgICBjb25zb2xlLmxvZygnW3ZpdGVdIFJlZnJlc2hlZCBuZXR3b3JrIGFkZHJlc3NlczonLCBob3N0cylcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGVycm9yOiBlLm1lc3NhZ2UgfSkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBcbiAgICAgIC8vIEFkZCBnemlwIGNvbXByZXNzaW9uIGZvciB0dW5uZWwgdHJhbnNtaXNzaW9uXG4gICAgICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAvLyBBZGQgY2FjaGUgaGVhZGVycyB0byBKUy9DU1MgY2h1bmtzICgxIGhvdXIgZm9yIGRldilcbiAgICAgICAgaWYgKHJlcS51cmwuZW5kc1dpdGgoJy5qcycpIHx8IHJlcS51cmwuZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHVibGljLCBtYXgtYWdlPTM2MDAsIG11c3QtcmV2YWxpZGF0ZScpXG4gICAgICAgIH1cbiAgICAgICAgLy8gQWx3YXlzIHJldmFsaWRhdGUgSFRNTFxuICAgICAgICBpZiAocmVxLnVybC5lbmRzV2l0aCgnLmh0bWwnKSB8fCByZXEudXJsID09PSAnLycpIHtcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ3B1YmxpYywgbWF4LWFnZT0wLCBtdXN0LXJldmFsaWRhdGUnKVxuICAgICAgICB9XG4gICAgICAgIG5leHQoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlQ29uZmlnID0ge1xuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBzdHJpY3RQb3J0LFxuICAgICAgYWxsb3dlZEhvc3RzLFxuICAgICAgaG1yOiBobXJDb25maWcsXG4gICAgICB3YXRjaDoge1xuICAgICAgICBpZ25vcmVkOiBbXG4gICAgICAgICAgJyoqLy5naXQvKionLFxuICAgICAgICAgICcqKi9ub2RlX21vZHVsZXMvKionLFxuICAgICAgICAgICcqKi9kaXN0LyoqJyxcbiAgICAgICAgICAnKiovdG1wLyoqJyxcbiAgICAgICAgICAnKiovdXBsb2Fkcy8qKicsXG4gICAgICAgICAgJyoqL2ludmVudG9yeUhSQUVJLWJhY2svKionXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBtaWRkbGV3YXJlcyxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMicsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgd3M6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIVFRQUyBzdXBwb3J0IHVzaW5nIG1rY2VydC1nZW5lcmF0ZWQgY2VydGlmaWNhdGVzXG4gICAgY29uc3QgdXNlSHR0cHMgPSAocHJvY2Vzcy5lbnYuVklURV9VU0VfSFRUUFMgPT09ICd0cnVlJykgfHwgKHByb2Nlc3MuZW52LlZJVEVfVVNFX0hUVFBTID09PSAnMScpXG4gICAgaWYgKHVzZUh0dHBzKSB7XG4gICAgICBjb25zdCBjZXJ0RmlsZSA9IHByb2Nlc3MuZW52LlZJVEVfSFRUUFNfQ0VSVCB8fCAnLi8uY2VydHMvZGV2LWNlcnQucGVtJ1xuICAgICAgY29uc3Qga2V5RmlsZSA9IHByb2Nlc3MuZW52LlZJVEVfSFRUUFNfS0VZIHx8ICcuLy5jZXJ0cy9kZXYta2V5LnBlbSdcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNlcnQgPSBmcy5yZWFkRmlsZVN5bmMoY2VydEZpbGUpXG4gICAgICAgIGNvbnN0IGtleSA9IGZzLnJlYWRGaWxlU3luYyhrZXlGaWxlKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgICAgaHR0cHM6IHtcbiAgICAgICAgICAgIGNlcnQsXG4gICAgICAgICAgICBrZXlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbdml0ZV0gQ291bGQgbm90IHJlYWQgSFRUUFMgY2VydC9rZXksIGZhbGxpbmcgYmFjayB0byBodHRwIHNlcnZlcjonLCBlICYmIGUubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IEhUVFAgc2VydmVyXG4gICAgcmV0dXJuIGJhc2VDb25maWdcbiAgfSkoKVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMlUsU0FBUyxvQkFBb0I7QUFDeFcsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG9CQUFvQjtBQWlCM0IsT0FBTyxRQUFRO0FBQ2YsT0FBTyxRQUFRO0FBckJmLElBQU0sbUNBQW1DO0FBTXpDLFNBQVMsa0JBQWtCO0FBQ3pCLFFBQU0sT0FBTyxlQUFlO0FBQzVCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsS0FBSztBQUFBLElBQ2QsVUFBVSxNQUFNLElBQUk7QUFFbEIsVUFBSSxPQUFPLEdBQUcsU0FBUywyQkFBMkIsS0FBSyxHQUFHLFNBQVMsa0JBQWtCLElBQUk7QUFDdkYsZUFBTztBQUFBLE1BQ1Q7QUFDQSxh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
