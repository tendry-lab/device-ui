import { Notificator, NotificationType } from "./notificator";

// Default browser-based notification.
export class DefaultNotificator implements Notificator {
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/alert
  alert(str: string, _: NotificationType): void {
    return alert(str);
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm
  async confirm(str: string): Promise<boolean> {
    return confirm(str);
  }
}
