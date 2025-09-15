import { render } from "@testing-library/preact";

import { describe, test, expect } from "vitest";

import { AnalogSensorComponent } from "./analog_sensor_component";

import { DefaultNotificator } from "../../../../lib/system/default_notificator";
import { PeriodicDataFetcher } from "../../../../lib/device/periodic_data_fetcher";
import { JSONFormatter } from "../../../../lib/fmt/json_formatter";
import { Fetcher } from "../../../../lib/http/fetcher";

import { TestFetcher } from "../../../../lib/tests/test_fetcher";
import { TestConfig } from "../../../../lib/tests/test_config";

describe("Analog Soil Sensor Component", () => {
  test("Queue state management on mount/unmount", async () => {
    const notificator = new DefaultNotificator();
    const fetcher = new TestFetcher({
      foo: 1,
    });
    const config = new TestConfig({
      foo: 1,
    });
    const formatter = new JSONFormatter();
    const fetchInterval = 100;

    const periodicFetcher = new PeriodicDataFetcher(
      fetcher,
      formatter,
      fetchInterval,
    );
    expect(periodicFetcher.len()).toBe(0);

    const { unmount } = render(
      <AnalogSensorComponent
        prefix="test_prefix"
        fetcher={periodicFetcher}
        config={config}
        notificator={notificator}
      />,
    );

    expect(periodicFetcher.len()).toBe(1);
    unmount();
    expect(periodicFetcher.len()).toBe(0);
  });
});
