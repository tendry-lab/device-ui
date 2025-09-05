// Various sensor characteristics.
export type AnalogSensorData = {
  raw: number;
  voltage: number;
  moisture: number;
  prev_status: string;
  curr_status: string;
  prev_status_dur: number;
  curr_status_dur: number;
  write_count: number;
  status_progress: number;
};
