import { NotificationSeverity } from "./notification_types";

export type AlertResult = {
  promise: Promise<void> | null;
  error: Error | null;
};

export type ConfirmResult = {
  promise: Promise<boolean> | null;
  error: Error | null;
};

// Send notifications.
export interface Notificator {
  // Send an alert dialog.
  alert(message: string, severity: NotificationSeverity): AlertResult;

  // Send a confirmation dialog.
  confirm(message: string, severity: NotificationSeverity): ConfirmResult;
}
