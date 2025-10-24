/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Notificator,
  AlertResult,
  ConfirmResult,
} from "@device-ui/lib/system/notificator";

import { NotificationSeverity } from "@device-ui/lib/system/notification";

// Default browser-based notification.
export class DefaultNotificator implements Notificator {
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/alert
  alert(message: string, _: NotificationSeverity): AlertResult {
    alert(message);

    return {
      promise: Promise.resolve(),
      error: null,
    };
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm
  confirm(message: string, _: NotificationSeverity): ConfirmResult {
    const result = confirm(message);

    return {
      promise: Promise.resolve(result),
      error: null,
    };
  }
}
