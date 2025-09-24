import { Component } from "preact";

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { DataStore } from "@device-ui/lib/device/data_store";
import { TimeOps } from "@device-ui/lib/algo/time_ops";
import { ConnectionHandler } from "@device-ui/lib/device/connection_handler";
import { FanoutConnectionHandler } from "@device-ui/lib/device/fanout_connection_handler";
import { Notificator } from "@device-ui/lib/system/notificator";
import { Config } from "@device-ui/lib/device/config";

import { FormConfigComponent } from "@device-ui/ui/preact/form_config_component";

import "@device-ui/ui/preact/system_status_component.css";

export type SystemStatusComponentProps = {
  // Telemetry store to receive latest telemetry data.
  telemetryStore: DataStore;

  // Registration store to receive latest registration data.
  registrationStore: DataStore;

  // Connection handler to receive the device connection status.
  connectionHandler: FanoutConnectionHandler;

  // Notificator to send various notifications.
  notificator: Notificator;

  // Config to configure the mDNS.
  mDNSConfig: Config;

  // Config to configure the UNIX time.
  systemTimeConfig: Config;
};

class TelemetryData {
  constructor(
    readonly lifetime: number = 0,
    readonly uptime: number = 0,
    readonly memoryHeap: number = 0,
    readonly memoryHeapMin: number = 0,
    readonly resetReason: string = "",
    readonly timestamp: number = 0,
  ) {}
}

class RegistrationData {
  constructor(
    readonly deviceID: string = "",
    readonly toolchainName: string = "",
    readonly toolchainVersion: string = "",
    readonly fwName: string = "",
    readonly fwVersion: string = "",
    readonly fwDescription: string = "",
    readonly productName: string = "",
  ) {}
}

type SystemStatusComponentState = {
  expanded: boolean;
  connected: boolean;
  enableConfiguration: boolean;
  config: Config | null;
  telemetry: TelemetryData | null;
  registration: RegistrationData | null;
  showCopied: boolean;
};

// Format memory from bytes to KB
function formatMemory(bytes: number): string {
  return Math.round(bytes / 1024) + "KB";
}

// Format reset reason to human readable
function formatResetReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    RST_POWERON: "Power On",
    RST_SW: "Software",
    RST_PANIC: "Panic",
    RST_WDT: "Watchdog",
    RST_DEEPSLEEP: "Deep Sleep",
    RST_BROWNOUT: "Brownout",
    RST_SDIO: "SDIO",
  };
  return reasonMap[reason] || reason;
}

