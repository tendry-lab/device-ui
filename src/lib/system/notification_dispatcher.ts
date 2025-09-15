import {
  Notificator,
  NotificationResult,
  AlertResult,
  ConfirmResult,
} from "./notificator";

import {
  AlertNotificationQueue,
  ConfirmNotificationQueue,
  NotificationQueue,
  AlertType,
  ConfirmType,
} from "./notification_types";

import {
  NotificationModality,
  NotificationSeverity,
  Notification,
} from "./notification";

import { SystemClock } from "./system_clock";

export type NotificationDispatcherOpts = {
  // Modal or non-modal notification.
  modality: NotificationModality;

  // Notification timeout, in milliseconds.
  timeout: number;
};

export class NotificationDispatcher implements Notificator {
  constructor(
    private systemClock: SystemClock,
    private alertQueue: AlertNotificationQueue,
    private confirmQueue: ConfirmNotificationQueue,
    private alertOpts: NotificationDispatcherOpts,
    private confirmOpts: NotificationDispatcherOpts,
  ) {}

  // Enqueue alert notification.
  alert(message: string, severity: NotificationSeverity): AlertResult {
    return this.enqueue<AlertType>(
      this.alertQueue,
      this.alertOpts,
      message,
      severity,
      undefined,
    );
  }

  // Enqueue confirm notification.
  confirm(message: string, severity: NotificationSeverity): ConfirmResult {
    return this.enqueue<ConfirmType>(
      this.confirmQueue,
      this.confirmOpts,
      message,
      severity,
      false,
    );
  }

  private enqueue<T>(
    queue: NotificationQueue<T>,
    opts: NotificationDispatcherOpts,
    message: string,
    severity: NotificationSeverity,
    resolveValue: T,
  ): NotificationResult<T> {
    if (opts.timeout < 0) {
      throw new Error("timeout should be >=0");
    }

    const notification: Notification<T> = new Notification<T>(
      this.getTimestamp(),
      message,
      severity,
      opts.modality,
      (n) => {
        return queue.remove(notification);
      },
    );

    const error = queue.add(notification);
    if (error) {
      return {
        promise: null,
        error: error,
      };
    }

    if (opts.timeout) {
      setTimeout(() => {
        const error = notification.resolve(resolveValue);
        if (error) {
          console.error(
            `notification_dispatcher: failed to resolve notification on timeout: ${error}`,
          );
        }
      }, opts.timeout);
    }

    return {
      promise: notification.promise,
      error: null,
    };
  }

  private getTimestamp(): number {
    let timestamp: number = 0;

    const result = this.systemClock.getTimestamp();
    if (result.error) {
      console.log(
        `notification_dispatcher: failed to get UNIX timestamp: ${result.error}`,
      );
    } else {
      timestamp = result.timestamp;
    }

    return timestamp;
  }
}
