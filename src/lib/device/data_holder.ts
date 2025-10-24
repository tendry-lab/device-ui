/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DataHolder {
  // Return the latest device data or null.
  getData(): Record<string, any> | null;
}
