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
  constructor(props: TelemetryProps) {
    super(props);

    this.soilSensorConfig = new HTTPConfig(
      new JSONFormatter(),
      `${this.props.baseURL}/config/sensor/analog?id=soil_a0`,
    );

    this.notificator = new DefaultNotificator();
  }

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
          config={this.soilSensorConfig}
          notificator={this.notificator}
        />
        <SystemTelemetry data={system_telemetry} />
      </div>
    );
  }

  private soilSensorConfig: Config;
  private notificator: Notificator;
}
