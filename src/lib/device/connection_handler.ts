export interface ConnectionHandler {
  // Connection with the device has been established.
  handleConnected(): void;

  // There is no connection to the device.
  handleDisconnected(): void;
}
