import { NotificationQueue } from "@device-ui/lib/system/notification_types";
import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { Notification } from "@device-ui/lib/system/notification";

export class MonitorNotificationQueue<T> implements NotificationQueue<T> {
  // Initialize.
  //
  // @params
  //  - @p queue to add/remove notifications.
  constructor(queue: NotificationQueue<T>) {
    this.queue = queue;
  }

  // Add element to the queue and notify the monitor (if set).
  add(notification: Notification<T>): Error | null {
    const error = this.queue.add(notification);
    if (error) {
      return error;
    }

    if (this.monitor) {
      this.monitor.notifyChanged();
    }

    return null;
  }

  // Remove element from the queue and notify the monitor (if set).
  remove(notification: Notification<T>): Error | null {
    const error = this.queue.remove(notification);
    if (error) {
      return error;
    }

    if (this.monitor) {
      this.monitor.notifyChanged();
    }

    return null;
  }

  // Iterate over each element in the queue.
  forEach(fn: (notification: Notification<T>) => void): void {
    this.queue.forEach(fn);
  }

  // Return number of elements in the queue.
  len(): number {
    return this.queue.len();
  }

  // Set a monitor to be notified when a notification is added to the queue (or removed).
  setMonitor(monitor: ObjectMonitor | null) {
    this.monitor = monitor;
  }

  private queue: NotificationQueue<T>;
  private monitor: ObjectMonitor | null = null;
}
