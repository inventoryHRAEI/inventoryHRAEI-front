// vite.config.mjs
import { defineConfig } from "file:///C:/Users/eduar/OneDrive/Desktop/inventario/inventoryHRAEI-front/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/eduar/OneDrive/Desktop/inventario/inventoryHRAEI-front/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import VueIconsPlugin from "file:///C:/Users/eduar/OneDrive/Desktop/inventario/inventoryHRAEI-front/node_modules/@kalimahapps/vue-icons/vite-plugin/dist/index.js";
import fs from "fs";
import os from "os";
var __vite_injected_original_dirname = "C:\\Users\\eduar\\OneDrive\\Desktop\\inventario\\inventoryHRAEI-front";
var vite_config_default = defineConfig({
  plugins: [vue(), VueIconsPlugin()],
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZWR1YXJcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxpbnZlbnRhcmlvXFxcXGludmVudG9yeUhSQUVJLWZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxlZHVhclxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGludmVudGFyaW9cXFxcaW52ZW50b3J5SFJBRUktZnJvbnRcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9lZHVhci9PbmVEcml2ZS9EZXNrdG9wL2ludmVudGFyaW8vaW52ZW50b3J5SFJBRUktZnJvbnQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBWdWVJY29uc1BsdWdpbiBmcm9tICdAa2FsaW1haGFwcHMvdnVlLWljb25zL3ZpdGUnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnXHJcbmltcG9ydCBvcyBmcm9tICdvcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3Z1ZSgpLCBWdWVJY29uc1BsdWdpbigpXSxcclxuICAvLyBLZWVwIFZpdGUgY2FjaGUgb2ZmIE9uZURyaXZlIHRvIGF2b2lkIHNsb3cgRlMgc3luYyBvdmVyaGVhZCBvbiBXaW5kb3dzLlxyXG4gIGNhY2hlRGlyOiBwYXRoLmpvaW4ob3MudG1wZGlyKCksICdpbnZlbnRvcnlIUkFFSS1mcm9udC12aXRlLWNhY2hlJyksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbJ3BkZmpzLWRpc3QnLCAnQGthbGltYWhhcHBzL3Z1ZS1pY29ucycsICdmbGF0cGlja3InLCAnanNwZGYnLCAneGxzeCcsICdxcmNvZGUnXVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIEFnZ3Jlc3NpdmUgbWluaWZpY2F0aW9uIGZvciB0dW5uZWwgdHJhbnNtaXNzaW9uXHJcbiAgICBtaW5pZnk6ICd0ZXJzZXInLFxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIHBhc3NlczogMixcclxuICAgICAgICBwdXJlX2Z1bmNzOiBbJ2NvbnNvbGUubG9nJywgJ2NvbnNvbGUuZGVidWcnXSxcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IGZhbHNlLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgbWFuZ2xlOiB0cnVlLFxyXG4gICAgICBmb3JtYXQ6IHtcclxuICAgICAgICBjb21tZW50czogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIENvZGUgc3BsaXR0aW5nIHBhcmEgY2h1bmtzIG1cdTAwRTFzIHBlcXVlXHUwMEYxb3NcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAndnVlLWNvcmUnOiBbJ3Z1ZSddLFxyXG4gICAgICAgICAgJ3BkZic6IFsncGRmanMtZGlzdCddLFxyXG4gICAgICAgICAgJ3V0aWxzJzogWyd4bHN4JywgJ2pzcGRmJywgJ3FyY29kZSddLFxyXG4gICAgICAgICAgJ2ljb25zJzogWydAa2FsaW1haGFwcHMvdnVlLWljb25zJ11cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyBSZWR1Y2UgYnVuZGxlIHNpemVcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxyXG4gICAgLy8gRW5hYmxlIHNvdXJjZSBtYXBzIGluIGRldiBmb3IgZGVidWdnaW5nLCBidXQgZGlzYWJsZSBpbiBwcm9kdWN0aW9uXHJcbiAgICBzb3VyY2VtYXA6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnID8gJ2hpZGRlbicgOiBmYWxzZSxcclxuICAgIC8vIENodW5rIHNpemUgd2FybmluZ3NcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIC8vIEVTIG1vZHVsZSBvdXRwdXRcclxuICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAvLyBJbmNyZWFzZSB0aW1lb3V0IGZvciB0dW5uZWwgYnVpbGRzXHJcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2VcclxuICB9LFxyXG4gIHNlcnZlcjogKGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc3QgaG9zdCA9IHRydWVcclxuICAgIGNvbnN0IHBvcnQgPSBwcm9jZXNzLmVudi5WSVRFX1BPUlQgPyBwYXJzZUludChwcm9jZXNzLmVudi5WSVRFX1BPUlQpIDogNTE3M1xyXG4gICAgY29uc3Qgc3RyaWN0UG9ydCA9IHRydWVcclxuICAgIGNvbnN0IGFsbG93ZWRIb3N0cyA9IFsnLm5ncm9rLWZyZWUuZGV2JywgJy5sb2NhLmx0JywgJy50cnljbG91ZGZsYXJlLmNvbScsICdsb2NhbGhvc3QnXVxyXG5cclxuICAgIC8vIElmIGEgQ2xvdWRmbGFyZSBxdWljayB0dW5uZWwgcHJvdmlkZXMgYSBwdWJsaWMgaG9zdCwgdXNlIGl0IHRvIGNvbmZpZ3VyZSBITVIgdmlhIFdTU1xyXG4gICAgY29uc3QgcmF3Q2ZIb3N0ID0gcHJvY2Vzcy5lbnYuVklURV9DTE9VREZMQVJFX0hPU1QgfHwgJydcclxuICAgIGNvbnN0IGNmSG9zdCA9IHJhd0NmSG9zdCA/IFN0cmluZyhyYXdDZkhvc3QpLnJlcGxhY2UoL15odHRwcz86XFwvXFwvL2ksICcnKS5yZXBsYWNlKC9cXC8kLywgJycpIDogbnVsbFxyXG5cclxuICAgIGNvbnN0IGRpc2FibGVIbXIgPSBwcm9jZXNzLmVudi5WSVRFX0RJU0FCTEVfSE1SID09PSAnMScgfHwgcHJvY2Vzcy5lbnYuVklURV9ESVNBQkxFX0hNUiA9PT0gJ3RydWUnXHJcbiAgICBpZiAoZGlzYWJsZUhtciAmJiBjZkhvc3QpIGNvbnNvbGUud2FybignW3ZpdGVdIFZJVEVfRElTQUJMRV9ITVIgc2V0OiBITVIgZGlzYWJsZWQgZGVzcGl0ZSBjbG91ZGZsYXJlZCBob3N0JywgY2ZIb3N0KVxyXG5cclxuICAgIGNvbnN0IGhtckNvbmZpZyA9ICghZGlzYWJsZUhtciAmJiBjZkhvc3QpID8geyBwcm90b2NvbDogJ3dzcycsIGhvc3Q6IGNmSG9zdCwgcG9ydDogNDQzIH0gOiAoZGlzYWJsZUhtciA/IGZhbHNlIDogdW5kZWZpbmVkKVxyXG5cclxuICAgIC8vIE1pZGRsZXdhcmUgZm9yIGNvbXByZXNzaW9uIGFuZCBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb25cclxuICAgIGNvbnN0IG1pZGRsZXdhcmVzID0gKGFwcCkgPT4ge1xyXG4gICAgICAvLyBEeW5hbWljIG5ldHdvcmsgYWRkcmVzcyB1cGRhdGVyXHJcbiAgICAgIGFwcC51c2UoJy9yZWZyZXNoLWhvc3RzJywgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIFVwZGF0ZSBkZXYtaG9zdHMuanNvbiB3aXRoIGN1cnJlbnQgbmV0d29yayBhZGRyZXNzZXNcclxuICAgICAgICAgIGNvbnN0IG5ldHdvcmtJbnRlcmZhY2VzID0gb3MubmV0d29ya0ludGVyZmFjZXMoKVxyXG4gICAgICAgICAgY29uc3QgaG9zdHMgPSBbXVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBPYmplY3Qua2V5cyhuZXR3b3JrSW50ZXJmYWNlcykuZm9yRWFjaChpbnRlcmZhY2VOYW1lID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYWRkcmVzc2VzID0gbmV0d29ya0ludGVyZmFjZXNbaW50ZXJmYWNlTmFtZV1cclxuICAgICAgICAgICAgYWRkcmVzc2VzLmZvckVhY2goYWRkciA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKGFkZHIuZmFtaWx5ID09PSAnSVB2NCcgJiYgIWFkZHIuaW50ZXJuYWwpIHtcclxuICAgICAgICAgICAgICAgIGhvc3RzLnB1c2goYWRkci5hZGRyZXNzKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGhvc3RzLnVuc2hpZnQoJ2xvY2FsaG9zdCcpXHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnN0IHB1YmxpY0RpciA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAncHVibGljJylcclxuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwdWJsaWNEaXIpKSB7XHJcbiAgICAgICAgICAgIGZzLm1rZGlyU3luYyhwdWJsaWNEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnN0IGRldkhvc3RzRmlsZSA9IHBhdGgucmVzb2x2ZShwdWJsaWNEaXIsICdkZXYtaG9zdHMuanNvbicpXHJcbiAgICAgICAgICBjb25zdCBob3N0RGF0YSA9IHsgaG9zdHMsIHRpbWVzdGFtcDogRGF0ZS5ub3coKSB9XHJcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGRldkhvc3RzRmlsZSwgSlNPTi5zdHJpbmdpZnkoaG9zdERhdGEsIG51bGwsIDIpKVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KGhvc3REYXRhKSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdbdml0ZV0gUmVmcmVzaGVkIG5ldHdvcmsgYWRkcmVzc2VzOicsIGhvc3RzKVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwXHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IGUubWVzc2FnZSB9KSlcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIFxyXG4gICAgICAvLyBBZGQgZ3ppcCBjb21wcmVzc2lvbiBmb3IgdHVubmVsIHRyYW5zbWlzc2lvblxyXG4gICAgICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgIC8vIEFkZCBjYWNoZSBoZWFkZXJzIHRvIEpTL0NTUyBjaHVua3MgKDEgaG91ciBmb3IgZGV2KVxyXG4gICAgICAgIGlmIChyZXEudXJsLmVuZHNXaXRoKCcuanMnKSB8fCByZXEudXJsLmVuZHNXaXRoKCcuY3NzJykpIHtcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHVibGljLCBtYXgtYWdlPTM2MDAsIG11c3QtcmV2YWxpZGF0ZScpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFsd2F5cyByZXZhbGlkYXRlIEhUTUxcclxuICAgICAgICBpZiAocmVxLnVybC5lbmRzV2l0aCgnLmh0bWwnKSB8fCByZXEudXJsID09PSAnLycpIHtcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NhY2hlLUNvbnRyb2wnLCAncHVibGljLCBtYXgtYWdlPTAsIG11c3QtcmV2YWxpZGF0ZScpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5leHQoKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJhc2VDb25maWcgPSB7XHJcbiAgICAgIGhvc3QsXHJcbiAgICAgIHBvcnQsXHJcbiAgICAgIHN0cmljdFBvcnQsXHJcbiAgICAgIGFsbG93ZWRIb3N0cyxcclxuICAgICAgaG1yOiBobXJDb25maWcsXHJcbiAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgaWdub3JlZDogW1xyXG4gICAgICAgICAgJyoqLy5naXQvKionLFxyXG4gICAgICAgICAgJyoqL25vZGVfbW9kdWxlcy8qKicsXHJcbiAgICAgICAgICAnKiovZGlzdC8qKicsXHJcbiAgICAgICAgICAnKiovdG1wLyoqJyxcclxuICAgICAgICAgICcqKi91cGxvYWRzLyoqJyxcclxuICAgICAgICAgICcqKi9pbnZlbnRvcnlIUkFFSS1iYWNrLyoqJ1xyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgbWlkZGxld2FyZXMsXHJcbiAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDInLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICAgIHdzOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhUVFBTIHN1cHBvcnQgdXNpbmcgbWtjZXJ0LWdlbmVyYXRlZCBjZXJ0aWZpY2F0ZXNcclxuICAgIGNvbnN0IHVzZUh0dHBzID0gKHByb2Nlc3MuZW52LlZJVEVfVVNFX0hUVFBTID09PSAndHJ1ZScpIHx8IChwcm9jZXNzLmVudi5WSVRFX1VTRV9IVFRQUyA9PT0gJzEnKVxyXG4gICAgaWYgKHVzZUh0dHBzKSB7XHJcbiAgICAgIGNvbnN0IGNlcnRGaWxlID0gcHJvY2Vzcy5lbnYuVklURV9IVFRQU19DRVJUIHx8ICcuLy5jZXJ0cy9kZXYtY2VydC5wZW0nXHJcbiAgICAgIGNvbnN0IGtleUZpbGUgPSBwcm9jZXNzLmVudi5WSVRFX0hUVFBTX0tFWSB8fCAnLi8uY2VydHMvZGV2LWtleS5wZW0nXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY2VydCA9IGZzLnJlYWRGaWxlU3luYyhjZXJ0RmlsZSlcclxuICAgICAgICBjb25zdCBrZXkgPSBmcy5yZWFkRmlsZVN5bmMoa2V5RmlsZSlcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgLi4uYmFzZUNvbmZpZyxcclxuICAgICAgICAgIGh0dHBzOiB7XHJcbiAgICAgICAgICAgIGNlcnQsXHJcbiAgICAgICAgICAgIGtleVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUud2FybignW3ZpdGVdIENvdWxkIG5vdCByZWFkIEhUVFBTIGNlcnQva2V5LCBmYWxsaW5nIGJhY2sgdG8gaHR0cCBzZXJ2ZXI6JywgZSAmJiBlLm1lc3NhZ2UpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBEZWZhdWx0IEhUVFAgc2VydmVyXHJcbiAgICByZXR1cm4gYmFzZUNvbmZpZ1xyXG4gIH0pKClcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErWCxTQUFTLG9CQUFvQjtBQUM1WixPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sb0JBQW9CO0FBQzNCLE9BQU8sUUFBUTtBQUNmLE9BQU8sUUFBUTtBQUxmLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDO0FBQUE7QUFBQSxFQUVqQyxVQUFVLEtBQUssS0FBSyxHQUFHLE9BQU8sR0FBRyxpQ0FBaUM7QUFBQSxFQUNsRSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYywwQkFBMEIsYUFBYSxTQUFTLFFB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QUksS0FBSyxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQUEsUUFDOUM7QUFBQSxNQUNGLENBQUM7QUFHRCxVQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUztBQUUxQixZQUFJLElBQUksSUFBSSxTQUFTLEtBQUssS0FBSyxJQUFJLElBQUksU0FBUyxNQUFNLEdBQUc7QUFDdkQsY0FBSSxVQUFVLGlCQUFpQix1Q0FBdUM7QUFBQSxRQUN4RTtBQUVBLFlBQUksSUFBSSxJQUFJLFNBQVMsT0FBTyxLQUFLLElBQUksUUFBUSxLQUFLO0FBQ2hELGNBQUksVUFBVSxpQkFBaUIsb0NBQW9DO0FBQUEsUUFDckU7QUFDQSxhQUFLO0FBQUEsTUFDUCxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sYUFBYTtBQUFBLE1BQ2pCO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxLQUFLO0FBQUEsTUFDTCxPQUFPO0FBQUEsUUFDTCxTQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixJQUFJO0FBQUEsUUFDTjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBR0EsVUFBTSxXQUFZLFFBQVEsSUFBSSxtQkFBbUIsVUFBWSxRQUFRLElBQUksbUJBQW1CO0FBQzVGLFFBQUksVUFBVTtBQUNaLFlBQU0sV0FBVyxRQUFRLElBQUksbUJBQW1CO0FBQ2hELFlBQU0sVUFBVSxRQUFRLElBQUksa0JBQWtCO0FBQzlDLFVBQUk7QUFDRixjQUFNLE9BQU8sR0FBRyxhQUFhLFFBQVE7QUFDckMsY0FBTSxNQUFNLEdBQUcsYUFBYSxPQUFPO0FBQ25DLGVBQU87QUFBQSxVQUNMLEdBQUc7QUFBQSxVQUNILE9BQU87QUFBQSxZQUNMO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRixTQUFTLEdBQUc7QUFDVixnQkFBUSxLQUFLLHNFQUFzRSxLQUFLLEVBQUUsT0FBTztBQUFBLE1BQ25HO0FBQUEsSUFDRjtBQUdBLFdBQU87QUFBQSxFQUNULEVBQUc7QUFDTCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
