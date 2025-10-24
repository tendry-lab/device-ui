/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { DataHolder } from "@device-ui/lib/device/data_holder";

export class TimestampHolder {
  // Initialize.
  //
  // @params
  //  - @p holder to get the device data.
  constructor(private holder: DataHolder) {}

  // Return latest timestamp from the device data.
  getTimestamp(): number {
    const data = this.holder.getData();
    if (!data) {
      return -1;
    }

    const timestamp = data["timestamp"];
    if (timestamp == undefined) {
      return -1;
    }

    return timestamp;
  }
}
