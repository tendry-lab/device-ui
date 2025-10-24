/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { HTTPFetcher } from "@device-ui/lib/http/http_fetcher";
import { HTTPOps } from "@device-ui/lib/algo/http_ops";
import { Locator } from "@device-ui/lib/device/locator";

// Control device locating over HTTP.
export class HTTPLocator implements Locator {
  constructor(private url: string) {}

  async flip(): Promise<Error | null> {
    return this.fetch(2);
  }

  async turnOn(): Promise<Error | null> {
    return this.fetch(1);
  }

  async turnOff(): Promise<Error | null> {
    return this.fetch(0);
  }

  private async fetch(arg: number): Promise<Error | null> {
    const result = HTTPOps.addQueryParams(this.url, {
      value: arg,
    });
    if (result.error) {
      return result.error;
    }

    const fetcher = new HTTPFetcher(result.url!);

    const fetchResult = await fetcher.fetch();
    if (fetchResult.error) {
      return fetchResult.error;
    }

    let err: Error | null = null;

    try {
      const text = new TextDecoder().decode(fetchResult.data!);
      if (text != "OK") {
        err = new Error(
          `http_locator: write failed, invalid response: ${text}`,
        );
      }
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return err;
  }
}
