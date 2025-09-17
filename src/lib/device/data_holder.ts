export interface DataHolder {
  // Return the latest device data or null.
  getData(): Record<string, any> | null;
}
