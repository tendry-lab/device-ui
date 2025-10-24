/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from "@testing-library/preact";

import { describe, test, expect } from "vitest";

import { DataStore } from "@device-ui/lib/device/data_store";
import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";
import { Fetcher } from "@device-ui/lib/http/fetcher";
import { TestFetcher } from "@device-ui/lib/tests/test_fetcher";
import { FanoutConnectionHandler } from "@device-ui/lib/device/fanout_connection_handler";

import { SystemStatusComponent } from "@device-ui/ui/preact/system_status_component";

describe("System Status Component", () => {
  test("Queue state management on mount/unmount", async () => {
    const telemetryStore = new DataStore(new JSONFormatter());
    expect(telemetryStore.len()).toBe(0);

    const registrationStore = new DataStore(new JSONFormatter());
    expect(registrationStore.len()).toBe(0);

    const connectionHandler = new FanoutConnectionHandler();
    expect(connectionHandler.len()).toBe(0);

    const { unmount } = render(
      <SystemStatusComponent
        telemetryStore={telemetryStore}
        registrationStore={registrationStore}
        connectionHandler={connectionHandler}
      />,
    );

    expect(telemetryStore.len()).toBe(1);
    expect(registrationStore.len()).toBe(1);
    expect(connectionHandler.len()).toBe(1);
    unmount();
    expect(telemetryStore.len()).toBe(0);
    expect(registrationStore.len()).toBe(0);
    expect(connectionHandler.len()).toBe(0);
  });
});
