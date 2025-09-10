export interface Locator {
  // Flip device locating.
  flip(): Promise<Error | null>;

  // Enable device locating.
  turnOn(): Promise<Error | null>;

  // Disable device locating.
  turnOff(): Promise<Error | null>;
}
