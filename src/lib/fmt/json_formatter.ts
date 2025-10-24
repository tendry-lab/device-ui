/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Formatter } from "@device-ui/lib/fmt/formatter";

// Format an arbitrary data into JSON.
export class JSONFormatter implements Formatter {
  format(data: Uint8Array): {
    data: Record<string, any> | null;
    error: Error | null;
  } {
    let ret: Record<string, any> | null = null;
    let err: Error | null = null;

    try {
      const text = new TextDecoder().decode(data);
      ret = JSON.parse(text);
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return { data: ret, error: err };
  }
}
