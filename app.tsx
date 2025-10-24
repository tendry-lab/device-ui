/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from "preact";

import { Notificator } from "@device-ui/lib/system/notificator";
import { NotificationDispatcher } from "@device-ui/lib/system/notification_dispatcher";

import {
  AlertArrayQueue,
  ConfirmArrayQueue,
  AlertMonitorNotificationQueue,
  ConfirmMonitorNotificationQueue,
  AlertLimitNotificationQueue,
  ConfirmLimitNotificationQueue,
} from "@device-ui/lib/system/notification_types";

import { NotificationModality } from "@device-ui/lib/system/notification";

import { SystemClock } from "@device-ui/lib/system/system_clock";
import { LocalSystemClock } from "@device-ui/lib/system/local_system_clock";

import { Formatter } from "@device-ui/lib/fmt/formatter";
import { HTTPFetcher } from "@device-ui/lib/http/http_fetcher";
import { DataStore } from "@device-ui/lib/device/data_store";
import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";
import { Config } from "@device-ui/lib/device/config";
import { HTTPConfig } from "@device-ui/lib/device/http_config";

import { Rebooter } from "@device-ui/lib/device/rebooter";
import { Locator } from "@device-ui/lib/device/locator";
import { HTTPRebooter } from "@device-ui/lib/device/http_rebooter";
import { HTTPLocator } from "@device-ui/lib/device/http_locator";

import { PeriodicRunner } from "@device-ui/lib/scheduler/periodic_runner";
import { FetchRunner } from "@device-ui/lib/http/fetch_runner";

import { NotificationComponent } from "@device-ui/ui/preact/notification_component";
import { AnalogSensorComponent } from "@device-ui/ui/preact/sensor/soil/analog_sensor_component";
import { NavigationComponent } from "@device-ui/ui/preact/navigation_component";
import { BonsaiLogo } from "@device-ui/ui/preact/logo/bonsai";

import { html as helpContent } from "./help.md";

import "./src/ui/preact/app.css";
import "./src/ui/preact/dashboard.css";

type appProps = {};

export class App extends Component<appProps, {}> {
  constructor(props: appProps) {
    super(props);

    this.systemClock = new LocalSystemClock();

    this.notificationAlertQueue = new AlertMonitorNotificationQueue(
      new AlertLimitNotificationQueue(new AlertArrayQueue(), 4),
    );

    this.notificationConfirmQueue = new ConfirmMonitorNotificationQueue(
      new ConfirmLimitNotificationQueue(new ConfirmArrayQueue(), 1),
    );

    this.notificationDispatcher = new NotificationDispatcher(
      this.systemClock,
      this.notificationAlertQueue,
      this.notificationConfirmQueue,
      {
        modality: NotificationModality.NonModal,
        timeout: 1000 * 5,
      },
      {
        modality: NotificationModality.Modal,
        timeout: 0,
      },
    );

    this.deviceRebooter = new HTTPRebooter(`${App.apiBaseURL}/system/reboot`);
    this.deviceLocator = new HTTPLocator(`${App.apiBaseURL}/system/locate`);

    this.telemetryStore = new DataStore(new JSONFormatter());

    this.telemetryRunner = new PeriodicRunner(
      new FetchRunner(
        new HTTPFetcher(`${App.apiBaseURL}/telemetry`),
        this.telemetryStore,
      ),
      null,
      App.telemetryFetchInterval,
    );

    this.soilSensorConfig = new HTTPConfig(
      new JSONFormatter(),
      `${App.apiBaseURL}/config/sensor/analog?id=soil_a0`,
    );
  }

  async componentDidMount() {
    this.telemetryRunner.start();
  }

  componentWillUnmount() {
    this.telemetryRunner.stop();
  }

  render() {
    return (
      <>
        <div className="dashboard">
          <NavigationComponent
            rebooter={this.deviceRebooter}
            locator={this.deviceLocator}
            notificator={this.notificationDispatcher}
            logo={<BonsaiLogo />}
            help={<div dangerouslySetInnerHTML={{ __html: helpContent }} />}
          />

          <div className="card-large">
            <AnalogSensorComponent
              title="Soil Moisture"
              prefix="s"
              store={this.telemetryStore}
              config={this.soilSensorConfig}
              notificator={this.notificationDispatcher}
            />
          </div>
        </div>
        <NotificationComponent
          maxNonModalNotificationCount={3}
          systemClock={this.systemClock}
          alertQueue={this.notificationAlertQueue}
          confirmQueue={this.notificationConfirmQueue}
        />
      </>
    );
  }

  private static readonly apiBaseURL: string = "api/v1";

  private systemClock: SystemClock;

  private notificationAlertQueue: AlertMonitorNotificationQueue;
  private notificationConfirmQueue: ConfirmMonitorNotificationQueue;
  private notificationDispatcher: NotificationDispatcher;

  private deviceRebooter: Rebooter;
  private deviceLocator: Locator;

  private static readonly telemetryFetchInterval: number = 10 * 1000;
  private telemetryStore: DataStore;
  private telemetryRunner: PeriodicRunner;

  private soilSensorConfig: Config;
}
