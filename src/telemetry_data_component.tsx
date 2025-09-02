import { AnalogSensor, AnalogSensorData } from "./sensor/soil/analog_sensor";
import { JSONTelemetryParser } from "./parser/json_telemetry_parser";
import { SystemTelemetry, SystemTelemetryData } from "./system/telemetry";
import { Config } from "./config/config";
import { HTTPConfig } from "./config/http_config";
import { Notificator } from "./system/notificator";
import { JSONFormatter } from "./fmt/json_formatter";
import {
  BasicDataComponent,
  BasicDataComponentProps,
} from "./pipeline/basic_data_component";

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
        <AnalogSensor
          title="Moisture"
          data={sensor_data}
          config={this.soilSensorConfig}
          notificator={this.props.notificator}
        />

        <SystemTelemetry data={system_telemetry} />
      </div>
    );
  }

  private soilSensorConfig: Config;
}
