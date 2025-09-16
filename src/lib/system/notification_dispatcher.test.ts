import { describe, test, expect } from "vitest";

import { NotificationDispatcher } from "@device-ui/lib/system/notification_dispatcher";
import { MonitorNotificationQueue } from "@device-ui/lib/system/monitor_notification_queue";

import {
  AlertArrayQueue,
  ConfirmArrayQueue,
  AlertLimitNotificationQueue,
  ConfirmLimitNotificationQueue,
  AlertType,
  ConfirmType,
} from "./notification_types";

import {
  NotificationModality,
  NotificationSeverity,
  Notification,
} from "./notification";

import { SystemClock } from "./system_clock";
import { ObjectMonitor } from "../core/object_monitor";

import { TestSystemClock } from "./../tests/test_system_clock";

class testObjectMonitor implements ObjectMonitor {
  callCount: number = 0;

  notifyChanged(): void {
    this.callCount++;
  }
}

describe("Notification Dispatcher", () => {
  test("Non-modal alert without timeout", async () => {
    const timestamp = 12345678;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const alertResult = dispatcher.alert(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(alertResult.error).toBeNull();
    expect(alertResult.promise).not.toBeNull();

    expect(alertQueue.len()).toBe(1);

    let alertNotifications: Notification<AlertType>[] = [];

    alertQueue.forEach((n) => {
      alertNotifications.push(n);
    });

    expect(alertQueue.len()).toBe(1);
    expect(alertNotifications.length).toBe(1);

    const notification = alertNotifications[0];

    expect(notification).not.toBeNull();
    expect(notification.timestamp).toBe(timestamp);
    expect(notification.message).toBe("Hello World");
    expect(notification.severity).toBe(NotificationSeverity.Inf);
    expect(notification.modality).toBe(NotificationModality.NonModal);

    expect(monitor.callCount).toBe(1);

    // Should be resolved manually, since timeout wasn't set.
    notification.resolve();

    await alertResult.promise;

    expect(alertQueue.len()).toBe(0);

    expect(monitor.callCount).toBe(2);
  });
  test("Non-modal confirmation without timeout", async () => {
    const timestamp = 12345678;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );

    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 2;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const result1 = dispatcher.confirm(
      "Hello World 1",
      NotificationSeverity.Inf,
    );
    const result2 = dispatcher.confirm(
      "Hello World 2",
      NotificationSeverity.Err,
    );
    expect(result1.error).toBeNull();
    expect(result1.promise).not.toBeNull();
    expect(result2.error).toBeNull();
    expect(result2.promise).not.toBeNull();

    expect(confirmQueue.len()).toBe(2);

    let confirmNotifications: Notification<ConfirmType>[] = [];

    confirmQueue.forEach((n) => {
      confirmNotifications.push(n);
    });

    expect(confirmQueue.len()).toBe(2);
    expect(confirmNotifications.length).toBe(2);

    const notification1 = confirmNotifications[0];
    const notification2 = confirmNotifications[1];

    expect(notification1).not.toBeNull();
    expect(notification1.timestamp).toBe(timestamp);
    expect(notification1.message).toBe("Hello World 1");
    expect(notification1.severity).toBe(NotificationSeverity.Inf);
    expect(notification1.modality).toBe(NotificationModality.NonModal);

    expect(notification2).not.toBeNull();
    expect(notification2.timestamp).toBe(timestamp);
    expect(notification2.message).toBe("Hello World 2");
    expect(notification2.severity).toBe(NotificationSeverity.Err);
    expect(notification2.modality).toBe(NotificationModality.NonModal);

    expect(monitor.callCount).toBe(2);

    // Should be resolved manually, since timeout wasn't set.
    notification1.resolve(true);
    notification2.resolve(false);

    expect(await result1.promise).toBe(true);
    expect(await result2.promise).toBe(false);

    expect(confirmQueue.len()).toBe(0);

    expect(monitor.callCount).toBe(4);
  });
  test("Non-modal alert and confirmation without timeout", async () => {
    const timestamp = 12345678;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const alertResult = dispatcher.alert("alert", NotificationSeverity.Inf);
    expect(alertResult.error).toBeNull();
    expect(alertResult.promise).not.toBeNull();

    const confirmResult = dispatcher.confirm(
      "confirm",
      NotificationSeverity.Err,
    );
    expect(confirmResult.error).toBeNull();
    expect(confirmResult.promise).not.toBeNull();

    expect(alertQueue.len()).toBe(1);
    expect(confirmQueue.len()).toBe(1);

    let alertNotifications: Notification<AlertType>[] = [];

    alertQueue.forEach((n) => {
      alertNotifications.push(n);
    });

    expect(alertQueue.len()).toBe(1);
    expect(alertNotifications.length).toBe(1);

    const alertNotification = alertNotifications[0];

    expect(alertNotification).not.toBeNull();
    expect(alertNotification.timestamp).toBe(timestamp);
    expect(alertNotification.message).toBe("alert");
    expect(alertNotification.severity).toBe(NotificationSeverity.Inf);
    expect(alertNotification.modality).toBe(NotificationModality.NonModal);

    let confirmNotifications: Notification<ConfirmType>[] = [];

    confirmQueue.forEach((n) => {
      confirmNotifications.push(n);
    });

    expect(alertQueue.len()).toBe(1);
    expect(confirmNotifications.length).toBe(1);

    const confirmNotification = confirmNotifications[0];

    expect(confirmNotification).not.toBeNull();
    expect(confirmNotification.timestamp).toBe(timestamp);
    expect(confirmNotification.message).toBe("confirm");
    expect(confirmNotification.severity).toBe(NotificationSeverity.Err);
    expect(confirmNotification.modality).toBe(NotificationModality.NonModal);

    expect(monitor.callCount).toBe(2);

    // Should be resolved manually, since timeout wasn't set.
    alertNotification.resolve();
    confirmNotification.resolve(false);

    await alertResult.promise;
    expect(await confirmResult.promise).toBe(false);

    expect(alertQueue.len()).toBe(0);
    expect(confirmQueue.len()).toBe(0);

    expect(monitor.callCount).toBe(4);
  });
  test("Send notification without monitor", async () => {
    const timestamp = 12345678;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
    );

    const alertResult = dispatcher.alert(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(alertResult.error).toBeNull();
    expect(alertResult.promise).not.toBeNull();

    expect(alertQueue.len()).toBe(1);

    let alertNotifications: Notification<AlertType>[] = [];

    alertQueue.forEach((n) => {
      alertNotifications.push(n);
    });

    expect(alertQueue.len()).toBe(1);
    expect(alertNotifications.length).toBe(1);

    const notification = alertNotifications[0];

    expect(notification).not.toBeNull();
    expect(notification.timestamp).toBe(timestamp);
    expect(notification.message).toBe("Hello World");
    expect(notification.severity).toBe(NotificationSeverity.Inf);
    expect(notification.modality).toBe(NotificationModality.NonModal);

    // Should be resolved manually, since timeout wasn't set.
    notification.resolve();

    await alertResult.promise;

    expect(alertQueue.len()).toBe(0);
  });
  test("Modal notification", async () => {
    const timestamp = 12345678;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.Modal,
        timeout: 0,
      },
      {
        modality: NotificationModality.Modal,
        timeout: 0,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const alertResult = dispatcher.alert(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(alertResult.error).toBeNull();
    expect(alertResult.promise).not.toBeNull();

    expect(alertQueue.len()).toBe(1);

    let alertNotifications: Notification<AlertType>[] = [];

    alertQueue.forEach((n) => {
      alertNotifications.push(n);
    });

    expect(alertQueue.len()).toBe(1);
    expect(alertNotifications.length).toBe(1);

    const notification = alertNotifications[0];

    expect(notification).not.toBeNull();
    expect(notification.timestamp).toBe(timestamp);
    expect(notification.message).toBe("Hello World");
    expect(notification.severity).toBe(NotificationSeverity.Inf);
    expect(notification.modality).toBe(NotificationModality.Modal);

    expect(monitor.callCount).toBe(1);

    // Should be resolved manually, since timeout wasn't set.
    notification.resolve();

    await alertResult.promise;

    expect(alertQueue.len()).toBe(0);
    expect(monitor.callCount).toBe(2);
  });
  test("Send notifications with timeout", async () => {
    const timestamp = 12345678;
    // In milliseconds.
    const timeout = 100;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.Modal,
        timeout: timeout,
      },
      {
        modality: NotificationModality.Modal,
        timeout: timeout,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const alertResult = dispatcher.alert(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(alertResult.error).toBeNull();
    expect(alertResult.promise).not.toBeNull();
    expect(alertQueue.len()).toBe(1);

    const confirmResult = dispatcher.confirm(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(confirmResult.error).toBeNull();
    expect(confirmResult.promise).not.toBeNull();
    expect(confirmQueue.len()).toBe(1);

    await alertResult.promise;
    expect(await confirmResult.promise).toBe(false);

    expect(alertQueue.len()).toBe(0);
    expect(confirmQueue.len()).toBe(0);

    expect(monitor.callCount).toBe(4);
  });
  test("Send notifications to the full queue", async () => {
    const timestamp = 12345678;
    // In milliseconds.
    const timeout = 100;

    const clock: SystemClock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.Modal,
        timeout: timeout,
      },
      {
        modality: NotificationModality.Modal,
        timeout: timeout,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const alert1 = dispatcher.alert("Hello World", NotificationSeverity.Inf);
    expect(alert1.error).toBeNull();
    expect(alert1.promise).not.toBeNull();
    expect(alertQueue.len()).toBe(1);

    const alert2 = dispatcher.alert("Hello World", NotificationSeverity.Err);
    expect(alert2.error).not.toBeNull();
    expect(alert2.promise).toBeNull();
    expect(alertQueue.len()).toBe(1);

    const confirm1 = dispatcher.confirm(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(confirm1.error).toBeNull();
    expect(confirm1.promise).not.toBeNull();
    expect(confirmQueue.len()).toBe(1);

    const confirm2 = dispatcher.confirm(
      "Hello World",
      NotificationSeverity.Err,
    );
    expect(confirm2.error).not.toBeNull();
    expect(confirm2.promise).toBeNull();
    expect(confirmQueue.len()).toBe(1);

    alertQueue.forEach((n) => {
      expect(n.resolve()).toBeNull();
    });
    expect(alertQueue.len()).toBe(0);

    confirmQueue.forEach((n) => {
      expect(n.resolve(true)).toBeNull();
    });
    expect(confirmQueue.len()).toBe(0);

    const alert3 = dispatcher.alert("Hello World", NotificationSeverity.Inf);
    expect(alert3.error).toBeNull();
    expect(alert3.promise).not.toBeNull();
    expect(alertQueue.len()).toBe(1);
    alertQueue.forEach((n) => {
      expect(n.resolve()).toBeNull();
    });
    expect(alertQueue.len()).toBe(0);

    const confirm3 = dispatcher.confirm(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(confirm3.error).toBeNull();
    expect(confirm3.promise).not.toBeNull();
    expect(confirmQueue.len()).toBe(1);
    confirmQueue.forEach((n) => {
      expect(n.resolve(true)).toBeNull();
    });
    expect(confirmQueue.len()).toBe(0);
  });
  test("Failed to receive system time", async () => {
    const timestamp = 12345678;

    const clock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();
    clock.error = new Error("system lock isn't available");

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
      {
        modality: NotificationModality.NonModal,
        timeout: 0,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    const alertResult = dispatcher.alert(
      "Hello World",
      NotificationSeverity.Inf,
    );
    expect(alertResult.error).toBeNull();
    expect(alertResult.promise).not.toBeNull();

    expect(alertQueue.len()).toBe(1);

    let alertNotifications: Notification<AlertType>[] = [];

    alertQueue.forEach((n) => {
      alertNotifications.push(n);
    });

    expect(alertQueue.len()).toBe(1);
    expect(alertNotifications.length).toBe(1);

    const notification = alertNotifications[0];

    expect(notification).not.toBeNull();
    expect(notification.timestamp).toBe(0);
    expect(notification.message).toBe("Hello World");
    expect(notification.severity).toBe(NotificationSeverity.Inf);
    expect(notification.modality).toBe(NotificationModality.NonModal);

    expect(monitor.callCount).toBe(1);

    // Should be resolved manually, since timeout wasn't set.
    notification.resolve();

    await alertResult.promise;

    expect(alertQueue.len()).toBe(0);

    expect(monitor.callCount).toBe(2);
  });
  test("Invalid timeout", async () => {
    const timestamp = 12345678;
    const timeout = -1;

    const clock = new TestSystemClock();
    expect(clock.setTimestamp(timestamp)).toBeNull();

    const maxAlertNumber = 1;
    const alertLimitQueue = new AlertLimitNotificationQueue(
      new AlertArrayQueue(),
      maxAlertNumber,
    );
    const alertQueue = new MonitorNotificationQueue(alertLimitQueue);

    const maxConfirmNumber = 1;
    const confirmLimitQueue = new ConfirmLimitNotificationQueue(
      new ConfirmArrayQueue(),
      maxConfirmNumber,
    );
    const confirmQueue = new MonitorNotificationQueue(confirmLimitQueue);

    const dispatcher = new NotificationDispatcher(
      clock,
      alertQueue,
      confirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: timeout,
      },
      {
        modality: NotificationModality.NonModal,
        timeout: timeout,
      },
    );

    const monitor = new testObjectMonitor();

    alertQueue.setMonitor(monitor);
    confirmQueue.setMonitor(monitor);

    expect(() =>
      dispatcher.alert("Hello World", NotificationSeverity.Inf),
    ).toThrow("timeout should be >=0");
  });
});
