import { render } from "@testing-library/preact";

import { describe, test, expect } from "vitest";

import { DataStore } from "@device-ui/lib/device/data_store";
import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";

import { NetworkStatusComponent } from "@device-ui/ui/preact/network_status_component";

describe("Network Status Component", () => {
  test("Queue state management on mount/unmount", async () => {
    const registrationStore = new DataStore(new JSONFormatter());
    expect(registrationStore.len()).toBe(0);

    const { unmount } = render(
      <NetworkStatusComponent registrationStore={registrationStore} />,
    );

    expect(registrationStore.len()).toBe(1);
    unmount();
    expect(registrationStore.len()).toBe(0);
  });
});
