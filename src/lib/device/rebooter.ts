/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Rebooter {
  // Reboot the device.
  reboot(): Promise<Error | null>;
}
