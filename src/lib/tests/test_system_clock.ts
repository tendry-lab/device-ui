/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemClock } from "@device-ui/lib/system/system_clock";

export class TestSystemClock implements SystemClock {
  ts: number = 0;
  error: Error | null = null;

  setTimestamp(timestamp: number): Error | null {
    if (this.error) {
      return this.error;
    }

    this.ts = timestamp;

    return null;
  }

  getTimestamp(): { timestamp: number; error: Error | null } {
    if (this.error) {
      return { timestamp: -1, error: this.error };
    }

    return { timestamp: this.ts, error: null };
  }
}
