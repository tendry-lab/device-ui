import { Component } from "preact";

import { Notificator } from "./system/notificator";
import { NotificationDispatcher } from "./system/notification_dispatcher";
import { TelemetryDataComponent } from "./pipeline/telemetry_data_component";
import { NotificationComponent } from "./pipeline/notification_component";

import {
  AlertMonitorNotificationQueue,
  ConfirmMonitorNotificationQueue,
  AlertLimitNotificationQueue,
  ConfirmLimitNotificationQueue,
} from "./system/notification_types";

import { NotificationModality } from "./system/notification";

import { SystemClock } from "./system/system_clock";
import { LocalSystemClock } from "./system/local_system_clock";

import "./app.css";

type appProps = {};

export class App extends Component<appProps, {}> {
  constructor(props: appProps) {
    super(props);

    this.systemClock = new LocalSystemClock();

    this.notificationAlertQueue = new AlertMonitorNotificationQueue(
      new AlertLimitNotificationQueue(4),
    );

    this.notificationConfirmQueue = new ConfirmMonitorNotificationQueue(
      new ConfirmLimitNotificationQueue(1),
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
  }

  render() {
    // Base URL.
    const API_BASE_URL: string = "api/v1";

    return (
      <>
        <div className="app-container">
          <h1>Bonsai Zero Analog 1 Kit Dashboard</h1>
          <TelemetryDataComponent
            baseURL={API_BASE_URL}
            interval={10 * 1000}
            notificator={this.notificationDispatcher}
          />
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

  private systemClock: SystemClock;
  private notificationAlertQueue: AlertMonitorNotificationQueue;
  private notificationConfirmQueue: ConfirmMonitorNotificationQueue;
  private notificationDispatcher: NotificationDispatcher;
}
