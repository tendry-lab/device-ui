import path from "path";
import { createBaseConfig } from "./vite.config.base.js";
export default createBaseConfig("http://192.168.1.22", {
  resolve: {
    alias: {
      "@device-ui": path.resolve(__dirname, "src"),
    },
  },
});
