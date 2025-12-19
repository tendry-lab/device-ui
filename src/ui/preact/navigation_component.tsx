/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, JSX } from "preact";

import { Rebooter } from "@device-ui/lib/device/rebooter";
import { Locator } from "@device-ui/lib/device/locator";
import { Notificator } from "@device-ui/lib/system/notificator";
import { NotificationSeverity } from "@device-ui/lib/system/notification";
import { StateMonitor } from "@device-ui/lib/core/state_monitor";
import { UpdaterSelector } from "@device-ui/lib/device/updater_selector";

import { MarkdownComponent } from "@device-ui/ui/preact/markdown_component";
import { UpdateComponent } from "@device-ui/ui/preact/update_component";

import "@device-ui/ui/preact/dashboard.css";

export type NavigationComponentProps = {
  // Rebooter to reboot the device.
  rebooter: Rebooter;

  // Locator to control the device locating.
  locator: Locator;

  // Notificator to send notifications.
  notificator: Notificator;

  // UpdaterSelector to select the updater for the firmware update process.
  updaterSelector: UpdaterSelector;

  // Navigation bar logo.
  logo: JSX.Element;

  // Help documentation.
  help: JSX.Element;
};

export class NavigationComponent extends Component<
  NavigationComponentProps,
  {}
> {
  constructor(props: NavigationComponentProps) {
    super(props);

    this.helpState = new StateMonitor<boolean>(false);
    this.updateState = new StateMonitor<boolean>(false);
  }

  render() {
    return (
      <>
        <nav className="nav-bar">
          <div className="nav-logo">{this.props.logo}</div>

          <input type="checkbox" id="menu-toggle" className="menu-toggle" />
          <label htmlFor="menu-toggle" className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </label>

          <div className="nav-buttons">
            <button className="nav-button" onClick={this.handleLocate}>
              Locate
            </button>
            <button className="nav-button" onClick={this.handleReboot}>
              Reboot
            </button>
            <button className="nav-button" onClick={this.handleUpdate}>
              Update
            </button>
            <button className="nav-button" onClick={this.handleHelp}>
              Help
            </button>
          </div>
        </nav>

        <MarkdownComponent
          stateMonitor={this.helpState}
          data={this.props.help}
        />

        <UpdateComponent
          stateMonitor={this.updateState}
          updaterSelector={this.props.updaterSelector}
        />
      </>
    );
  }

  override componentWillUnmount() {
    this.helpState.set(false);
    this.updateState.set(false);
  }

  private handleLocate = async () => {
    const confirmResult = this.props.notificator.confirm(
      "Toggle device locating?",
      NotificationSeverity.Wrn,
    );
    if (confirmResult.error) {
      const alertResult = this.props.notificator.alert(
        `Unable to open confirm dialog: ${confirmResult.error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `navigation_component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const resultConfirmed = await confirmResult.promise;
    if (!resultConfirmed) {
      return;
    }

    const err = await this.props.locator.flip();
    if (err) {
      console.error(
        "navigation_component: failed to toggle device locating:",
        err,
      );

      const alertResult = this.props.notificator.alert(
        `Error toggle device locating: ${err}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `navigation_component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const alertResult = this.props.notificator.alert(
      "Completed",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `navigation_component: failed to send notification: ${alertResult.error}`,
      );
    }
  };

  private handleReboot = async () => {
    const confirmResult = this.props.notificator.confirm(
      "Reboot device?",
      NotificationSeverity.Wrn,
    );
    if (confirmResult.error) {
      const alertResult = this.props.notificator.alert(
        `Unable to open confirm dialog: ${confirmResult.error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `navigation_component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const resultConfirmed = await confirmResult.promise;
    if (!resultConfirmed) {
      return;
    }

    const alertResult = this.props.notificator.alert(
      "Rebooting...",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `navigation_component: failed to send notification: ${alertResult.error}`,
      );
    }

    const err = await this.props.rebooter.reboot();
    if (err) {
      console.error("navigation_component: failed to reboot the device:", err);

      const alertResult = this.props.notificator.alert(
        `Error rebooting device: ${err}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `navigation_component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }
  };

  private handleHelp = () => {
    this.helpState.set(true);
  };

  private handleUpdate = () => {
    this.updateState.set(true);
  };

  private helpState: StateMonitor<boolean>;
  private updateState: StateMonitor<boolean>;
}
