import { Component, JSX } from "preact";

import {
  AlertNotification,
  ConfirmNotification,
  AlertMonitorNotificationQueue,
  ConfirmMonitorNotificationQueue,
} from "../system/notification_types";

import {
  NotificationSeverity,
  NotificationModality,
} from "../system/notification";

import { ObjectMonitor } from "../core/object_monitor";
import { SystemClock } from "../system/system_clock";

import "./notification_component.css";

type notificationComponentState = {
  timestamp: number;
};

export type NotificationComponentProps = {
  // Maximum number of stacked non-modal notifications.
  maxNonModalNotificationCount: number;

  // Clock to update the component state timestamp.
  systemClock: SystemClock;

  // Alert notification queue.
  alertQueue: AlertMonitorNotificationQueue;

  // Confirmation notification queue.
  confirmQueue: ConfirmMonitorNotificationQueue;
};

export class NotificationComponent
  extends Component<NotificationComponentProps, notificationComponentState>
  implements ObjectMonitor
{
  constructor(props: NotificationComponentProps) {
    super(props);

    this.state = {
      timestamp: 0,
    };
  }

  componentDidMount() {
    this.props.alertQueue.setMonitor(this);
    this.props.confirmQueue.setMonitor(this);
  }

  componentWillUnmount() {
    this.resetNotifications();
  }

  notifyChanged() {
    // Ignore notifications when the component was already unmounted.
    if (!this.base) {
      return;
    }

    let timestamp: number = 0;

    const result = this.props.systemClock.getTimestamp();
    if (result.error) {
      console.error(
        `notification-component: failed to get UNIX time: ${result.error}`,
      );
    } else {
      timestamp = result.timestamp;
    }

    this.setState({
      timestamp: timestamp,
    });
  }

  render() {
    const modalElements: JSX.Element[] = [];
    const nonModalElements: JSX.Element[] = [];

    // Process alert notifications
    this.props.alertQueue.forEach((notification) => {
      if (notification.modality === NotificationModality.Modal) {
        const modalElement = (
          <div
            key={`alert-${notification.timestamp}`}
            className={`notification alert modal ${NotificationComponent.getSeverityClass(notification.severity)}`}
          >
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-buttons">
                <button
                  className="notification-button"
                  onClick={() => this.handleAlertResolve(notification)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        );
        modalElements.push(modalElement);
      } else {
        const nonModalElement = (
          <div
            key={`alert-${notification.timestamp}`}
            className={`notification alert non-modal ${NotificationComponent.getSeverityClass(notification.severity)}`}
          >
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-buttons">
                <button
                  className="notification-button"
                  onClick={() => this.handleAlertResolve(notification)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        );
        nonModalElements.push(nonModalElement);
      }
    });

    // Process confirm notifications
    this.props.confirmQueue.forEach((notification) => {
      if (notification.modality === NotificationModality.Modal) {
        const modalElement = (
          <div
            key={`confirm-${notification.timestamp}`}
            className={`notification confirm modal ${NotificationComponent.getSeverityClass(notification.severity)}`}
          >
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-buttons">
                <button
                  className="notification-button confirm-yes"
                  onClick={() => this.handleConfirmResolve(notification, true)}
                >
                  Yes
                </button>
                <button
                  className="notification-button confirm-no"
                  onClick={() => this.handleConfirmResolve(notification, false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        );
        modalElements.push(modalElement);
      } else {
        const nonModalElement = (
          <div
            key={`confirm-${notification.timestamp}`}
            className={`notification confirm non-modal ${NotificationComponent.getSeverityClass(notification.severity)}`}
          >
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-buttons">
                <button
                  className="notification-button confirm-yes"
                  onClick={() => this.handleConfirmResolve(notification, true)}
                >
                  Yes
                </button>
                <button
                  className="notification-button confirm-no"
                  onClick={() => this.handleConfirmResolve(notification, false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        );
        nonModalElements.push(nonModalElement);
      }
    });

    const limitedNonModalElements = nonModalElements.slice(
      0,
      this.props.maxNonModalNotificationCount,
    );

    // Only render if there are notifications
    if (modalElements.length === 0 && limitedNonModalElements.length === 0) {
      return null;
    }

    return (
      <>
        {/* Modal notifications - positioned directly */}
        {modalElements}

        {/* Non-modal notifications - right side of screen */}
        {limitedNonModalElements.length > 0 && (
          <div className="notification-overlay">
            <div className="non-modal-stack">{limitedNonModalElements}</div>
          </div>
        )}
      </>
    );
  }

  private static getSeverityClass(severity: NotificationSeverity): string {
    switch (severity) {
      case NotificationSeverity.Err:
        return "severity-error";
      case NotificationSeverity.Wrn:
        return "severity-warning";
      case NotificationSeverity.Inf:
        return "severity-success";
      default:
        return "severity-success";
    }
  }

  private handleAlertResolve = (notification: AlertNotification) => {
    const error = notification.resolve();
    if (error) {
      console.error(
        `notification-component: failed to resolve alert: ${error}`,
      );
    }
  };

  private handleConfirmResolve = (
    notification: ConfirmNotification,
    result: boolean,
  ) => {
    const error = notification.resolve(result);
    if (error) {
      console.error(
        `notification-component: failed to resolve confirm: ${error}`,
      );
    }
  };

  private resetNotifications() {
    this.props.alertQueue.setMonitor(null);

    this.props.alertQueue.forEach((n) => {
      const error = n.resolve();
      if (error) {
        console.error(
          `notification-component: failed to resolve alert on unmount: ${error}`,
        );
      }
    });

    this.props.confirmQueue.setMonitor(null);

    this.props.confirmQueue.forEach((n) => {
      const error = n.resolve(false);
      if (error) {
        console.error(
          `notification-component: failed to resolve confirm on unmount: ${error}`,
        );
      }
    });

    this.setState({
      timestamp: 0,
    });
  }
}
