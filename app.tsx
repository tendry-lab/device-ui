import { Component } from "preact";

import { Notificator } from "./src/lib/system/notificator";
import { NotificationDispatcher } from "./src/lib/system/notification_dispatcher";
import { NotificationComponent } from "./src/ui/preact/notification_component";

import {
  AlertArrayQueue,
  ConfirmArrayQueue,
  AlertMonitorNotificationQueue,
  ConfirmMonitorNotificationQueue,
  AlertLimitNotificationQueue,
  ConfirmLimitNotificationQueue,
} from "./src/lib/system/notification_types";

import { NotificationModality } from "./src/lib/system/notification";

import { SystemClock } from "./src/lib/system/system_clock";
import { LocalSystemClock } from "./src/lib/system/local_system_clock";

import { Fetcher } from "./src/lib/http/fetcher";
import { Formatter } from "./src/lib/fmt/formatter";
import { HTTPFetcher } from "./src/lib/http/http_fetcher";
import { PeriodicDataFetcher } from "./src/lib/device/periodic_data_fetcher";
import { JSONFormatter } from "./src/lib/fmt/json_formatter";
import { Config } from "./src/lib/device/config";
import { HTTPConfig } from "./src/lib/device/http_config";
import { AnalogSensorComponent } from "./src/ui/preact/sensor/soil/analog_sensor_component";

import { Rebooter } from "./src/lib/device/rebooter";
import { Locator } from "./src/lib/device/locator";
import { HTTPRebooter } from "./src/lib/device/http_rebooter";
import { HTTPLocator } from "./src/lib/device/http_locator";
import { NavigationComponent } from "./src/ui/preact/navigation_component";
import { BonsaiLogo } from "./src/ui/preact/logo/bonsai";

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
