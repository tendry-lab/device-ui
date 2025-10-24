/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// Arbitrary key-value configuration.
export interface Config {
  // Read key-value configuration.
  read(): Promise<{ data: Record<string, any> | null; error: Error | null }>;

  // Write key-value configuration.
  write(data: Record<string, any>): Promise<Error | null>;

  // Reset config to its default state.
  reset(): Promise<Error | null>;
}
