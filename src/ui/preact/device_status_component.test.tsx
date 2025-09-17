import { render } from "@testing-library/preact";

import { describe, test, expect } from "vitest";

import { PeriodicDataFetcher } from "@device-ui/lib/device/periodic_data_fetcher";
import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";
import { Fetcher } from "@device-ui/lib/http/fetcher";
import { TestFetcher } from "@device-ui/lib/tests/test_fetcher";
import { FanoutConnectionHandler } from "@device-ui/lib/device/fanout_connection_handler";

import { DeviceStatusComponent } from "@device-ui/ui/preact/device_status_component";

describe("Device Status Component", () => {
  test("Queue state management on mount/unmount", async () => {
    const telemetryFetcher = new TestFetcher({
      foo: 1,
    });
    const telemetryFormatter = new JSONFormatter();
    const telemetryFetchInterval = 100;

    const telemetryPeriodicFetcher = new PeriodicDataFetcher(
      telemetryFetcher,
      telemetryFormatter,
      telemetryFetchInterval,
    );
    expect(telemetryPeriodicFetcher.len()).toBe(0);

    const registrationFetcher = new TestFetcher({
      foo: 1,
    });
    const registrationFormatter = new JSONFormatter();
    const registrationFetchInterval = 100;

    const registrationPeriodicFetcher = new PeriodicDataFetcher(
      registrationFetcher,
      registrationFormatter,
      registrationFetchInterval,
    );
    expect(registrationPeriodicFetcher.len()).toBe(0);

    const connectionHandler = new FanoutConnectionHandler();
    expect(connectionHandler.len()).toBe(0);

    const { unmount } = render(
      <DeviceStatusComponent
        telemetryFetcher={telemetryPeriodicFetcher}
        registrationFetcher={registrationPeriodicFetcher}
        connectionHandler={connectionHandler}
      />,
    );

    expect(telemetryPeriodicFetcher.len()).toBe(1);
    expect(registrationPeriodicFetcher.len()).toBe(1);
    expect(connectionHandler.len()).toBe(1);
    unmount();
    expect(telemetryPeriodicFetcher.len()).toBe(0);
    expect(registrationPeriodicFetcher.len()).toBe(0);
    expect(connectionHandler.len()).toBe(0);
  });
});
