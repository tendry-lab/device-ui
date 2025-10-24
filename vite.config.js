/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import path from "path";
import { createBaseConfig } from "./vite.config.base.js";
export default createBaseConfig("http://192.168.1.22", {
  resolve: {
    alias: {
      "@device-ui": path.resolve(__dirname, "src"),
    },
  },
});
