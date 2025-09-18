import { ErrorHandler } from "@device-ui/lib/scheduler/error_handler";
import { Runner } from "@device-ui/lib/scheduler/runner";

export class PeriodicRunner {
  // Initialize.
  //
  // @params
  //  - @p runner to run periodically.
  //  - @p handler to handle errors.
  //  - @p interval - how often to run the underlying runner, in milliseconds.
  constructor(
    private runner: Runner,
    private handler: ErrorHandler | null,
    private readonly interval: number,
  ) {
    if (interval == undefined || interval <= 0) {
      throw new Error(`invalid interval: ${interval}`);
    }
  }

  // Start periodic operational loop.
  async start() {
    this.stop();

    await this.handleRun();

    this.timer = setInterval(this.handleRun, this.interval);
  }

  // Stop periodic operational loop.
  stop() {
    if (this.timer) {
      clearInterval(this.timer);

      this.timer = 0;
    }
  }

  private handleRun = async () => {
    const error = await this.runner.run();
    if (this.handler) {
      this.handler.handleError(error!);
    }
  };

  private timer: number = 0;
}
