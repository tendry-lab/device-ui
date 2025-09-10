import { Formatter } from "../fmt/formatter";
import { Config } from "./config";
import { HTTPOps } from "./../algo/http_ops";
import { HTTPFetcher } from "./../http/http_fetcher";

// Read configuration over HTTP.
export class HTTPConfig implements Config {
  constructor(formatter: Formatter, url: string) {
    this.url = url;
    this.formatter = formatter;
  }

  async read(): Promise<{
    data: Record<string, any> | null;
    error: Error | null;
  }> {
    const fetcher = new HTTPFetcher(this.url);

    const fetchResult = await fetcher.fetch();
    if (fetchResult.error) {
      return { data: null, error: fetchResult.error };
    }

    const formatResult = this.formatter.format(fetchResult.data!);
    if (formatResult.error) {
      return { data: null, error: formatResult.error };
    }

    return { data: formatResult.data, error: null };
  }

  async write(data: Record<string, any>): Promise<Error | null> {
    const result = HTTPOps.addQueryParams(this.url, data);
    if (result.error) {
      return result.error;
    }

    const fetcher = new HTTPFetcher(result.url!);

    const fetchResult = await fetcher.fetch();
    if (fetchResult.error) {
      return fetchResult.error;
    }

    let err: Error | null = null;

    try {
      const text = new TextDecoder().decode(fetchResult.data!);
      if (text != "OK") {
        err = new Error(`http_config: write failed, invalid response: ${text}`);
      }
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return err;
  }

  async reset(): Promise<Error | null> {
    return this.write({ reset: 1 });
  }

  private url: string;
  private formatter: Formatter;
}
