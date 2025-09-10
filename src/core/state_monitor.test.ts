import { describe, test, expect } from "vitest";

import { StateMonitor } from "./state_monitor";
import { ObjectMonitor } from "./object_monitor";

class testObjectMonitor implements ObjectMonitor {
  callCount: number = 0;

  notifyChanged(): void {
    this.callCount++;
  }
}

describe("State Monitor", () => {
  test("Initialize with value", () => {
    const monitor = new StateMonitor<number>(42);
    expect(monitor.get()).toBe(42);
  });

  test("Set and get value", () => {
    const monitor = new StateMonitor<string>("initial");
    monitor.set("updated");
    expect(monitor.get()).toBe("updated");
  });

  test("Set value without monitor", () => {
    const monitor = new StateMonitor<boolean>(false);
    monitor.set(true);
    expect(monitor.get()).toBe(true);
  });

  test("Set monitor and notify on value change", () => {
    const testMonitor = new testObjectMonitor();
    const stateMonitor = new StateMonitor<number>(0);

    stateMonitor.setMonitor(testMonitor);
    expect(testMonitor.callCount).toBe(0);

    stateMonitor.set(10);
    expect(testMonitor.callCount).toBe(1);
    expect(stateMonitor.get()).toBe(10);
  });

  test("Set multiple times", () => {
    const testMonitor = new testObjectMonitor();
    const stateMonitor = new StateMonitor<string>("start");

    stateMonitor.setMonitor(testMonitor);
    stateMonitor.set("first");
    stateMonitor.set("second");

    expect(testMonitor.callCount).toBe(2);
    expect(stateMonitor.get()).toBe("second");
  });

  test("Reset monitor", () => {
    const testMonitor = new testObjectMonitor();
    const stateMonitor = new StateMonitor<number>(5);

    stateMonitor.setMonitor(testMonitor);
    stateMonitor.set(10);
    expect(testMonitor.callCount).toBe(1);

    stateMonitor.setMonitor(null);
    stateMonitor.set(15);
    expect(testMonitor.callCount).toBe(1);
    expect(stateMonitor.get()).toBe(15);
  });
});
