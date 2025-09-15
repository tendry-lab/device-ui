import { ObjectMonitor } from "./object_monitor";

export class StateMonitor<T> {
  // Initialize.
  constructor(value: T) {
    this.value = value;
  }

  // Set monitor to be notified when the state is changed.
  setMonitor(monitor: ObjectMonitor | null) {
    this.monitor = monitor;
  }

  // Update the state and notify the monitor (if set).
  set(value: T) {
    this.value = value;

    if (this.monitor) {
      this.monitor.notifyChanged();
    }
  }

  // Return the latest state value.
  get(): T {
    return this.value;
  }

  private value: T;
  private monitor: ObjectMonitor | null = null;
}
