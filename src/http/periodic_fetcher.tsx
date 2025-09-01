import { Fetcher } from "./fetcher";
import { FetchHandler } from "./fetch_handler";

export class PeriodicFetcher {
  constructor(handler: FetchHandler, fetcher: Fetcher, interval: number) {
    this.fetcher = fetcher;
    this.handler = handler;
    this.interval = interval;
    this.timer = 0;
  }

  async start() {
    await this.fetchData();

    this.timer = setInterval(this.fetchData, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private fetchData = async () => {
    const result = await this.fetcher.fetch();
    if (result.error) {
      console.error(
        `periodic-fetcher: failed to fetch data: err=${result.error}`,
      );

      return;
    }

    this.handler.handleFetched(result.data!);
  };

  private interval: number;
  private fetcher: Fetcher;
  private handler: FetchHandler;

  private timer: number;
}
