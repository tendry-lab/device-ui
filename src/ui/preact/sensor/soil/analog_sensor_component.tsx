import { Component } from "preact";

import { FormConfigComponent } from "@device-ui/ui/preact/form_config_component";
import { Config } from "@device-ui/lib/device/config";
import { Notificator } from "@device-ui/lib/system/notificator";
import { DataStore } from "@device-ui/lib/device/data_store";
import { TimeOps } from "@device-ui/lib/algo/time_ops";

import "./analog_sensor_component.css";

class SensorData {
  constructor(
    readonly raw: number,
    readonly voltage: number,
    readonly moisture: number,
    readonly prevStatus: string,
    readonly currStatus: string,
    readonly prevStatusDur: number,
    readonly currStatusDur: number,
    readonly writeCount: number,
    readonly statusProgress: number,
  ) {}
}

// Get CSS class for status styling.
function getStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    None: "status-none",
    Saturated: "status-saturated",
    Wet: "status-wet",
    Depletion: "status-depletion",
    Dry: "status-dry",
    Error: "status-error",
  };
  return statusMap[status] || "status-none";
}

type analogSensorState = {
  data: SensorData | null;
  expanded: boolean;
  enableCalibration: boolean;
};

// Sensor settings used during the rendering process.
export type AnalogSensorComponentProps = {
  // Sensor card title.
  title: string;

  // Prefix of the sensor's data keys in telemetry.
  prefix: string;

  // Store to get the device data.
  store: DataStore;

  // Config to configure the sensor.
  config: Config;

  // Notificator to send various notifications.
  notificator: Notificator;
};

// Analog soil sensor rendering.
export class AnalogSensorComponent extends Component<
  AnalogSensorComponentProps,
  analogSensorState
> {
  constructor(props: AnalogSensorComponentProps) {
    super(props);

    this.state = {
      data: null,
      expanded: false,
      enableCalibration: false,
    };
  }

  override async componentDidMount() {
    const error = this.props.store.add(this);
    if (error) {
      console.error(
        `analog_sensor_component: failed to register for data changes: ${error}`,
      );
    }
  }

  override componentWillUnmount() {
    const error = this.props.store.remove(this);
    if (error) {
      console.error(
        `analog_sensor_component: failed to unregister for data changes: ${error}`,
      );
    }

    this.setState({
      data: null,
      expanded: false,
      enableCalibration: false,
    });
  }

  notifyChanged() {
    const data = this.props.store.getData();
    if (!data) {
      return;
    }

    this.setState({
      ...this.state,
      data: AnalogSensorComponent.parseData(this.props.prefix, data),
    });
  }

  render() {
    if (!this.state.data) {
      return <p>Loading sensor data...</p>;
    }

    const statusClass = getStatusClass(this.state.data.currStatus);
    const prevStatusClass = getStatusClass(this.state.data.prevStatus);

    return (
      <div className="sensor-card">
        {/* Header - always visible */}
        <div
          className={`sensor-header ${this.state.expanded ? "expanded" : ""}`}
          onClick={this.toggleExpanded}
        >
          <div className="sensor-title-row">
            <h3 className="sensor-title">{this.props.title}</h3>
            <div
              className={`expand-arrow ${this.state.expanded ? "expanded" : ""}`}
            />
          </div>

          {/* Moisture percentage - prominent display */}
          <div className="moisture-display">
            <span className="moisture-value">
              {this.state.data.moisture.toFixed(1)}
            </span>
            <span className="moisture-unit">%</span>
          </div>

          {/* Main status display */}
          <div className="status-row">
            <div className={`status-indicator ${statusClass}`} />
            <span className={`status-text ${statusClass}`}>
              {this.state.data.currStatus}
            </span>
            <span className="status-duration">
              for {TimeOps.formatDuration(this.state.data.currStatusDur)}
            </span>
            <div className="progress-info">
              Progress: {this.state.data.statusProgress}%
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {this.state.expanded && (
          <div className="sensor-details">
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Raw Value</div>
                <div className="detail-value">{this.state.data.raw}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Voltage</div>
                <div className="detail-value">{this.state.data.voltage}mV</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Write Count</div>
                <div className="detail-value">
                  {this.state.data.writeCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Previous status */}
            <div className="previous-status">
              <div className="detail-label">Previous Status</div>
              <div className="prev-status-row">
                <div className={`prev-status-indicator ${prevStatusClass}`} />
                <span className="prev-status-text">
                  {this.state.data.prevStatus}
                </span>
                <span className="prev-status-duration">
                  ({TimeOps.formatDuration(this.state.data.prevStatusDur)})
                </span>
              </div>
            </div>

            {/* Calibration mode */}
            {this.state.enableCalibration && (
              <FormConfigComponent
                config={this.props.config}
                ignoreKeys={["bitwidth"]}
                onClose={this.handleConfigEnd}
                notificator={this.props.notificator}
              />
            )}
          </div>
        )}

        {this.state.expanded && !this.state.enableCalibration && (
          <div className="config-button-container">
            <button onClick={this.handleConfigBegin} className="config-button">
              Configure
            </button>
          </div>
        )}
      </div>
    );
  }

  private static parseData(
    prefix: string,
    data: Record<string, any>,
  ): SensorData {
    return new SensorData(
      data[`${prefix}_raw`] ?? 0,
      data[`${prefix}_voltage`] ?? 0,
      data[`${prefix}_moisture`] ?? 0,
      data[`${prefix}_prev_status`] ?? "None",
      data[`${prefix}_curr_status`] ?? "None",
      data[`${prefix}_prev_status_dur`] ?? 0,
      data[`${prefix}_curr_status_dur`] ?? 0,
      data[`${prefix}_write_count`] ?? 0,
      data[`${prefix}_status_progress`] ?? 0,
    );
  }

  // Note: use arrow function to properly capture `this`.
  private handleConfigEnd = () => {
    this.setState({
      ...this.state,
      expanded: false,
      enableCalibration: false,
    });
  };

  // Note: use arrow function to properly capture `this`.
  private handleConfigBegin = () => {
    this.setState({
      ...this.state,
      expanded: true,
      enableCalibration: true,
    });
  };

  // Note: use arrow function to properly capture `this`.
  private toggleExpanded = () => {
    const wasExpanded = this.state.expanded;

    this.setState({
      ...this.state,
      expanded: !wasExpanded,
      enableCalibration: false,
    });
  };
}
