import { describe, test, expect } from "vitest";

import { FieldFormatter } from "@device-ui/lib/fmt/field_formatter";

describe("Field Formatter", () => {
  test("Format empty data", () => {
    const data = new TextEncoder().encode("");
    const f = new FieldFormatter("timestamp");

    const result = f.format(data);
    expect(result.data).not.toBeNull();
    expect(result.data).toEqual({ timestamp: "" });
    expect(result.error).toBeNull();
  });

  test("Format text data", () => {
    const data = new TextEncoder().encode("1733233869");
    const f = new FieldFormatter("timestamp");

    const result = f.format(data);
    expect(result.data).not.toBeNull();
    expect(result.data).toEqual({ timestamp: "1733233869" });
    expect(result.error).toBeNull();
  });

  test("Format with different key name", () => {
    const data = new TextEncoder().encode("OK");
    const f = new FieldFormatter("status");

    const result = f.format(data);
    expect(result.data).toEqual({ status: "OK" });
    expect(result.error).toBeNull();
  });

  test("Format binary data", () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]);
    const f = new FieldFormatter("message");

    const result = f.format(data);
    expect(result.data).toEqual({ message: "Hello" });
    expect(result.error).toBeNull();
  });
});
