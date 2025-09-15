import { AlertType, ConfirmType } from "./notification_types";

import { NotificationSeverity } from "./notification";

export type NotificationResult<T> = {
  promise: Promise<T> | null;
  error: Error | null;
};

export type AlertResult = NotificationResult<AlertType>;
export type ConfirmResult = NotificationResult<ConfirmType>;

// Send notifications.
export interface Notificator {
  // Send an alert dialog.
  alert(message: string, severity: NotificationSeverity): AlertResult;

  // Send a confirmation dialog.
  confirm(message: string, severity: NotificationSeverity): ConfirmResult;
}
