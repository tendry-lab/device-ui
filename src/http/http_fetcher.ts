import { Fetcher } from "./fetcher";

export class HTTPFetcher implements Fetcher {
  constructor(url: string) {
    this.url = url;
  }

  async fetch(): Promise<{ data: Uint8Array | null; error: Error | null }> {
    let ret: Uint8Array | null = null;
    let err: Error | null = null;

    try {
      const response = await fetch(this.url);
      if (response.ok) {
        ret = await response.bytes();
      } else {
        err = new Error(
          `http_fetcher: failed to fetch data: ${response.statusText}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "unknown error";

      err = new Error(`http_fetcher: error fetching data: ${errorMessage}`);
    }

    return { data: ret, error: err };
  }

  private url: string;
}
