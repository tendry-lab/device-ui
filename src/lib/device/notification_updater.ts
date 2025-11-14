/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Updater } from "@device-ui/lib/device/updater";
import { Notificator, AlertResult } from "@device-ui/lib/system/notificator";
import { NotificationSeverity } from "@device-ui/lib/system/notification";

export class NotificationUpdater implements Updater {
  // Initialize.
  //
  // @params
  // - @p notificator to send notifications about the OTA process.
  // - @p updater to perform the actual OTA process.
  constructor(
    private notificator: Notificator,
    private updater: Updater,
  ) {}

  // Return error if @p data with firmware is invalid.
  verify(data: Uint8Array): Error | null {
    let alertResult: AlertResult | null = null;

    alertResult = this.notificator.alert(
      "OTA verifing firmware file",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `notification_updater: failed to send notification: ${alertResult.error}`,
      );
    }

    let error: Error | null = null;

    error = this.updater.verify(data);
    if (error) {
      alertResult = this.notificator.alert(
        `OTA failed to verify firmware file: ${error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `notification_updater: failed to send notification: ${alertResult.error}`,
        );
      }

      return error;
    }

    return null;
  }

  // Begin OTA process.
  async begin(): Promise<Error | null> {
    let alertResult: AlertResult | null = null;

    alertResult = this.notificator.alert(
      "OTA starting",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `notification_updater: failed to send notification: ${alertResult.error}`,
      );
    }

    let error: Error | null = null;

    error = await this.updater.begin();
    if (error) {
      alertResult = this.notificator.alert(
        `OTA failed to begin: ${error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `notification_updater: failed to send notification: ${alertResult.error}`,
        );
      }

      return error;
    }

    return null;
  }

  // Write data to the device.
  async write(data: Uint8Array): Promise<Error | null> {
    let alertResult: AlertResult | null = null;

    alertResult = this.notificator.alert(
      "OTA writing data",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `notification_updater: failed to send notification: ${alertResult.error}`,
      );
    }

    let error: Error | null = null;

    error = await this.updater.write(data);
    if (error) {
      alertResult = this.notificator.alert(
        `OTA write failed: ${error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `notification_updater: failed to send notification: ${alertResult.error}`,
        );
      }

      return error;
    }

    return null;
  }

  // End OTA process.
  async end(): Promise<Error | null> {
    let alertResult: AlertResult | null = null;

    alertResult = this.notificator.alert(
      "OTA finishing",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `notification_updater: failed to send notification: ${alertResult.error}`,
      );
    }

    let error: Error | null = null;

    error = await this.updater.end();
    if (error) {
      console.error(`notification_updater: failed to end OTA: ${error}`);

      alertResult = this.notificator.alert(
        `OTA failed to end: ${error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `notification_updater: failed to send notification: ${alertResult.error}`,
        );
      }

      return error;
    }

    return null;
  }

  // Cancel OTA process.
  async cancel(): Promise<Error | null> {
    let alertResult: AlertResult | null = null;

    alertResult = this.notificator.alert(
      "OTA canceling",
      NotificationSeverity.Err,
    );
    if (alertResult.error) {
      console.error(
        `notification_updater: failed to send notification: ${alertResult.error}`,
      );
    }

    let error: Error | null = null;

    error = await this.updater.cancel();
    if (error) {
      console.error(`notification_updater: failed to cancel OTA: ${error}`);

      alertResult = this.notificator.alert(
        `OTA cancel failed: ${error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `notification_updater: failed to send notification: ${alertResult.error}`,
        );
      }

      return error;
    }

    return null;
  }
}
