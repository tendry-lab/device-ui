/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Crc32Calculator } from "@device-ui/lib/algo/crc32_calculator";

//! Little endian CRC32 calculator.
export class LeCrc32Calculator implements Crc32Calculator {
  // Calculate CRC32 for the data.
  calculate(data: Uint8Array): number {
    let crc = 0xffffffff;

    for (let i = 0; i < data.length; i++) {
      crc ^= data[i]!;
      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      }
    }

    return (crc ^ 0xffffffff) >>> 0;
  }
}
