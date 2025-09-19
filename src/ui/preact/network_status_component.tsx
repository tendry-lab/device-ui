import { Component } from "preact";

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { DataStore } from "@device-ui/lib/device/data_store";
import { ConnectionHandler } from "@device-ui/lib/device/connection_handler";
import { FanoutConnectionHandler } from "@device-ui/lib/device/fanout_connection_handler";

import "@device-ui/ui/preact/network_status_component.css";

export type NetworkStatusComponentProps = {
  // Registration fetcher to receive latest registration data.
  registrationStore: DataStore;

  // Connection handler to receive the device connection status.
  connectionHandler: FanoutConnectionHandler;
};

class WiFiStaData {
  constructor(
    readonly ip: string = "",
    readonly rssi: number = 0,
    readonly ssid: string = "",
    readonly signalStrength: string = "",
  ) {
  }
}

class WiFiApData {
  constructor(
    readonly channel: number = 0,
    readonly currConnNumber: number = 0,
    readonly maxConnNumber: number = 0,
  ) {
  }
}

type NetworkData = WiFiApData | WiFiStaData;

type NetworkStatusComponentState = {
  expanded: boolean;
  connected: boolean;
  data: NetworkData | null;
};

export class NetworkStatusComponent
  extends Component<NetworkStatusComponentProps, NetworkStatusComponentState>
  implements ObjectMonitor, ConnectionHandler
{
  constructor(props: NetworkStatusComponentProps) {
    super(props);

    this.state = {
      expanded: false,
      connected: false,
      data: null,
    };
  }

  override async componentDidMount() {
    let error: Error | null = null;

    error = this.props.registrationStore.add(this);
    if (error) {
      console.error(
        `network_status_component: failed to register for registration changes: ${error}`,
      );
    }

    error = this.props.connectionHandler.add(this);
    if (error) {
      console.error(
        `network_status_component: failed to register for connection changes: ${error}`,
      );
    }
  }

  override componentWillUnmount() {
    let error: Error | null = null;

    error = this.props.registrationStore.remove(this);
    if (error) {
      console.error(
        `network_status_component: failed to unregister for registration changes: ${error}`,
      );
    }

    error = this.props.connectionHandler.remove(this);
    if (error) {
      console.error(
        `network_status_component: failed to unregister for connection changes: ${error}`,
      );
    }

    this.setState({
      expanded: false,
      connected: false,
      data: null,
    });
  }

  render() {
  }

  notifyChanged() {
    const rawRegistrationData = this.props.registrationStore.getData();
    const networkData = NetworkStatusComponent.formatNetworkData(rawRegistrationData);

    this.setState({
      ...this.state,
      data: networkData,
    });
  }

  handleConnected(): void {
    this.setState({
      ...this.state,
      connected: true,
    });
  }

  handleDisconnected(): void {
    this.setState({
      ...this.state,
      connected: false,
    });
  }

  private toggleExpanded = () => {
    this.setState({
      ...this.state,
      expanded: !this.state.expanded,
    });
  };

  private static formatNetworkData(src: Record<string, any>): NetworkData | null {
    const opMode = src["network_op_mode"];
    if (opMode == undefined) {
      return null;
    }

    if (opMode == "ap") {
      return new WiFiApData(
        src["network_ap_channel"] ?? 0,
        src["network_ap_curr_conn"] ?? 0,
        src["network_ap_max_conn"] ?? 0,
      );
    }

    if (opMode == "sta") {
      return new WiFiStaData(
        src["network_sta_ip"] ?? "None",
        src["network_sta_rssi"] ?? 0,
        src["network_sta_ssid"] ?? "None",
        src["network_sta_signal_strength"] ?? "None",
      );
    }

    return null;
  }

  private getDeviceStatus(): {
    status: "online" | "offline";
    statusText: string;
  } {
    if (this.state.connected) {
      return { status: "online", statusText: "Online" };
    }

    return { status: "offline", statusText: "Offline" };
  }
}
