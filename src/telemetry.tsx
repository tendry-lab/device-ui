import { Component } from "preact";

import { AnalogSensor, AnalogSensorData } from "./sensor/soil/analog_sensor";
import { JSONTelemetryParser } from "./parser/json_telemetry_parser";
import { SystemTelemetry, SystemTelemetryData } from "./system/telemetry";

export type TelemetryProps = {
  baseURL: string;
  data: Record<string, any> | null;
};

export class Telemetry extends Component<TelemetryProps> {
  render() {
    if (!this.props.data) {
      return <p>Loading telemetry data...</p>;
    }

    const sensor_data: AnalogSensorData =
      JSONTelemetryParser.parseAnalogSoilSensorData(
        "sensor_soil",
        this.props.data,
      );

    const system_telemetry: SystemTelemetryData =
      JSONTelemetryParser.parseSystemTelemetryData(this.props.data);

    return (
      <div>
        <AnalogSensor
          title="Moisture"
          data={sensor_data}
          baseURL={this.props.baseURL}
          id="soil_a0"
        />
        <SystemTelemetry data={system_telemetry} />
      </div>
    );
  }
}
