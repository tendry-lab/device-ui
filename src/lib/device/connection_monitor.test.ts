import { describe, test, expect } from "vitest";

import { ConnectionMonitor } from "@device-ui/lib/device/connection_monitor";
import { ConnectionHandler } from "@device-ui/lib/device/connection_handler";
import { DataHolder } from "@device-ui/lib/device/data_holder";
import { TimestampHolder } from "@device-ui/lib/device/timestamp_holder";
import { TestSystemClock } from "@device-ui/lib/tests/test_system_clock";

class TestHandler implements ConnectionHandler {
  handleConnected() {
    this.connectedCallCount++;
    this.connected = true;
  }

  handleDisconnected() {
    this.disconnectedCallCount++;
    this.connected = false;
  }

  connected: boolean = false;
  connectedCallCount: number = 0;
  disconnectedCallCount: number = 0;
}

class TestHolder implements DataHolder {
  getData(): Record<string, any> | null {
    return {
      timestamp: this.timestamp,
    };
  }

  timestamp: number = -1;
}

describe("Connection Monitor", () => {
  test("Receive invalid timestamp on initialization", async () => {
    const threshold: number = 10;

    const handler = new TestHandler();
    const holder = new TestHolder();
    const clock = new TestSystemClock();

    const monitor = new ConnectionMonitor(
      clock,
      handler,
      new TimestampHolder(holder),
      threshold,
    );

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    expect(await monitor.run()).toBeNull();

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);
  });
  test("Handle connect-disconnect", async () => {
    const threshold: number = 10;

    const handler = new TestHandler();
    const holder = new TestHolder();
    const clock = new TestSystemClock();

    const monitor = new ConnectionMonitor(
      clock,
      handler,
      new TimestampHolder(holder),
      threshold,
    );

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    const now: number = 12345678;

    // Prepare for the connection process.
    holder.timestamp = now;
    clock.ts = now;
    monitor.notifyChanged();

    expect(await monitor.run()).toBeNull();
    expect(await monitor.run()).toBeNull();
    expect(await monitor.run()).toBeNull();

    expect(handler.connected).toBe(true);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(0);

    // Prepare for the disconnection process.
    clock.ts += threshold - 1;
    expect(await monitor.run()).toBeNull();
    expect(handler.connected).toBe(true);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(0);

    // Begin the disconnection process.
    clock.ts += 1;
    expect(await monitor.run()).toBeNull();
    expect(await monitor.run()).toBeNull();
    expect(await monitor.run()).toBeNull();
    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(1);
  });
  test("Disconnected after receiving invalid timestamp", async () => {
    const threshold: number = 10;

    const handler = new TestHandler();
    const holder = new TestHolder();
    const clock = new TestSystemClock();

    const monitor = new ConnectionMonitor(
      clock,
      handler,
      new TimestampHolder(holder),
      threshold,
    );

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    const now: number = 12345678;

    // Prepare for the connection process.
    holder.timestamp = now;
    clock.ts = now;
    monitor.notifyChanged();

    expect(await monitor.run()).toBeNull();

    expect(handler.connected).toBe(true);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(0);

    // Begin the disconnection process.
    holder.timestamp = -1;
    expect(await monitor.run()).toBeNull();
    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(1);
  });
  test("Update connection status immideately on data update", () => {
    const threshold: number = 10;

    const handler = new TestHandler();
    const holder = new TestHolder();
    const clock = new TestSystemClock();

    const monitor = new ConnectionMonitor(
      clock,
      handler,
      new TimestampHolder(holder),
      threshold,
    );

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    const now: number = 12345678;

    // Prepare for the connection process.
    holder.timestamp = now;
    clock.ts = now;

    monitor.notifyChanged();

    expect(handler.connected).toBe(true);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(0);
  });
  test("Ignore connection status updates on clock error", async () => {
    const threshold: number = 10;

    const handler = new TestHandler();
    const holder = new TestHolder();
    const clock = new TestSystemClock();

    const monitor = new ConnectionMonitor(
      clock,
      handler,
      new TimestampHolder(holder),
      threshold,
    );

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    const now: number = 12345678;

    // Prepare for the connection process.
    holder.timestamp = now;
    clock.ts = now;
    clock.error = new Error("invalid timestamp");

    monitor.notifyChanged();

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    expect(await monitor.run()).toStrictEqual(new Error("invalid timestamp"));

    clock.error = null;
  });
  test("Ignore connection status updates when there is no data update timestamp", async () => {
    const threshold: number = 10;

    const handler = new TestHandler();
    const holder = new TestHolder();
    const clock = new TestSystemClock();

    const monitor = new ConnectionMonitor(
      clock,
      handler,
      new TimestampHolder(holder),
      threshold,
    );

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    const now: number = 12345678;

    // Prepare for the connection process.
    holder.timestamp = now;
    clock.ts = now;
    clock.error = new Error("invalid timestamp");

    monitor.notifyChanged();

    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    expect(await monitor.run()).toStrictEqual(new Error("invalid timestamp"));

    clock.error = null;

    expect(await monitor.run()).toBeNull();
    expect(handler.connected).toBe(false);
    expect(handler.connectedCallCount).toBe(0);
    expect(handler.disconnectedCallCount).toBe(0);

    monitor.notifyChanged();

    expect(handler.connected).toBe(true);
    expect(handler.connectedCallCount).toBe(1);
    expect(handler.disconnectedCallCount).toBe(0);
  });
});
