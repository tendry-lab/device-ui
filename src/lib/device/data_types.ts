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
