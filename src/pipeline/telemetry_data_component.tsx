import { Component } from "preact";

import { JSONTelemetryParser } from "../device/json_telemetry_parser";
import { Config } from "../device/config";
import { HTTPConfig } from "../device/http_config";
import { Notificator } from "../system/notificator";
import { JSONFormatter } from "../fmt/json_formatter";
import { AnalogSensorData } from "../device/sensor/soil/data_types";
import { AnalogSensorComponent } from "./sensor/soil/analog_sensor_component";

import {
  BasicDataComponent,
  BasicDataComponentProps,
} from "./basic_data_component";

import { SystemTelemetryData } from "../device/data_types";
import { SystemTelemetryComponent } from "./system_telemetry_component";

export class TelemetryDataComponent extends BasicDataComponent {
  constructor(props: BasicDataComponentProps) {
    super(props);

    this.soilSensorConfig = new HTTPConfig(
      new JSONFormatter(),
      `${this.props.baseURL}/config/sensor/analog?id=soil_a0`,
    );
  }

  render() {
    if (!this.state.data) {
      return <p>Loading telemetry data...</p>;
    }

    const sensor_data: AnalogSensorData =
      JSONTelemetryParser.parseAnalogSoilSensorData(
        "sensor_soil",
        this.state.data,
      );

    const system_telemetry: SystemTelemetryData =
      JSONTelemetryParser.parseSystemTelemetryData(this.state.data);

    return (
      <div>
        <AnalogSensorComponent
          title="Moisture"
          data={sensor_data}
          config={this.soilSensorConfig}
          notificator={this.props.notificator}
        />

        <SystemTelemetryComponent data={system_telemetry} />
      </div>
    );
  }

  private soilSensorConfig: Config;
}
