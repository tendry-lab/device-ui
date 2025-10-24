/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from "@testing-library/preact";

import { describe, test, expect } from "vitest";

import { AnalogSensorComponent } from "@device-ui/ui/preact/sensor/soil/analog_sensor_component";

import { DefaultNotificator } from "@device-ui/lib/system/default_notificator";
import { DataStore } from "@device-ui/lib/device/data_store";
import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";
import { Fetcher } from "@device-ui/lib/http/fetcher";

import { TestFetcher } from "@device-ui/lib/tests/test_fetcher";
import { TestConfig } from "@device-ui/lib/tests/test_config";

describe("Analog Soil Sensor Component", () => {
  test("Queue state management on mount/unmount", async () => {
    const notificator = new DefaultNotificator();
    const config = new TestConfig({
      foo: 1,
    });
    const store = new DataStore(new JSONFormatter());
    expect(store.len()).toBe(0);

    const { unmount } = render(
      <AnalogSensorComponent
        prefix="test_prefix"
        store={store}
        config={config}
        notificator={notificator}
      />,
    );

    expect(store.len()).toBe(1);
    unmount();
    expect(store.len()).toBe(0);
  });
});
