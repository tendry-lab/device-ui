import { Queue } from "../core/queue";
import { LimitQueue } from "../core/limit_queue";
import { ArrayQueue } from "../core/array_queue";
import { Notification } from "./notification";
import { MonitorNotificationQueue } from "./monitor_notification_queue";

export type AlertType = void;
export type ConfirmType = boolean;

export class AlertNotification extends Notification<AlertType> {}
export class ConfirmNotification extends Notification<ConfirmType> {}

export class AlertArrayQueue extends ArrayQueue<AlertNotification> {}
export class ConfirmArrayQueue extends ArrayQueue<ConfirmNotification> {}

export class LimitNotificationQueue<T> extends LimitQueue<Notification<T>> {}

export type NotificationQueue<T> = Queue<Notification<T>>;

export type AlertNotificationQueue = NotificationQueue<AlertType>;
export class AlertLimitNotificationQueue extends LimitNotificationQueue<AlertType> {}
export class AlertMonitorNotificationQueue extends MonitorNotificationQueue<AlertType> {}

export type ConfirmNotificationQueue = NotificationQueue<ConfirmType>;
export class ConfirmLimitNotificationQueue extends LimitNotificationQueue<ConfirmType> {}
export class ConfirmMonitorNotificationQueue extends MonitorNotificationQueue<ConfirmType> {}
