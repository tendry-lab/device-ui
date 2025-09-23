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
        proxyReq.removeHeader("authorization");
        proxyReq.removeHeader("cookie");
        proxyReq.removeHeader("x-forwarded-for");
        proxyReq.removeHeader("x-forwarded-proto");
        proxyReq.removeHeader("x-forwarded-host");
        proxyReq.setHeader("user-agent", "Vite-Dev-Proxy");
        proxyReq.setHeader("accept", "application/json");
      });
    },
  };
}

export function createBaseConfig(deviceIP = "", projectConfig = {}) {
  return defineConfig({
    plugins: [
      preact(),
      markdown({ mode: "html" }),
      checker({ typescript: true }),
      compression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 128,
        deleteOriginFile: true,
      }),
    ],
    server: {
      proxy: {
        "/api/v1/telemetry": createProxyConfig(deviceIP),
        "/api/v1/registration": createProxyConfig(deviceIP),
        "/api/v1/config/sensor/analog": createProxyConfig(deviceIP),
        "/api/v1/system/reboot": createProxyConfig(deviceIP),
        "/api/v1/system/locate": createProxyConfig(deviceIP),
        "/api/v1/system/time": createProxyConfig(deviceIP),
        "/api/v1/config/wifi/sta": createProxyConfig(deviceIP),
        "/api/v1/config/wifi/ap": createProxyConfig(deviceIP),
        "/api/v1/config/mdns": createProxyConfig(deviceIP),
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
    ...projectConfig,
  });
}
