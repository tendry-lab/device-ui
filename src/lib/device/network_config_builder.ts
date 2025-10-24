/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { NetworkType } from "@device-ui/lib/device/types";
import { Config } from "@device-ui/lib/device/config";

export interface NetworkConfigBuilder {
  // Build network config.
  build(nt: NetworkType): Config | null;
}
