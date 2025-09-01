// Various notification types.
export enum NotificationType {
  ERROR = 0,
  SUCCESS = 1,
}

export interface Notificator {
  // Alertring the user with @p str message and @p typ notification type.
  alert(str: string, typ: NotificationType): void;

  // Confirm the user choice.
  confirm(str: string): Promise<boolean>;
}
