import { useState } from "preact/hooks";

import { SystemTelemetryData } from "@device-ui/lib/device/data_types";

// System telemetry settings used during the rendering process.
export type SystemTelemetryProps = {
  data: SystemTelemetryData;
};

// System telemetry data rendering.
export function SystemTelemetryComponent({ data }: SystemTelemetryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        margin: "10px 0",
        padding: "10px",
        textAlign: "left",
      }}
    >
      <div style={{ cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <h3>System Telemetry</h3>
        <p>Uptime: {data.uptime}</p>
        <p>Lifetime: {data.lifetime}</p>
        <p>Timestamp: {data.timestamp}</p>
      </div>

      {expanded && (
        <ul>
          <li>Heap: {data.heap}</li>
          <li>Heap Min: {data.heapMin}</li>
          <li>Heap Internal: {data.heapInternal}</li>
          <li>Reset: {data.resetReason}</li>
        </ul>
      )}
    </div>
  );
}
