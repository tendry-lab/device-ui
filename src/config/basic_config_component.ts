import { Component } from "preact";

import { Config } from "./config";
import { Notificator, NotificationType } from "../system/notificator";

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
    if (
      await !this.props.notificator.confirm(
        "Are you sure you want to update configuration?",
      )
    ) {
      return;
    }

    const err = await this.props.config.write(this.state.data!);
    if (err) {
      console.error(`basic-config-component: error updating config: ${err}`);

      this.props.notificator.alert(
        "Error updating configuration",
        NotificationType.ERROR,
      );
    } else {
      this.props.notificator.alert(
        "Configuration updated successfully!",
        NotificationType.SUCCESS,
      );

      await this.readConfig();
    }
  };

  // Note: use arrow function to properly capture `this`.
  protected resetConfig = async () => {
    if (
      await !this.props.notificator.confirm(
        "Are you sure you want to reset configuration to defaults?",
      )
    ) {
      return;
    }

    const err = await this.props.config.reset();
    if (err) {
      console.error("basic-config-component: error resetting config:", err);

      this.props.notificator.alert(
        "Error resetting configuration",
        NotificationType.ERROR,
      );
    } else {
      this.props.notificator.alert(
        "Configuration reset successfully!",
        NotificationType.SUCCESS,
      );

      await this.readConfig();
    }
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
