// vite.config.mjs
import { defineConfig } from "file:///C:/Users/eduar/OneDrive/Desktop/Nueva/inventoryHRAEI-front/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/eduar/OneDrive/Desktop/Nueva/inventoryHRAEI-front/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import VueIconsPlugin from "file:///C:/Users/eduar/OneDrive/Desktop/Nueva/inventoryHRAEI-front/node_modules/@kalimahapps/vue-icons/vite-plugin/dist/index.js";
import fs from "fs";
import os from "os";
var __vite_injected_original_dirname = "C:\\Users\\eduar\\OneDrive\\Desktop\\Nueva\\inventoryHRAEI-front";
function VueIconsWrapper() {
  const base = VueIconsPlugin();
  return {
    name: "vite-plugin-vue-icons-wrapper",
    enforce: base.enforce,
    transform(code, id) {
      if (id) {
        const normalizedId = id.replace(/\\/g, "/");
        if (normalizedId.endsWith("EquipmentHistoryPanel.vue") || normalizedId.includes("UserSettings.vue") || normalizedId.includes("ItemListVirtual.vue")) {
          return null;
        }
      }
      return base.transform(code, id);
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes("lottie-player")
        }
      }
    }),
    VueIconsWrapper()
  ],
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
    const enableDevAssetCache = process.env.VITE_DEV_ASSET_CACHE === "1" || process.env.VITE_DEV_ASSET_CACHE === "true";
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
          if (enableDevAssetCache) {
            res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
          } else {
            res.setHeader("Cache-Control", "no-store");
          }
        }
        if (req.url.endsWith(".html") || req.url === "/") {
          res.setHeader("Cache-Control", "no-store");
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZWR1YXJcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxOdWV2YVxcXFxpbnZlbnRvcnlIUkFFSS1mcm9udFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZWR1YXJcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxOdWV2YVxcXFxpbnZlbnRvcnlIUkFFSS1mcm9udFxcXFx2aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2VkdWFyL09uZURyaXZlL0Rlc2t0b3AvTnVldmEvaW52ZW50b3J5SFJBRUktZnJvbnQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBWdWVJY29uc1BsdWdpbiBmcm9tICdAa2FsaW1haGFwcHMvdnVlLWljb25zL3ZpdGUnO1xuXG4vLyB3cmFwcGVyIHRvIHNraXAgcHJvYmxlbWF0aWMgZmlsZXNcbmZ1bmN0aW9uIFZ1ZUljb25zV3JhcHBlcigpIHtcbiAgY29uc3QgYmFzZSA9IFZ1ZUljb25zUGx1Z2luKCk7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3ZpdGUtcGx1Z2luLXZ1ZS1pY29ucy13cmFwcGVyJyxcbiAgICBlbmZvcmNlOiBiYXNlLmVuZm9yY2UsXG4gICAgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgICAvLyBTa2lwIHByb2Nlc3NpbmcgZmlsZXMgdGhhdCBjb250YWluIHByb2JsZW1hdGljIEphdmFTY3JpcHQgY29kZVxuICAgICAgaWYgKGlkKSB7XG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRJZCA9IGlkLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbiAgICAgICAgaWYgKG5vcm1hbGl6ZWRJZC5lbmRzV2l0aCgnRXF1aXBtZW50SGlzdG9yeVBhbmVsLnZ1ZScpIHx8IFxuICAgICAgICAgICAgbm9ybWFsaXplZElkLmluY2x1ZGVzKCdVc2VyU2V0dGluZ3MudnVlJykgfHwgXG4gICAgICAgICAgICBub3JtYWxpemVkSWQuaW5jbHVkZXMoJ0l0ZW1MaXN0VmlydHVhbC52dWUnKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZS50cmFuc2Zvcm0oY29kZSwgaWQpO1xuICAgIH1cbiAgfTtcbn1cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBvcyBmcm9tICdvcydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHZ1ZSh7XG4gICAgICB0ZW1wbGF0ZToge1xuICAgICAgICBjb21waWxlck9wdGlvbnM6IHtcbiAgICAgICAgICBpc0N1c3RvbUVsZW1lbnQ6ICh0YWcpID0+IHRhZy5pbmNsdWRlcygnbG90dGllLXBsYXllcicpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSwgXG4gICAgVnVlSWNvbnNXcmFwcGVyKClcbiAgXSxcbiAgLy8gS2VlcCBWaXRlIGNhY2hlIG9mZiBPbmVEcml2ZSB0byBhdm9pZCBzbG93IEZTIHN5bmMgb3ZlcmhlYWQgb24gV2luZG93cy5cbiAgY2FjaGVEaXI6IHBhdGguam9pbihvcy50bXBkaXIoKSwgJ2ludmVudG9yeUhSQUVJLWZyb250LXZpdGUtY2FjaGUnKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpXG4gICAgfVxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3BkZmpzLWRpc3QnLCAnQGthbGltYWhhcHBzL3Z1ZS1pY29ucycsICdmbGF0cGlja3InLCAnanNwZGYnLCAneGxzeCcsICdxcmNvZGUnXVxuICB9LFxuICBidWlsZDoge1xuICAgIC8vIEFnZ3Jlc3NpdmUgbWluaWZpY2F0aW9uIGZvciB0dW5uZWwgdHJhbnNtaXNzaW9uXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcbiAgICB0ZXJzZXJPcHRpb25zOiB7XG4gICAgICBjb21wcmVzczoge1xuICAgICAgICBwYXNzZXM6IDIsXG4gICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5kZWJ1ZyddLFxuICAgICAgICBkcm9wX2NvbnNvbGU6IGZhbHNlLFxuICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXG4gICAgICB9LFxuICAgICAgbWFuZ2xlOiB0cnVlLFxuICAgICAgZm9ybWF0OiB7XG4gICAgICAgIGNvbW1lbnRzOiBmYWxzZVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gQ29kZSBzcGxpdHRpbmcgcGFyYSBjaHVua3MgbVx1MDBFMXMgcGVxdWVcdTAwRjFvc1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAndnVlLWNvcmUnOiBbJ3Z1ZSddLFxuICAgICAgICAgICdwZGYnOiBbJ3BkZmpzLWRpc3QnXSxcbiAgICAgICAgICAndXRpbHMnOiBbJ3hsc3gnLCAnanNwZGYnLCAncXJjb2RlJ10sXG4gICAgICAgICAgJ2ljb25zJzogWydAa2FsaW1haGFwcHMvdnVlLWljb25zJ11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgLy8gUmVkdWNlIGJ1bmRsZSBzaXplXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxuICAgIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBpbiBkZXYgZm9yIGRlYnVnZ2luZywgYnV0IGRpc2FibGUgaW4gcHJvZHVjdGlvblxuICAgIHNvdXJjZW1hcDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcgPyAnaGlkZGVuJyA6IGZhbHNlLFxuICAgIC8vIENodW5rIHNpemUgd2FybmluZ3NcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgLy8gRVMgbW9kdWxlIG91dHB1dFxuICAgIHRhcmdldDogJ2VzbmV4dCcsXG4gICAgLy8gSW5jcmVhc2UgdGltZW91dCBmb3IgdHVubmVsIGJ1aWxkc1xuICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZVxuICB9LFxuICBzZXJ2ZXI6IChmdW5jdGlvbigpIHtcbiAgICBjb25zdCBob3N0ID0gdHJ1ZVxuICAgIGNvbnN0IHBvcnQgPSBwcm9jZXNzLmVudi5WSVRFX1BPUlQgPyBwYXJzZUludChwcm9jZXNzLmVudi5WSVRFX1BPUlQpIDogNTE3M1xuICAgIGNvbnN0IHN0cmljdFBvcnQgPSB0cnVlXG4gICAgY29uc3QgYWxsb3dlZEhvc3RzID0gWycubmdyb2stZnJlZS5kZXYnLCAnLmxvY2EubHQnLCAnLnRyeWNsb3VkZmxhcmUuY29tJywgJ2xvY2FsaG9zdCddXG5cbiAgICAvLyBJZiBhIENsb3VkZmxhcmUgcXVpY2sgdHVubmVsIHByb3ZpZGVzIGEgcHVibGljIGhvc3QsIHVzZSBpdCB0byBjb25maWd1cmUgSE1SIHZpYSBXU1NcbiAgICBjb25zdCByYXdDZkhvc3QgPSBwcm9jZXNzLmVudi5WSVRFX0NMT1VERkxBUkVfSE9TVCB8fCAnJ1xuICAgIGNvbnN0IGNmSG9zdCA9IHJhd0NmSG9zdCA/IFN0cmluZyhyYXdDZkhvc3QpLnJlcGxhY2UoL15odHRwcz86XFwvXFwvL2ksICcnKS5yZXBsYWNlKC9cXC8kLywgJycpIDogbnVsbFxuXG4gICAgY29uc3QgZGlzYWJsZUhtciA9IHByb2Nlc3MuZW52LlZJVEVfRElTQUJMRV9ITVIgPT09ICcxJyB8fCBwcm9jZXNzLmVudi5WSVRFX0RJU0FCTEVfSE1SID09PSAndHJ1ZSdcbiAgICBpZiAoZGlzYWJsZUhtciAmJiBjZkhvc3QpIGNvbnNvbGUud2FybignW3ZpdGVdIFZJVEVfRElTQUJMRV9ITVIgc2V0OiBITVIgZGlzYWJsZWQgZGVzcGl0ZSBjbG91ZGZsYXJlZCBob3N0JywgY2ZIb3N0KVxuXG4gICAgY29uc3QgaG1yQ29uZmlnID0gKCFkaXNhYmxlSG1yICYmIGNmSG9zdCkgPyB7IHByb3RvY29sOiAnd3NzJywgaG9zdDogY2ZIb3N0LCBwb3J0OiA0NDMgfSA6IChkaXNhYmxlSG1yID8gZmFsc2UgOiB1bmRlZmluZWQpXG5cbiAgICAvLyBBbGxvdyBvcHRpbmcgaW4gdG8gYWdncmVzc2l2ZSBkZXYgYXNzZXQgY2FjaGUgZm9yIHR1bm5lbCB0ZXN0cy5cbiAgICAvLyBEZWZhdWx0IGlzIGRpc2FibGVkIHRvIHByZXZlbnQgc3RhbGUgVUkgd2hpbGUgZGV2ZWxvcGluZy5cbiAgICBjb25zdCBlbmFibGVEZXZBc3NldENhY2hlID0gcHJvY2Vzcy5lbnYuVklURV9ERVZfQVNTRVRfQ0FDSEUgPT09ICcxJyB8fCBwcm9jZXNzLmVudi5WSVRFX0RFVl9BU1NFVF9DQUNIRSA9PT0gJ3RydWUnXG5cbiAgICAvLyBNaWRkbGV3YXJlIGZvciBjb21wcmVzc2lvbiBhbmQgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uXG4gICAgY29uc3QgbWlkZGxld2FyZXMgPSAoYXBwKSA9PiB7XG4gICAgICAvLyBEeW5hbWljIG5ldHdvcmsgYWRkcmVzcyB1cGRhdGVyXG4gICAgICBhcHAudXNlKCcvcmVmcmVzaC1ob3N0cycsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFVwZGF0ZSBkZXYtaG9zdHMuanNvbiB3aXRoIGN1cnJlbnQgbmV0d29yayBhZGRyZXNzZXNcbiAgICAgICAgICBjb25zdCBuZXR3b3JrSW50ZXJmYWNlcyA9IG9zLm5ldHdvcmtJbnRlcmZhY2VzKClcbiAgICAgICAgICBjb25zdCBob3N0cyA9IFtdXG4gICAgICAgICAgXG4gICAgICAgICAgT2JqZWN0LmtleXMobmV0d29ya0ludGVyZmFjZXMpLmZvckVhY2goaW50ZXJmYWNlTmFtZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzZXMgPSBuZXR3b3JrSW50ZXJmYWNlc1tpbnRlcmZhY2VOYW1lXVxuICAgICAgICAgICAgYWRkcmVzc2VzLmZvckVhY2goYWRkciA9PiB7XG4gICAgICAgICAgICAgIGlmIChhZGRyLmZhbWlseSA9PT0gJ0lQdjQnICYmICFhZGRyLmludGVybmFsKSB7XG4gICAgICAgICAgICAgICAgaG9zdHMucHVzaChhZGRyLmFkZHJlc3MpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICBcbiAgICAgICAgICBob3N0cy51bnNoaWZ0KCdsb2NhbGhvc3QnKVxuICAgICAgICAgIFxuICAgICAgICAgIGNvbnN0IHB1YmxpY0RpciA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAncHVibGljJylcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHVibGljRGlyKSkge1xuICAgICAgICAgICAgZnMubWtkaXJTeW5jKHB1YmxpY0RpciwgeyByZWN1cnNpdmU6IHRydWUgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgZGV2SG9zdHNGaWxlID0gcGF0aC5yZXNvbHZlKHB1YmxpY0RpciwgJ2Rldi1ob3N0cy5qc29uJylcbiAgICAgICAgICBjb25zdCBob3N0RGF0YSA9IHsgaG9zdHMsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9XG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhkZXZIb3N0c0ZpbGUsIEpTT04uc3RyaW5naWZ5KGhvc3REYXRhLCBudWxsLCAyKSlcbiAgICAgICAgICBcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShob3N0RGF0YSkpXG4gICAgICAgICAgY29uc29sZS5sb2coJ1t2aXRlXSBSZWZyZXNoZWQgbmV0d29yayBhZGRyZXNzZXM6JywgaG9zdHMpXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMFxuICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogZS5tZXNzYWdlIH0pKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgXG4gICAgICAvLyBTZXQgY2FjaGUgaGVhZGVycyBmb3IgZGV2IHJlc3BvbnNlcy5cbiAgICAgIC8vIEtlZXAgYXNzZXRzIHVuY2FjaGVkIGJ5IGRlZmF1bHQgc28gVUkvY29kZSBjaGFuZ2VzIGFyZSBhbHdheXMgdmlzaWJsZSBpbW1lZGlhdGVseS5cbiAgICAgIGFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gICAgICAgIC8vIEpTL0NTUyBhc3NldHNcbiAgICAgICAgaWYgKHJlcS51cmwuZW5kc1dpdGgoJy5qcycpIHx8IHJlcS51cmwuZW5kc1dpdGgoJy5jc3MnKSkge1xuICAgICAgICAgIGlmIChlbmFibGVEZXZBc3NldENhY2hlKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ3B1YmxpYywgbWF4LWFnZT0zNjAwLCBtdXN0LXJldmFsaWRhdGUnKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDYWNoZS1Db250cm9sJywgJ25vLXN0b3JlJylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSFRNTCBzaG91bGQgbmV2ZXIgYmUgY2FjaGVkIGR1cmluZyBkZXYuXG4gICAgICAgIGlmIChyZXEudXJsLmVuZHNXaXRoKCcuaHRtbCcpIHx8IHJlcS51cmwgPT09ICcvJykge1xuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAnbm8tc3RvcmUnKVxuICAgICAgICB9XG4gICAgICAgIG5leHQoKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlQ29uZmlnID0ge1xuICAgICAgaG9zdCxcbiAgICAgIHBvcnQsXG4gICAgICBzdHJpY3RQb3J0LFxuICAgICAgYWxsb3dlZEhvc3RzLFxuICAgICAgaG1yOiBobXJDb25maWcsXG4gICAgICB3YXRjaDoge1xuICAgICAgICBpZ25vcmVkOiBbXG4gICAgICAgICAgJyoqLy5naXQvKionLFxuICAgICAgICAgICcqKi9ub2RlX21vZHVsZXMvKionLFxuICAgICAgICAgICcqKi9kaXN0LyoqJyxcbiAgICAgICAgICAnKiovdG1wLyoqJyxcbiAgICAgICAgICAnKiovdXBsb2Fkcy8qKicsXG4gICAgICAgICAgJyoqL2ludmVudG9yeUhSQUVJLWJhY2svKionXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBtaWRkbGV3YXJlcyxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMicsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgICAgd3M6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBIVFRQUyBzdXBwb3J0IHVzaW5nIG1rY2VydC1nZW5lcmF0ZWQgY2VydGlmaWNhdGVzXG4gICAgY29uc3QgdXNlSHR0cHMgPSAocHJvY2Vzcy5lbnYuVklURV9VU0VfSFRUUFMgPT09ICd0cnVlJykgfHwgKHByb2Nlc3MuZW52LlZJVEVfVVNFX0hUVFBTID09PSAnMScpXG4gICAgaWYgKHVzZUh0dHBzKSB7XG4gICAgICBjb25zdCBjZXJ0RmlsZSA9IHByb2Nlc3MuZW52LlZJVEVfSFRUUFNfQ0VSVCB8fCAnLi8uY2VydHMvZGV2LWNlcnQucGVtJ1xuICAgICAgY29uc3Qga2V5RmlsZSA9IHByb2Nlc3MuZW52LlZJVEVfSFRUUFNfS0VZIHx8ICcuLy5jZXJ0cy9kZXYta2V5LnBlbSdcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNlcnQgPSBmcy5yZWFkRmlsZVN5bmMoY2VydEZpbGUpXG4gICAgICAgIGNvbnN0IGtleSA9IGZzLnJlYWRGaWxlU3luYyhrZXlGaWxlKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2VDb25maWcsXG4gICAgICAgICAgaHR0cHM6IHtcbiAgICAgICAgICAgIGNlcnQsXG4gICAgICAgICAgICBrZXlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdbdml0ZV0gQ291bGQgbm90IHJlYWQgSFRUUFMgY2VydC9rZXksIGZhbGxpbmcgYmFjayB0byBodHRwIHNlcnZlcjonLCBlICYmIGUubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IEhUVFAgc2VydmVyXG4gICAgcmV0dXJuIGJhc2VDb25maWdcbiAgfSkoKVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1gsU0FBUyxvQkFBb0I7QUFDN1ksT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLG9CQUFvQjtBQXNCM0IsT0FBTyxRQUFRO0FBQ2YsT0FBTyxRQUFRO0FBMUJmLElBQU0sbUNBQW1DO0FBTXpDLFNBQVMsa0JBQWtCO0FBQ3pCLFFBQU0sT0FBTyxlQUFlO0FBQzVCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLFNBQVMsS0FBSztBQUFBLElBQ2QsVUFBVSxNQUFNLElBQUk7QUFFbEIsVUFBSSxJQUFJO0FBQ04sY0FBTSxlQUFlLEdBQUcsUUFBUSxPQUFPLEdBQUc7QUFDMUMsWUFBSSxhQUFhLFNBQVMsMkJBQTJCLEtBQ2pELGFBQWEsU0FBUyxrQkFBa0IsS0FDeEMsYUFBYSxTQUFTLHFCQUFxQixHQUFHO0FBQ2hELGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFDQSxhQUFPLEtBQUssVUFB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
