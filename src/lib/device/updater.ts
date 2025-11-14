/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// Update device over the OTA.
export interface Updater {
  // Return error if @p data with firmware is invalid.
  verify(data: Uint8Array): Error | null;

  // Begin OTA process.
  begin(): Promise<Error | null>;

  // Write data to the device.
  write(data: Uint8Array): Promise<Error | null>;

  // End OTA process.
  end(): Promise<Error | null>;

  // Cancel OTA process.
  cancel(): Promise<Error | null>;
}