export class SystemStatusComponent
  extends Component<SystemStatusComponentProps, SystemStatusComponentState>
  implements ObjectMonitor, ConnectionHandler
{
  constructor(props: SystemStatusComponentProps) {
    super(props);

    this.state = {
      expanded: false,
      connected: false,
      enableConfiguration: false,
      config: null,
      telemetry: null,
      registration: null,
      showCopied: false,
    };
  }

  override async componentDidMount() {
    let error: Error | null = null;

    error = this.props.telemetryStore.add(this);
    if (error) {
      console.error(
        `system_status_component: failed to register for telemetry changes: ${error}`,
      );
    }

    error = this.props.registrationStore.add(this);
    if (error) {
      console.error(
        `system_status_component: failed to register for registration changes: ${error}`,
      );
    }

    error = this.props.connectionHandler.add(this);
    if (error) {
      console.error(
        `system_status_component: failed to register for connection changes: ${error}`,
      );
    }
  }

  override componentWillUnmount() {
    let error: Error | null = null;

    error = this.props.telemetryStore.remove(this);
    if (error) {
      console.error(
        `system_status_component: failed to unregister for telemetry changes: ${error}`,
      );
    }

    error = this.props.registrationStore.remove(this);
    if (error) {
      console.error(
        `system_status_component: failed to unregister for registration changes: ${error}`,
      );
    }

    error = this.props.connectionHandler.remove(this);
    if (error) {
      console.error(
        `system_status_component: failed to unregister for connection changes: ${error}`,
      );
    }

    this.setState({
      expanded: false,
      connected: false,
      enableConfiguration: false,
      config: null,
      telemetry: null,
      registration: null,
      showCopied: false,
    });
  }

  render() {
    if (!this.state.telemetry && !this.state.registration) {
      return (
        <div className="system-status-card">
          <div className="system-status-header">
            <div className="system-status-title-row">
              <h3 className="system-status-title">System Status</h3>
            </div>
            <p className="system-status-loading">Loading device data...</p>
          </div>
        </div>
      );
    }

    const deviceStatus = this.getDeviceStatus();
    const statusClass = `status-${deviceStatus.status}`;

    return (
      <div className="system-status-card">
        {/* Header - always visible */}
        <div
          className={`system-status-header ${this.state.expanded ? "expanded" : ""}`}
          onClick={this.toggleExpanded}
        >
          <div className="system-status-title-row">
            <h3 className="system-status-title">System Status</h3>
            <div
              className={`devui-expand-arrow ${this.state.expanded ? "expanded" : ""}`}
            />
          </div>

          {/* Status display */}
          <div className="status-row">
            <div className={`status-indicator ${statusClass}`} />
            <span className={`status-text ${statusClass}`}>
              {deviceStatus.statusText}
            </span>
          </div>

          {/* Primary info - most important metrics */}
          <div className="primary-info">
            {this.state.registration && (
              <button
                className="device-id-button"
                onClick={this.copyDeviceId}
                title="Copy full device ID"
                type="button"
              >
                ID: {this.state.registration.deviceID.substring(0, 12)}{" "}
                {this.state.showCopied ? "(Copied)" : ""}
              </button>
            )}
            {this.state.registration && (
              <span>Version: {this.state.registration.fwVersion}</span>
            )}
            {this.state.telemetry && (
              <span>
                Uptime: {TimeOps.formatDuration(this.state.telemetry.uptime)}
              </span>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {this.state.expanded && (
          <div className="system-status-details">
            <div className="details-grid">
              {this.state.telemetry && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">Lifetime</div>
                    <div className="detail-value">
                      {TimeOps.formatDuration(this.state.telemetry.lifetime)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Timestamp</div>
                    <div className="detail-value">
                      {this.state.telemetry.timestamp}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Memory Free</div>
                    <div className="detail-value">
                      {formatMemory(this.state.telemetry.memoryHeap)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Memory Min</div>
                    <div className="detail-value">
                      {formatMemory(this.state.telemetry.memoryHeapMin)}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Reset Reason</div>
                    <div className="detail-value">
                      {formatResetReason(this.state.telemetry.resetReason)}
                    </div>
                  </div>
                </>
              )}

              {this.state.registration && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">ESP-IDF</div>
                    <div className="detail-value">
                      {this.state.registration.toolchainVersion}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Firmware</div>
                    <div className="detail-value">
                      {this.state.registration.fwName}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Product</div>
                    <div className="detail-value">
                      {this.state.registration.productName}
                    </div>
                  </div>
                </>
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

        {this.state.expanded && !this.state.enableConfiguration && (
          <>
            <div className="devui-configure-button-container">
              <button
                onClick={this.handleConfigBeginMdns}
                className="devui-configure-button"
              >
                Configure mDNS
              </button>
            </div>

            <div className="devui-configure-button-container">
              <button
                onClick={this.handleConfigBeginSystemTime}
                className="devui-configure-button"
              >
                Configure System Time
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  notifyChanged() {
    const rawTelemetryData = this.props.telemetryStore.getData();
    const telemetryData = rawTelemetryData
      ? SystemStatusComponent.formatTelemetryData(rawTelemetryData)
      : null;

    const rawRegistrationData = this.props.registrationStore.getData();
    const registrationData = rawRegistrationData
      ? SystemStatusComponent.formatRegistrationData(rawRegistrationData)
      : null;

    this.setState({
      ...this.state,
      telemetry: telemetryData,
      registration: registrationData,
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
      enableConfiguration: false,
    });
  };

  private handleConfigBeginMdns = () => {
    this.setState({
      ...this.state,
      enableConfiguration: true,
      config: this.props.mDNSConfig,
    });
  };

  private handleConfigBeginSystemTime = () => {
    this.setState({
      ...this.state,
      enableConfiguration: true,
      config: this.props.systemTimeConfig,
    });
  };

  private handleConfigEnd = () => {
    this.setState({
      ...this.state,
      enableConfiguration: false,
      config: null,
    });
  };

  private copyDeviceId = async (e: Event) => {
    e.stopPropagation(); // Prevent card expansion/collapse

    if (!this.state.registration?.deviceID) {
      return;
    }

    // Remove focus from element
    (e.target as HTMLButtonElement).blur();

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.state.registration.deviceID);
      } else {
        // Fallback for Safari/older browsers
        const textArea = document.createElement("textarea");
        textArea.value = this.state.registration.deviceID;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);

        // Prevent scroll on focus
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        textArea.focus({ preventScroll: true });
        textArea.select();

        // Restore scroll position if it changed
        window.scrollTo(0, scrollTop);

        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      // Show "Copied" feedback
      this.setState({ ...this.state, showCopied: true });

      // Reset after 1.5 seconds
      setTimeout(() => {
        this.setState({ ...this.state, showCopied: false });
      }, 1500);
    } catch (error) {
      console.error(
        "system_status_component: failed to copy device ID:",
        error,
      );
    }
  };

  private static formatTelemetryData(src: Record<string, any>): TelemetryData {
    return new TelemetryData(
      src["c_sys_lifetime"] ?? 0,
      src["c_sys_uptime"] ?? 0,
      src["system_memory_heap"] ?? 0,
      src["system_memory_heap_min"] ?? 0,
      src["system_reset_reason"] ?? 0,
      src["timestamp"] ?? 0,
    );
  }

  private static formatRegistrationData(
    src: Record<string, any>,
  ): RegistrationData {
    return new RegistrationData(
      src["device_id"] ?? "None",
      src["toolchain_name"] ?? "None",
      src["toolchain_version"] ?? "None",
      src["fw_name"] ?? "None",
      src["fw_version"] ?? "None",
      src["fw_description"] ?? "None",
      src["product_name"] ?? "None",
    );
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
