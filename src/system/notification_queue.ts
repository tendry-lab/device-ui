import { Notification } from "./notification";

export interface NotificationQueue<T> {
  // Add notification to the queue.
  add(notification: Notification<T>): Error | null;

  // Remove notification from the queue.
  remove(notification: Notification<T>): Error | null;

  // Iterate over each element in the queue.
  forEach(fn: (notification: Notification<T>) => void): void;

  // Return number of elements in a queue.
  len(): number;
}
