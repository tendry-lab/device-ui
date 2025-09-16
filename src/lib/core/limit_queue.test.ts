import { describe, test, expect } from "vitest";

import { LimitQueue } from "@device-ui/lib/core/limit_queue";
import { ArrayQueue } from "@device-ui/lib/core/array_queue";

describe("Limit Queue", () => {
  test("Invalid max size", () => {
    expect(() => new LimitQueue<number>(new ArrayQueue(), 0)).toThrow(
      "queue size should be >0",
    );
    expect(() => new LimitQueue<number>(new ArrayQueue(), -1)).toThrow(
      "queue size should be >0",
    );
  });
  test("Add-Remove", () => {
    const q = new LimitQueue<number>(new ArrayQueue(), 1);
    expect(q.add(42)).toBeNull();
    expect(q.len()).toBe(1);

    expect(q.remove(1)).not.toBeNull();
    expect(q.len()).toBe(1);

    expect(q.remove(42)).toBeNull();
    expect(q.len()).toBe(0);
  });
});
