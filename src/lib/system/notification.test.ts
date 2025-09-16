import { describe, test, expect } from "vitest";

import {
  NotificationSeverity,
  NotificationModality,
  Notification,
} from "@device-ui/lib/system/notification";

describe("Notification", () => {
  test("Resolve notification multiple times", async () => {
    let callCount: number = 0;

    const n = new Notification<number>(
      0,
      "a",
      NotificationSeverity.Inf,
      NotificationModality.NonModal,
      () => {
        callCount++;

        return null;
      },
    );

    expect(n.resolve(10)).toBeNull();
    expect(await n.promise).toBe(10);

    expect(n.resolve(42)).toBeNull();
    expect(await n.promise).toBe(10);

    expect(callCount).toBe(1);
  });
  test("Keep last resolve error", async () => {
    const n = new Notification<number>(
      0,
      "a",
      NotificationSeverity.Inf,
      NotificationModality.NonModal,
      () => {
        return new Error("invalid state");
      },
    );

    expect(n.resolve(10)).not.toBeNull();
    expect(n.resolve(42)).not.toBeNull();

    await expect(n.promise).rejects.toThrow("invalid state");
  });
});
