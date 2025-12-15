/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// Firmware updater.
export interface Updater {
  // Update the device.
  update(data: Uint8Array): Promise<Error | null>;
}
