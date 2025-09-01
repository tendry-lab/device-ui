import { Component } from "preact";

import { AnalogSensor, AnalogSensorData } from "./sensor/soil/analog_sensor";
import { JSONTelemetryParser } from "./parser/json_telemetry_parser";
import { SystemTelemetry, SystemTelemetryData } from "./system/telemetry";
import { Config } from "./config/config";
import { HTTPConfig } from "./config/http_config";
import { JSONFormatter } from "./config/json_formatter";
import { Notificator } from "./system/notificator";
import { DefaultNotificator } from "./system/default_notificator";

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

    const soilSensorConfig = new HTTPConfig(
      new JSONFormatter(),
      `${this.props.baseURL}/config/sensor/analog?id=soil_a0`,
    );

    const notificator: Notificator = new DefaultNotificator();

    return (
      <div>
        <AnalogSensor
          title="Moisture"
          data={sensor_data}
          config={soilSensorConfig}
          notificator={notificator}
        />
        <SystemTelemetry data={system_telemetry} />
      </div>
    );
  }
}
