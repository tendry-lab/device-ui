/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// Fetcher fetches the data from the arbitrary source.
export interface Fetcher {
  fetch(): Promise<{ data: Uint8Array | null; error: Error | null }>;
}
