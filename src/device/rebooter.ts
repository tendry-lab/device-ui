export interface Rebooter {
  // Reboot the device.
  reboot(): Promise<Error | null>;
}
