import { Component } from "preact";

import { FormConfigComponent } from "@device-ui/ui/preact/form_config_component";
import { Config } from "@device-ui/lib/device/config";
import { Notificator } from "@device-ui/lib/system/notificator";
import { PeriodicDataFetcher } from "@device-ui/lib/device/periodic_data_fetcher";
import { TimeOps } from "@device-ui/lib/algo/time_ops";

import "./analog_sensor_component.css";

type sensorData = {
  raw: number;
  voltage: number;
  moisture: number;
  prev_status: string;
  curr_status: string;
  prev_status_dur: number;
  curr_status_dur: number;
  write_count: number;
  status_progress: number;
};

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
  data: sensorData | null;
  expanded: boolean;
  enableCalibration: boolean;
};

// Sensor settings used during the rendering process.
export type AnalogSensorComponentProps = {
  // Sensor card title.
  title: string;

  // Prefix of the sensor's data keys in telemetry.
  prefix: string;

  // Fetcher to fetch and format soil sensor data.
  fetcher: PeriodicDataFetcher;

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

  async componentDidMount() {
    const error = this.props.fetcher.add(this);
    if (error) {
      console.error(
        `analog_sensor_component: failed to register for data changes: ${error}`,
      );
    }
  }

  componentWillUnmount() {
    const error = this.props.fetcher.remove(this);
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
    const data = this.props.fetcher.getData();
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

    const statusClass = getStatusClass(this.state.data.curr_status);
    const prevStatusClass = getStatusClass(this.state.data.prev_status);

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
              {this.state.data.curr_status}
            </span>
            <span className="status-duration">
              for {TimeOps.formatDuration(this.state.data.curr_status_dur)}
            </span>
            <div className="progress-info">
              Progress: {this.state.data.status_progress}%
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
                  {this.state.data.write_count.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Previous status */}
            <div className="previous-status">
              <div className="detail-label">Previous Status</div>
              <div className="prev-status-row">
                <div className={`prev-status-indicator ${prevStatusClass}`} />
                <span className="prev-status-text">
                  {this.state.data.prev_status}
                </span>
                <span className="prev-status-duration">
                  ({TimeOps.formatDuration(this.state.data.prev_status_dur)})
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
  ): sensorData {
    return {
      curr_status: data[`${prefix}_curr_status`],
      curr_status_dur: data[`${prefix}_curr_status_dur`],
      prev_status: data[`${prefix}_prev_status`],
      prev_status_dur: data[`${prefix}_prev_status_dur`],
      moisture: data[`${prefix}_moisture`],
      raw: data[`${prefix}_raw`],
      status_progress: data[`${prefix}_status_progress`],
      voltage: data[`${prefix}_voltage`],
      write_count: data[`${prefix}_write_count`],
    };
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
