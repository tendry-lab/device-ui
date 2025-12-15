/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Updater } from "@device-ui/lib/device/updater";
import { Crc32Calculator } from "@device-ui/lib/algo/crc32_calculator";
import { HTTPOps } from "@device-ui/lib/algo/http_ops";

// Update device over HTTP.
export class HTTPUpdater implements Updater {
  // Initialize.
  //
  // @params
  //  - @p crc32Calculator to calculate CRC32 checksum for the firmware.
  //  - @p url is the url for the update commands over HTTP.
  constructor(
    private crc32Calculator: Crc32Calculator,
    private url: string,
  ) {}

  // Update the device.
  async update(data: Uint8Array): Promise<Error | null> {
    let err: Error | null = null;

    const result = HTTPOps.addQueryParams(this.url, {
      total_size: data.length,
      crc32: this.crc32Calculator.calculate(data),
    });
    if (result.error) {
      return result.error;
    }

    try {
      const response = await fetch(`${result.url}`, {
        method: "POST",
        body: data as BodyInit,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        return new Error(
          `http_updater: update failed: unexpected status=${response.status}`,
        );
      }

      const bytes = await response.bytes();

      const text = new TextDecoder().decode(bytes!);
      if (text != "OK") {
        return new Error(
          `http_updater: update failed: unexpected response=${text}`,
        );
      }
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return err;
  }
}
