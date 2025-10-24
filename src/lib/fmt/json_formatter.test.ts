/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, test, expect } from "vitest";

import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";
import { Formatter } from "@device-ui/lib/fmt/formatter";

describe("JSONFormatter module", () => {
  test("format empty", () => {
    const data = new TextEncoder().encode("");
    const f = new JSONFormatter();

    const result = f.format(data);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  test("format invalid JSON", () => {
    const data = new TextEncoder().encode("Hello World!");
    const f = new JSONFormatter();

    const result = f.format(data);
    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  test("format valid JSON", () => {
    const data = new TextEncoder().encode(`{"foo":"bar","baz":1}`);
    const f = new JSONFormatter();

    const result = f.format(data);
    expect(result.data).not.toBeNull();
    expect(result.data).toEqual({ foo: "bar", baz: 1 });
    expect(result.error).toBeNull();
  });

  test("format JSON with nested objects", () => {
    const data = new TextEncoder().encode(`{"nested":{"value":true}}`);
    const f = new JSONFormatter();

    const result = f.format(data);
    expect(result.data).toEqual({ nested: { value: true } });
  });
});
