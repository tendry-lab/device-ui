import { Component } from "preact";

import { Notificator } from "./system/notificator";
import { NotificationDispatcher } from "./system/notification_dispatcher";
import { NotificationComponent } from "./pipeline/notification_component";

import {
  AlertArrayQueue,
  ConfirmArrayQueue,
  AlertMonitorNotificationQueue,
  ConfirmMonitorNotificationQueue,
  AlertLimitNotificationQueue,
  ConfirmLimitNotificationQueue,
} from "./system/notification_types";

import { NotificationModality } from "./system/notification";

import { SystemClock } from "./system/system_clock";
import { LocalSystemClock } from "./system/local_system_clock";

import { Fetcher } from "./http/fetcher";
import { Formatter } from "./fmt/formatter";
import { HTTPFetcher } from "./http/http_fetcher";
import { PeriodicDataFetcher } from "./device/periodic_data_fetcher";
import { JSONFormatter } from "./fmt/json_formatter";
import { Config } from "./device/config";
import { HTTPConfig } from "./device/http_config";
import { AnalogSensorComponent } from "./pipeline/sensor/soil/analog_sensor_component";

import { Rebooter } from "./device/rebooter";
import { Locator } from "./device/locator";
import { HTTPRebooter } from "./device/http_rebooter";
import { HTTPLocator } from "./device/http_locator";
import { NavigationComponent } from "./pipeline/navigation_component";
import { BonsaiLogo } from "./pipeline/logo/bonsai";

import { html as helpContent } from "./help.md";

import "./pipeline/app.css";
import "./pipeline/dashboard.css";

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

    this.telemetryHTTPFetcher = new HTTPFetcher(`${App.apiBaseURL}/telemetry`);
    this.telemetryFormatter = new JSONFormatter();

    this.telemetryDataFetcher = new PeriodicDataFetcher(
      this.telemetryHTTPFetcher,
      this.telemetryFormatter,
      App.telemetryFetchInterval,
    );

    this.soilSensorConfig = new HTTPConfig(
      new JSONFormatter(),
      `${App.apiBaseURL}/config/sensor/analog?id=soil_a0`,
    );
  }

  async componentDidMount() {
    this.telemetryDataFetcher.start();
  }

  componentWillUnmount() {
    this.telemetryDataFetcher.stop();
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
              prefix="sensor_soil"
              fetcher={this.telemetryDataFetcher}
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
  private telemetryHTTPFetcher: Fetcher;
  private telemetryFormatter: Formatter;
  private telemetryDataFetcher: PeriodicDataFetcher;

  private soilSensorConfig: Config;
}
