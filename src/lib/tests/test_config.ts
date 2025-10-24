/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from "@device-ui/lib/device/config";

export class TestConfig implements Config {
  constructor(private readonly defaults: Record<string, any>) {}

  async read(): Promise<{
    data: Record<string, any> | null;
    error: Error | null;
  }> {
    if (this.error) {
      return {
        data: null,
        error: this.error,
      };
    }

    return {
      data: this.data,
      error: null,
    };
  }

  async write(data: Record<string, any>): Promise<Error | null> {
    if (this.error) {
      return this.error;
    }

    this.data = data;

    return null;
  }

  async reset(): Promise<Error | null> {
    if (this.error) {
      return this.error;
    }

    this.data = this.defaults;

    return null;
  }

  private data: Record<string, any>;
}
