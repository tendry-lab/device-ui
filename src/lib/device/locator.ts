/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Locator {
  // Flip device locating.
  flip(): Promise<Error | null>;

  // Enable device locating.
  turnOn(): Promise<Error | null>;

  // Disable device locating.
  turnOff(): Promise<Error | null>;
}
