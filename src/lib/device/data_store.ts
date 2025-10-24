/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { ArrayQueue } from "@device-ui/lib/core/array_queue";
import { Formatter } from "@device-ui/lib/fmt/formatter";
import { FetchHandler } from "@device-ui/lib/http/fetch_handler";
import { DataHolder } from "@device-ui/lib/device/data_holder";

// Format received data to key-value pairs.
export class DataStore
  extends ArrayQueue<ObjectMonitor>
  implements FetchHandler, DataHolder
{
  // Initialize.
  //
  // @params
  //  - @p formatter to format fetched data.
  constructor(private formatter: Formatter) {
    super();
  }

  // Return formated key-value data.
  getData(): Record<string, any> | null {
    return this.data;
  }

  // Notify registered object monitors about new data.
  handleFetched(data: Uint8Array): void {
    const result = this.formatter.format(data);
    if (result.error) {
      console.error(`data_store: failed to format data: err=${result.error}`);

      return;
    }

    this.data = result.data;

    this.forEach((monitor) => {
      monitor.notifyChanged();
    });
  }

  private data: Record<string, any> | null = null;
}
