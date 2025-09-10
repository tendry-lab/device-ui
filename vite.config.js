import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import compression from "vite-plugin-compression";
import checker from "vite-plugin-checker";
import { plugin as markdown } from "vite-plugin-markdown";

function createProxyConfig(target) {
  return {
    target,
    changeOrigin: true,
    configure: (proxy, options) => {
      proxy.on("proxyReq", (proxyReq) => {
        // Remove headers that can accumulate and cause
        // 431 status (Request Header Fields Too Large)
        proxyReq.removeHeader("authorization");
        proxyReq.removeHeader("cookie");
        proxyReq.removeHeader("x-forwarded-for");
        proxyReq.removeHeader("x-forwarded-proto");
        proxyReq.removeHeader("x-forwarded-host");
        // Keep only essential headers
        proxyReq.setHeader("user-agent", "Vite-Dev-Proxy");
        proxyReq.setHeader("accept", "application/json");
      });
    },
  };
}

export default defineConfig({
  plugins: [
    preact(),
    markdown({
      mode: "html",
    }),
    checker({ typescript: true }),
    compression({
      // Options: gzip, brotliCompress
      algorithm: "gzip",
      // File extension for compressed files
      ext: ".gz",
      // Minimum size in bytes to compress
      threshold: 128,
      deleteOriginFile: true,
    }),
  ],
  server: {
    proxy: {
      "/api/v1/telemetry": createProxyConfig("http://192.168.1.22"),
      "/api/v1/registration": createProxyConfig("http://192.168.1.22"),
      "/api/v1/config/sensor/analog": createProxyConfig("http://192.168.1.22"),
      "/api/v1/system/reboot": createProxyConfig("http://192.168.1.22"),
      "/api/v1/system/locate": createProxyConfig("http://192.168.1.22"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
