import { useState } from "preact/hooks";

// Various device system telemetry.
export type SystemTelemetryData = {
  uptime: number;
  lifetime: number;
  heap: number;
  heapMin: number;
  heapInternal: number;
  resetReason: string;
  timestamp: number;
};

// System telemetry settings used during the rendering process.
export type SystemTelemetryProps = {
  data: SystemTelemetryData;
};

// System telemetry data rendering.
export function SystemTelemetry({ data }: SystemTelemetryProps) {
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
