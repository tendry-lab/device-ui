import { AnalogSensorData } from "./sensor/soil/data_types";
import { SystemTelemetryData } from "./data_types";

export class TelemetryParser {
  // Parse sensor data from @p data.
  static parseAnalogSoilSensorData(
    prefix: string,
    data: Record<string, any>,
  ): AnalogSensorData {
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

  // Parse system telemetry data from @p data.
  static parseSystemTelemetryData(
    data: Record<string, any>,
  ): SystemTelemetryData {
    return {
      uptime: data["c_sys_lifetime"],
      lifetime: data["c_sys_uptime"],
      heap: data["system_memory_heap"],
      heapMin: data["system_memory_heap_min"],
      heapInternal: data["system_memory_heap_internal"],
      resetReason: data["system_reset_reason"],
      timestamp: data["timestamp"],
    };
  }
}
