import { Component } from "preact";

import { FormConfigComponent } from "../../../config/form_config_component";
import { Config } from "../../../config/config";
import { Notificator } from "../../../system/notificator";
import { AnalogSensorData } from "../../../device/sensor/soil/data_types";

import "./analog_sensor_component.css";

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

// Format duration from seconds to readable format.
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;

  return `${secs}s`;
}

type analogSensorState = {
  expanded: boolean;
  enableCalibration: boolean;
};

// Sensor settings used during the rendering process.
export type AnalogSensorComponentProps = {
  title: string;
  data: AnalogSensorData;
  config: Config;
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
      expanded: false,
      enableCalibration: false,
    };
  }

  render() {
    const statusClass = getStatusClass(this.props.data.curr_status);
    const prevStatusClass = getStatusClass(this.props.data.prev_status);

    return (
      <div className="sensor-card">
        {/* Header - always visible */}
        <div
          className={`sensor-header ${this.state.expanded ? "expanded" : ""}`}
          onClick={this.toggleExpanded}
        >
          <div className="sensor-title-row">
            <h3 className="sensor-title">{this.props.title}</h3>
            <span
              className={`expand-arrow ${this.state.expanded ? "expanded" : ""}`}
            >
              ▶
            </span>
          </div>

          {/* Main status display */}
          <div className="status-row">
            <div className={`status-indicator ${statusClass}`}></div>
            <span className={`status-text ${statusClass}`}>
              {this.props.data.curr_status}
            </span>
            <span className="status-duration">
              for {formatDuration(this.props.data.curr_status_dur)}
            </span>
          </div>

          {/* Moisture percentage - prominent display */}
          <div className="moisture-display">
            <span className="moisture-value">
              {this.props.data.moisture.toFixed(1)}
            </span>
            <span className="moisture-unit">%</span>
            <div className="progress-info">
              Progress: {this.props.data.status_progress}%
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {this.state.expanded && (
          <div className="sensor-details">
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-label">Raw Value</div>
                <div className="detail-value">{this.props.data.raw}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Voltage</div>
                <div className="detail-value">{this.props.data.voltage}mV</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Write Count</div>
                <div className="detail-value">
                  {this.props.data.write_count.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Configuration button */}
            <div className="config-button-container">
              <button
                onClick={this.handleConfigBegin}
                className="config-button"
              >
                Configure
              </button>
            </div>

            {/* Previous status */}
            <div className="previous-status">
              <div className="detail-label">Previous Status</div>
              <div className="prev-status-row">
                <div
                  className={`prev-status-indicator ${prevStatusClass}`}
                ></div>
                <span className="prev-status-text">
                  {this.props.data.prev_status}
                </span>
                <span className="prev-status-duration">
                  ({formatDuration(this.props.data.prev_status_dur)})
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
      </div>
    );
  }

  // Note: use arrow function to properly capture `this`.
  private handleConfigEnd = () => {
    this.setState({
      expanded: false,
      enableCalibration: false,
    });
  };

  // Note: use arrow function to properly capture `this`.
  private handleConfigBegin = () => {
    this.setState({
      expanded: true,
      enableCalibration: true,
    });
  };

  // Note: use arrow function to properly capture `this`.
  private toggleExpanded = () => {
    const wasExpanded = this.state.expanded;

    this.setState({
      expanded: !wasExpanded,
      enableCalibration: false,
    });
  };
}
