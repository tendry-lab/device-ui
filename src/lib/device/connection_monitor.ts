import { ConnectionHandler } from "@device-ui/lib/device/connection_handler";
import { TimestampHolder } from "@device-ui/lib/device/timestamp_holder";
import { SystemClock } from "@device-ui/lib/system/system_clock";
import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { Runner } from "@device-ui/lib/scheduler/runner";

export class ConnectionMonitor implements ObjectMonitor, Runner {
  // Initialize.
  //
  // @params
  //  - clock to measure if the data is received from the device within the threshold.
  //  - handler to notify about the connection status.
  //  - holder to receive latest device timestamp.
  //  - threshold at which it is required to receive telemetry from the device;
  //    otherwise, the device is considered disconnected, in seconds.
  constructor(
    private clock: SystemClock,
    private handler: ConnectionHandler,
    private holder: TimestampHolder,
    private threshold: number,
  ) {}

  notifyChanged(): void {
    const timestampResult = this.clock.getTimestamp();
    if (timestampResult.error) {
      console.error(
        `connection_monitor: failed to receive time: ${timestampResult.error}`,
      );

      return;
    }

    this.timestamp = timestampResult.timestamp;

    const error = this.update();
    if (error) {
      console.error(`connection_monitor: failed to update: ${error}`);
    }
  }

  async run(): Promise<Error | null> {
    return this.update();
  }

  private update(): Error | null {
    const timestamp = this.holder.getTimestamp();
    if (timestamp == -1) {
      if (this.connected) {
        this.handleDisconnected();
      }

      return null;
    }

    const timestampResult = this.clock.getTimestamp();
    if (timestampResult.error) {
      return timestampResult.error;
    }

    const diff = Math.abs(timestampResult.timestamp - this.timestamp);
    if (diff < this.threshold) {
      if (!this.connected) {
        this.handleConnected();
      }
    } else {
      if (this.connected) {
        this.handleDisconnected();
      }
    }

    return null;
  }

  private handleConnected(): void {
    this.connected = true;
    this.handler.handleConnected();
  }

  private handleDisconnected(): void {
    this.connected = false;
    this.handler.handleDisconnected();
  }

  private connected: boolean = false;
  private timestamp: number = -1;
}
