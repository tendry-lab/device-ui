/*
 * SPDX-FileCopyrightText: 2026 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, test, expect } from "vitest";

import { Updater } from "@device-ui/lib/device/updater";
import { RetryUpdater } from "@device-ui/lib/device/retry_updater";

class TestUpdater implements Updater {
  constructor(
    private error: Error | null,
    private errorRetryCount: number = -1,
  ) {}

  async update(data: Uint8Array): Promise<Error | null> {
    const error: Error | null = this.error;

    if (this.errorRetryCount > 0) {
      this.errorRetryCount--;
    }
    if (!this.errorRetryCount) {
      this.error = null;
    }

    return error;
  }
}

describe("Retry Updater", () => {
  test("Faile to update with retries", async () => {
    const updateError: Error = new Error("unable to update");
    const retryCount: number = 3;

    const testUpdater: TestUpdater = new TestUpdater(updateError, retryCount);
    const retryUpdater: Updater = new RetryUpdater(testUpdater, retryCount);

    expect(await retryUpdater.update(new Uint8Array([1, 2, 3, 4, 5]))).toEqual(
      updateError,
    );
  });
  test("Successfully update after retries", async () => {
    const updateError: Error = new Error("unable to update");
    const retryCount: number = 3;

    const testUpdater: TestUpdater = new TestUpdater(
      updateError,
      retryCount - 1,
    );
    const retryUpdater: Updater = new RetryUpdater(testUpdater, retryCount);

    expect(
      await retryUpdater.update(new Uint8Array([1, 2, 3, 4, 5])),
    ).toBeNull();
  });
});
