/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from "@testing-library/preact";

import { describe, test, expect } from "vitest";

import { MonitorNotificationQueue } from "@device-ui/lib/system/monitor_notification_queue";
import { NotificationDispatcher } from "@device-ui/lib/system/notification_dispatcher";

import {
  AlertNotification,
  ConfirmNotification,
  AlertArrayQueue,
  ConfirmArrayQueue,
  AlertLimitNotificationQueue,
  ConfirmLimitNotificationQueue,
} from "@device-ui/lib/system/notification_types";

import {
  Notification,
  NotificationSeverity,
  NotificationModality,
} from "@device-ui/lib/system/notification";

import { TestSystemClock } from "@device-ui/lib/tests/test_system_clock";
import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";

import { NotificationComponent } from "@device-ui/ui/preact/notification_component";

class testObjectMonitor implements ObjectMonitor {
  callCount: number = 0;

  notifyChanged(): void {
    this.callCount++;
  }
}

describe("Notification Component", () => {
  test("Queue state management on mount/unmount", async () => {
    const systemClock = new TestSystemClock();
    systemClock.setTimestamp(12345);

    const alertQueue = new MonitorNotificationQueue(
      new AlertLimitNotificationQueue(new AlertArrayQueue(), 5),
    );
    const confirmQueue = new MonitorNotificationQueue(
      new ConfirmLimitNotificationQueue(new ConfirmArrayQueue(), 5),
    );

    const dispatcher = new NotificationDispatcher(
      systemClock,
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

    const alertNotification = dispatcher.alert(
      "hello alert",
      NotificationSeverity.Inf,
    );
    expect(alertNotification.error).toBeNull();
    expect(alertNotification.promise).not.toBeNull();

    const confirmNotification = dispatcher.confirm(
      "hello confirm",
      NotificationSeverity.Err,
    );
    expect(confirmNotification.error).toBeNull();
    expect(confirmNotification.promise).not.toBeNull();

    expect(alertQueue.len()).toBe(1);
    expect(confirmQueue.len()).toBe(1);

    const { unmount } = render(
      <NotificationComponent
        maxNonModalNotificationCount={3}
        systemClock={systemClock}
        alertQueue={alertQueue}
        confirmQueue={confirmQueue}
      />,
    );

    unmount();

    await alertNotification.promise;
    expect(await confirmNotification.promise).toBe(false);

    while (true) {
      if (!alertQueue.len() && !confirmQueue.len()) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect(alertQueue.len()).toBe(0);
    expect(confirmQueue.len()).toBe(0);
  });
});
