/*
 * SPDX-FileCopyrightText: 2026 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Updater } from "@device-ui/lib/device/updater";

export class FanoutUpdater implements Updater {
  // Fanout FW data to the underlying updaters.
  async update(data: Uint8Array): Promise<Error | null> {
    for (const updater of this.updaters) {
      const error = await updater.update(data);
      if (error) {
        return error;
      }
    }

    return null;
  }

  // Add updater to be called when the FW update is happened.
  add(updater: Updater) {
    this.updaters.push(updater);
  }

  private updaters: Updater[] = [];
}
