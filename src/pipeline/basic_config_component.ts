import { Component } from "preact";

import { Config } from "../device/config";
import { Notificator } from "../system/notificator";
import { NotificationSeverity } from "../system/notification";

type configState = {
  data: Record<string, any> | null;
  loading: boolean;
  error: Error | null;
};

export type ConfigComponentProps = {
  // Actual component configuration.
  config: Config;

  // A list of keys that should be ignored in the configuration.
  ignoreKeys?: string[];

  // Optional callback to call when the configuration is canceled (or completed).
  onClose: () => void;

  // Notification mechanism.
  notificator: Notificator;
};

export abstract class BasicConfigComponent extends Component<
  ConfigComponentProps,
  configState
> {
  constructor(props: ConfigComponentProps) {
    super(props);

    this.state = {
      data: null,
      loading: false,
      error: null,
    };
  }

  // Read config on component mounting.
  async componentDidMount() {
    await this.readConfig();
  }

  componentWillUnmount() {
    this.setState({
      data: null,
      loading: false,
      error: null,
    });
  }

  // Note: use arrow function to properly capture `this`.
  protected writeConfig = async () => {
    const confirmResult = this.props.notificator.confirm(
      "Are you sure you want to update configuration?",
      NotificationSeverity.Wrn,
    );
    if (confirmResult.error) {
      const alertResult = this.props.notificator.alert(
        `Unable to open confirm dialog: ${confirmResult.error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `basic-config-component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const resultConfirmed = await confirmResult.promise;
    if (!resultConfirmed) {
      return;
    }

    const err = await this.props.config.write(this.state.data!);
    if (err) {
      console.error(`basic-config-component: error updating config: ${err}`);

      const alertResult = this.props.notificator.alert(
        `Error updating configuration: ${err}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `basic-config-component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const alertResult = this.props.notificator.alert(
      "Configuration updated successfully!",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `basic-config-component: failed to send notification: ${alertResult.error}`,
      );
    }

    await this.readConfig();
  };

  // Note: use arrow function to properly capture `this`.
  protected resetConfig = async () => {
    const confirmResult = this.props.notificator.confirm(
      "Are you sure you want to reset configuration?",
      NotificationSeverity.Wrn,
    );
    if (confirmResult.error) {
      const alertResult = this.props.notificator.alert(
        `Unable to open confirm dialog: ${confirmResult.error}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `basic-config-component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const resultConfirmed = await confirmResult.promise;
    if (!resultConfirmed) {
      return;
    }

    const err = await this.props.config.reset();
    if (err) {
      console.error("basic-config-component: error resetting config:", err);

      const alertResult = this.props.notificator.alert(
        `Error resetting configuration: ${err}`,
        NotificationSeverity.Err,
      );
      if (alertResult.error) {
        console.error(
          `basic-config-component: failed to send notification: ${alertResult.error}`,
        );
      }

      return;
    }

    const alertResult = this.props.notificator.alert(
      "Configuration reseted successfully!",
      NotificationSeverity.Inf,
    );
    if (alertResult.error) {
      console.error(
        `basic-config-component: failed to send notification: ${alertResult.error}`,
      );
    }

    await this.readConfig();
  };

  // Note: use arrow function to properly capture `this`.
  protected setData = (data: Record<string, any>) => {
    this.setState({ data: data });
  };

  private async readConfig() {
    this.setState({ loading: true });

    const readResult = await this.props.config.read();
    if (readResult.error) {
      console.error(
        `basic-config-component: failed to read: ${readResult.error}`,
      );
    }

    this.setState({
      loading: false,
      data: readResult.data,
      error: readResult.error,
    });
  }
}
