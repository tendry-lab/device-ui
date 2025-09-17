import { ArrayQueue } from "@device-ui/lib/core/array_queue";
import { ConnectionHandler } from "@device-ui/lib/device/connection_handler";

export class FanoutConnectionHandler extends ArrayQueue<ConnectionHandler> {
  // Propogate the call to the underlying handlers.
  handleConnected(): void {
    this.forEach((handler) => {
      handler.handleConnected();
    });
  }

  // Propogate the call to the underlying handlers.
  handleDisconnected(): void {
    this.forEach((handler) => {
      handler.handleDisconnected();
    });
  }
}
