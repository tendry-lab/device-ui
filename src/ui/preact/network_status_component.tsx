import { Component } from "preact";

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { DataStore } from "@device-ui/lib/device/data_store";
import { Config } from "@device-ui/lib/device/config";
import { Notificator } from "@device-ui/lib/system/notificator";
import { NetworkConfigBuilder } from "@device-ui/lib/device/network_config_builder";
import { NetworkType } from "@device-ui/lib/device/types";

import { FormConfigComponent } from "@device-ui/ui/preact/form_config_component";

import "@device-ui/ui/preact/network_status_component.css";

export type NetworkStatusComponentProps = {
  // Registration store to receive latest registration data.
  registrationStore: DataStore;

  // Notificator to send various notifications.
  notificator: Notificator;

  // Builder to build network config.
  builder: NetworkConfigBuilder;
};

class WiFiStaData {
  constructor(
    readonly ip: string = "",
    readonly rssi: number = 0,
    readonly ssid: string = "",
    readonly signalStrength: string = "",
  ) {}
}

class WiFiApData {
  constructor(
    readonly channel: number = 0,
    readonly curConnNumber: number = 0,
    readonly maxConnNumber: number = 0,
  ) {}
}

type NetworkData = WiFiApData | WiFiStaData;

type NetworkStatusComponentState = {
  expanded: boolean;
  enableConfiguration: boolean;
  config: Config | null;
  data: NetworkData | null;
};

export class NetworkStatusComponent
  extends Component<NetworkStatusComponentProps, NetworkStatusComponentState>
  implements ObjectMonitor
{
  constructor(props: NetworkStatusComponentProps) {
    super(props);

    this.state = {
      expanded: false,
      enableConfiguration: false,
      config: null,
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
  }

  override componentWillUnmount() {
    let error: Error | null = null;

    error = this.props.registrationStore.remove(this);
    if (error) {
      console.error(
        `network_status_component: failed to unregister for registration changes: ${error}`,
      );
    }

    this.setState({
      expanded: false,
      enableConfiguration: false,
      config: null,
      data: null,
    });
  }

  render() {
    if (!this.state.data) {
      return (
        <div className="devui-component-card">
          <div className="devui-component-header">
            <div className="devui-component-title-row">
              <h3 className="devui-component-title">Network Status</h3>
            </div>
            <p className="devui-component-loading">Loading network data...</p>
          </div>
        </div>
      );
    }

    const isStaMode = this.state.data instanceof WiFiStaData;
    const isApMode = this.state.data instanceof WiFiApData;

    // Determine signal status for STA mode
    let signalStatus = "Unknown";
    let signalClass = "status-unknown";

    if (isStaMode) {
      const staData = this.state.data as WiFiStaData;
      signalStatus = staData.signalStrength;
      signalClass = `status-${staData.signalStrength.toLowerCase().replace(" ", "-")}`;
    }

    return (
      <div className="devui-component-card">
        {/* Header - always visible */}
        <div
          className={`devui-component-header ${this.state.expanded ? "expanded" : ""}`}
          onClick={this.toggleExpanded}
        >
          <div className="devui-component-title-row">
            <h3 className="devui-component-title">Network Status</h3>
            <div
              className={`devui-expand-arrow ${this.state.expanded ? "expanded" : ""}`}
            />
          </div>

          {/* Mode and Status display */}
          <div className="devui-component-row">
            <span
              className={`network-mode ${isStaMode ? "sta-mode" : isApMode ? "ap-mode" : ""}`}
            >
              {isStaMode ? "STA Mode" : isApMode ? "AP Mode" : "Unknown"}
            </span>
            {isStaMode && (
              <>
                <div className={`status-indicator ${signalClass}`} />
                <span className={`status-text ${signalClass}`}>
                  {signalStatus}
                </span>
              </>
            )}
          </div>

          {/* Primary info */}
          <div className="devui-component-primary-info">
            {isStaMode && <span>{(this.state.data as WiFiStaData).ip}</span>}
            {isApMode && (
              <span>
                Clients: {(this.state.data as WiFiApData).curConnNumber}/
                {(this.state.data as WiFiApData).maxConnNumber}
              </span>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {this.state.expanded && (
          <div className="devui-component-details">
            <div className="devui-component-details-grid">
              {isStaMode && (
                <>
                  <div className="devui-component-detail-item">
                    <div className="devui-component-detail-label">SSID</div>
                    <div className="devui-component-detail-value">
                      {(this.state.data as WiFiStaData).ssid}
                    </div>
                  </div>
                  <div className="devui-component-detail-item">
                    <div className="devui-component-detail-label">RSSI</div>
                    <div className="devui-component-detail-value">
                      {(this.state.data as WiFiStaData).rssi} dBm
                    </div>
                  </div>
                </>
              )}

              {isApMode && (
                <div className="devui-component-detail-item">
                  <div className="devui-component-detail-label">Channel</div>
                  <div className="devui-component-detail-value">
                    {(this.state.data as WiFiApData).channel}
                  </div>
                </div>
              )}
            </div>

            {/* Configuration mode */}
            {this.state.enableConfiguration && (
              <FormConfigComponent
                config={this.state.config!}
                onClose={this.handleConfigEnd}
                notificator={this.props.notificator}
              />
            )}
          </div>
        )}

        {isStaMode &&
          this.state.expanded &&
          !this.state.enableConfiguration && (
            <div className="devui-configure-button-container">
              <button
                onClick={this.handleConfigBeginWiFiSta}
                className="devui-configure-button"
              >
                Configure
              </button>
            </div>
          )}

        {isApMode && this.state.expanded && !this.state.enableConfiguration && (
          <>
            <div className="devui-configure-button-container">
              <button
                onClick={this.handleConfigBeginWiFiAp}
                className="devui-configure-button"
              >
                Configure WiFi AP
              </button>
            </div>
            <div className="devui-configure-button-container">
              <button
                onClick={this.handleConfigBeginWiFiSta}
                className="devui-configure-button"
              >
                Configure WiFi STA
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  notifyChanged() {
    let networkData: NetworkData | null = null;

    const rawRegistrationData = this.props.registrationStore.getData();
    if (rawRegistrationData) {
      networkData = NetworkStatusComponent.formatNetworkData(
        rawRegistrationData!,
      );
    }

    this.setState({
      ...this.state,
      data: networkData,
    });
  }

  private toggleExpanded = () => {
    this.setState({
      ...this.state,
      expanded: !this.state.expanded,
      enableConfiguration: false,
    });
  };

  // Note: use arrow function to properly capture `this`.
  private handleConfigEnd = () => {
    this.setState({
      ...this.state,
      config: null,
      enableConfiguration: false,
    });
  };

  // Note: use arrow function to properly capture `this`.
  private handleConfigBeginWiFiSta = () => {
    this.setState({
      ...this.state,
      enableConfiguration: true,
      config: this.props.builder.build(NetworkType.WiFiSTA),
    });
  };

  // Note: use arrow function to properly capture `this`.
  private handleConfigBeginWiFiAp = () => {
    this.setState({
      ...this.state,
      enableConfiguration: true,
      config: this.props.builder.build(NetworkType.WiFiAP),
    });
  };

  private static formatNetworkData(
    src: Record<string, any>,
  ): NetworkData | null {
    const opMode = src["network_op_mode"];
    if (opMode == undefined) {
      return null;
    }

    if (opMode == "ap") {
      return new WiFiApData(
        src["network_ap_channel"] ?? 0,
        src["network_ap_cur_conn"] ?? 0,
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
}
