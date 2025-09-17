import { Component } from "preact";

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { PeriodicDataFetcher } from "@device-ui/lib/device/periodic_data_fetcher";
import { TimeOps } from "@device-ui/lib/algo/time_ops";
import { ConnectionHandler } from "@device-ui/lib/device/connection_handler";
import { FanoutConnectionHandler } from "@device-ui/lib/device/fanout_connection_handler";

import "@device-ui/ui/preact/device_status_component.css";

export type DeviceStatusComponentProps = {
  // Telemetry fetcher to receive latest telemetry data.
  telemetryFetcher: PeriodicDataFetcher;

  // Registration fetcher to receive latest registration data.
  registrationFetcher: PeriodicDataFetcher;

  // Connection handler to receive the device connection status.
  connectionHandler: FanoutConnectionHandler;
};

class TelemetryData {
  constructor(
    public readonly lifetime: number = 0,
    public readonly uptime: number = 0,
    public readonly memoryHeap: number = 0,
    public readonly memoryHeapMin: number = 0,
    public readonly resetReason: string = "",
    public readonly timestamp: number = 0,
  ) {}
}

class RegistrationData {
  constructor(
    public readonly deviceID: string = "",
    public readonly toolchainName: string = "",
    public readonly toolchainVersion: string = "",
    public readonly fwName: string = "",
    public readonly fwVersion: string = "",
    public readonly fwDescription: string = "",
    public readonly productName: string = "",
  ) {}
}

type DeviceStatusComponentState = {
  expanded: boolean;
  connected: boolean;
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

// Determine online status based on data freshness
export class DeviceStatusComponent
  extends Component<DeviceStatusComponentProps, DeviceStatusComponentState>
  implements ObjectMonitor, ConnectionHandler
{
  constructor(props: DeviceStatusComponentProps) {
    super(props);

    this.state = {
      expanded: false,
      connected: false,
      telemetry: null,
      registration: null,
      showCopied: false,
    };
  }

  async componentDidMount() {
    let error: Error | null = null;

    error = this.props.telemetryFetcher.add(this);
    if (error) {
      console.error(
        `device_status_component: failed to register for telemetry changes: ${error}`,
      );
    }

    error = this.props.registrationFetcher.add(this);
    if (error) {
      console.error(
        `device_status_component: failed to register for registration changes: ${error}`,
      );
    }

    error = this.props.connectionHandler.add(this);
    if (error) {
      console.error(
        `device_status_component: failed to register for connection changes: ${error}`,
      );
    }
  }

  componentWillUnmount() {
    let error: Error | null = null;

    error = this.props.telemetryFetcher.remove(this);
    if (error) {
      console.error(
        `device_status_component: failed to unregister for telemetry changes: ${error}`,
      );
    }

    error = this.props.registrationFetcher.remove(this);
    if (error) {
      console.error(
        `device_status_component: failed to unregister for registration changes: ${error}`,
      );
    }

    error = this.props.connectionHandler.remove(this);
    if (error) {
      console.error(
        `device_status_component: failed to unregister for connection changes: ${error}`,
      );
    }

    this.setState({
      expanded: false,
      connected: false,
      telemetry: null,
      registration: null,
      showCopied: false,
    });
  }

  render() {
    if (!this.state.telemetry && !this.state.registration) {
      return (
        <div className="device-status-card">
          <div className="device-status-header">
            <div className="device-status-title-row">
              <h3 className="device-status-title">Device Status</h3>
            </div>
            <p className="device-status-loading">Loading device data...</p>
          </div>
        </div>
      );
    }

    const deviceStatus = this.getDeviceStatus();
    const statusClass = `status-${deviceStatus.status}`;

    return (
      <div className="device-status-card">
        {/* Header - always visible */}
        <div
          className={`device-status-header ${this.state.expanded ? "expanded" : ""}`}
          onClick={this.toggleExpanded}
        >
          <div className="device-status-title-row">
            <h3 className="device-status-title">Device Status</h3>
            <div
              className={`expand-arrow ${this.state.expanded ? "expanded" : ""}`}
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
          <div className="device-status-details">
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
          </div>
        )}
      </div>
    );
  }

  notifyChanged() {
    const rawTelemetryData = this.props.telemetryFetcher.getData();
    const telemetryData = rawTelemetryData
      ? DeviceStatusComponent.formatTelemetryData(rawTelemetryData)
      : null;

    const rawRegistrationData = this.props.registrationFetcher.getData();
    const registrationData = rawRegistrationData
      ? DeviceStatusComponent.formatRegistrationData(rawRegistrationData)
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
        "device_status_component: failed to copy device ID:",
        error,
      );
    }
  };

  private static formatTelemetryData(src: Record<string, any>): TelemetryData {
    return new TelemetryData(
      src["c_sys_lifetime"],
      src["c_sys_uptime"],
      src["system_memory_heap"],
      src["system_memory_heap_min"],
      src["system_reset_reason"],
      src["timestamp"],
    );
  }

  private static formatRegistrationData(
    src: Record<string, any>,
  ): RegistrationData {
    return new RegistrationData(
      src["device_id"],
      src["toolchain_name"],
      src["toolchain_version"],
      src["fw_name"],
      src["fw_version"],
      src["fw_description"],
      src["product_name"],
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
