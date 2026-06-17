/*
 * SPDX-FileCopyrightText: 2026 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Updater } from "@device-ui/lib/device/updater";

export class RetryUpdater implements Updater {
  // Initialize.
  //
  // @params
  //  - @p updater to handle the actual update process.
  //  - @p retryCount - number of times to retry update process in case of error.
  constructor(
    private updater: Updater,
    private retryCount: number,
  ) {}

  // Update with retries.
  async update(data: Uint8Array) {
    let error: Error | null = null;

    for (let n: number = 0; n < this.retryCount; n++) {
      error = await this.updater.update(data);
      if (!error) {
        break;
      }
    }

    return error;
  }
}
