import path from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/lib/tests/main.ts"],
    watch: false,
  },
  resolve: {
    alias: {
      "@device-ui": path.resolve(__dirname, "src"),
    },
  },
});
