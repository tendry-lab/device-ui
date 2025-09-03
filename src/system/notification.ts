// Various notification severities.
export enum NotificationSeverity {
  Err = 0,
  Wrn,
  Inf,
}

export enum NotificationModality {
  NonModal = 0,
  Modal,
}

export class Notification<T> {
  // Initialize.
  //
  // @params
  //  - @p timestamp - notification creation time, UNIX timestamp, in seconds.
  //  - @p message - human-readable notification message.
  //  - @p severity - notification severity level.
  //  - @p modality - notification modality (modal/non-modal).
  //  - @p resolveCb - optional callback to be called when the notification is resolved.
  constructor(
    public readonly timestamp: number,
    public readonly message: string,
    public readonly severity: NotificationSeverity,
    public readonly modality: NotificationModality,
    private resolveCb?: (notification: Notification<T>) => Error | null,
  ) {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolvePromiseCb = resolve;
      this.rejectPromiseCb = reject;
    });
  }

  // Promise to wait until the notification is resolved.
  public readonly promise: Promise<T>;

  // Mark a notification as resolved.
  //
  // @remarks
  //  - Multiple calls have no effect.
  //
  //  - If an error occurred during the resolution process, the notification
  //    promise will be rejected. Use the following example to properly handle
  //    the result of the asynchronous operation:
  //
  //    notification.promise
  //      .then(result => {
  //        console.log(`Notification resolved successfully: ${result}`);
  //      })
  //      .catch(error => {
  //        console.error(`Error during notification resolution: ${error}`);
  //      });
  resolve(result: T): Error | null {
    if (this.resolved) {
      return this.lastError;
    }

    this.resolved = true;

    if (this.resolveCb) {
      this.lastError = this.resolveCb(this);
    }

    if (this.lastError) {
      this.rejectPromiseCb(this.lastError);
    } else {
      this.resolvePromiseCb(result);
    }

    return this.lastError;
  }

  private resolvePromiseCb!: (value: T) => void;
  private rejectPromiseCb!: (error: Error) => void;

  private resolved: boolean = false;
  private lastError: Error | null = null;
}
