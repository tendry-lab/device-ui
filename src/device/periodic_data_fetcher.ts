import { ObjectMonitor } from "../core/object_monitor";
import { ArrayQueue } from "../core/array_queue";
import { Formatter } from "../fmt/formatter";
import { Fetcher } from "../http/fetcher";
import { FetchHandler } from "../http/fetch_handler";
import { PeriodicFetcher } from "../http/periodic_fetcher";

// Periodically fetches data from the source.
export class PeriodicDataFetcher
  extends ArrayQueue<ObjectMonitor>
  implements FetchHandler
{
  // Initialize.
  //
  // @params
  //  - @p fetcher to fetch actual data.
  //  - @p formatter to format fetched data.
  //  - @p interval - how often to fetch data.
  constructor(fetcher: Fetcher, formatter: Formatter, interval: number) {
    super();

    this.formatter = formatter;
    this.periodicFetcher = new PeriodicFetcher(this, fetcher, interval);
  }

  // Start fetching data periodically.
  async start() {
    this.stopped = false;

    this.periodicFetcher.start();
  }

  // Stop fetching data periodically.
  stop() {
    this.stopped = true;

    this.periodicFetcher.stop();
  }

  // Return formated key-value data.
  getData(): Record<string, any> | null {
    return this.data;
  }

  // Notify registered object monitors about new data.
  handleFetched(data: Uint8Array): void {
    if (this.stopped) {
      return;
    }

    const result = this.formatter.format(data);
    if (result.error) {
      console.error(
        `periodic_data_fetcher: failed to format data: err=${result.error}`,
      );

      return;
    }

    this.data = result.data;

    this.forEach((monitor) => {
      monitor.notifyChanged();
    });
  }

  private formatter: Formatter;
  private periodicFetcher: PeriodicFetcher;

  private data: Record<string, any> | null = null;
  private stopped: boolean = false;
}
