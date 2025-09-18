import { Runner } from "@device-ui/lib/scheduler/runner";
import { Fetcher } from "@device-ui/lib/http/fetcher";
import { FetchHandler } from "@device-ui/lib/http/fetch_handler";

export class FetchRunner implements Runner {
  // Initialize.
  //
  // @params
  //  - @p fetcher to fetch the actual data.
  //  - @p handler to notify when data is received from @p fetcher.
  constructor(
    private fetcher: Fetcher,
    private handler: FetchHandler,
  ) {}

  // Fetch data and notify handler.
  async run(): Promise<Error | null> {
    const result = await this.fetcher.fetch();
    if (result.error) {
      return result.error;
    }

    this.handler.handleFetched(result.data!);

    return null;
  }
}
