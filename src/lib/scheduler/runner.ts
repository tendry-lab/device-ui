/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Runner {
  // Run executes a single operational loop.
  run(): Promise<Error | null>;
}
