/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fetcher } from "@device-ui/lib/http/fetcher";

export class TestFetcher implements Fetcher {
  constructor(private data: Record<string, any>) {}

  async fetch(): Promise<{ data: Uint8Array | null; error: Error | null }> {
    let ret: Uint8Array | null = null;
    let err: Error | null = null;

    try {
      const ret = new TextEncoder().encode(this.data);
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return {
      data: ret,
      error: err,
    };
  }
}
