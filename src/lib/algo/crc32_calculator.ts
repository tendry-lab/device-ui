/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Crc32Calculator {
  // Calculate CRC32 checksum.
  calculate(data: Uint8Array): number;
}
