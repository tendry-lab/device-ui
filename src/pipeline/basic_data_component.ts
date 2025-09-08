import { Component } from "preact";

import { FetchHandler } from "../http/fetch_handler";
import { Fetcher } from "../http/fetcher";
import { Formatter } from "../fmt/formatter";
import { JSONFormatter } from "../fmt/json_formatter";
import { HTTPFetcher } from "../http/http_fetcher";
import { PeriodicFetcher } from "../http/periodic_fetcher";
import { Notificator } from "../system/notificator";

export type BasicDataComponentProps = {
  // Device API base URL.
  baseURL: string;

  // How often to fetch device data, in milliseconds.
  interval: number;

  // Notificator to send notifications.
  notificator: Notificator;
};

type basicDataComponentState = {
  data: Record<string, any> | null;
};

export abstract class BasicDataComponent
  extends Component<BasicDataComponentProps, basicDataComponentState>
  implements FetchHandler
{
  constructor(props: BasicDataComponentProps) {
    super(props);

    this.state = {
      data: null,
    };

    this.fetcher = new HTTPFetcher(`${this.props.baseURL}/telemetry`);
    this.formatter = new JSONFormatter();

    this.periodicFetcher = new PeriodicFetcher(
      this,
      this.fetcher,
      this.props.interval,
    );
  }

  handleFetched(data: Uint8Array): void {
    // Ignore notifications if the component has already been unmounted.
    if (!this.base) {
      return;
    }

    const result = this.formatter.format(data);
    if (result.error) {
      console.error(
        `telemetry-data-component: failed to format data: err=${result.error}`,
      );

      return;
    }

    this.setState({
      data: result.data!,
    });
  }

  async componentDidMount() {
    await this.periodicFetcher.start();
  }

  componentWillUnmount() {
    this.periodicFetcher.stop();

    this.setState({
      data: null,
    });
  }

  private fetcher: Fetcher;
  private formatter: Formatter;
  private periodicFetcher: PeriodicFetcher;
}
