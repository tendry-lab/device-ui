import { Fetcher } from "../http/fetcher";
import { HTTPFetcher } from "../http/http_fetcher";
import { Rebooter } from "./rebooter";

// Reboot device over HTTP.
export class HTTPRebooter implements Rebooter {
  constructor(url: string) {
    this.fetcher = new HTTPFetcher(url);
  }

  async reboot(): Promise<Error | null> {
    const fetchResult = await this.fetcher.fetch();
    if (fetchResult.error) {
      return fetchResult.error;
    }

    let err: Error | null = null;

    try {
      const text = new TextDecoder().decode(fetchResult.data!);
      if (text != "Rebooting...") {
        err = new Error(
          `http_rebooter: reboot failed, invalid response: ${text}`,
        );
      }
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return err;
  }

  private fetcher: Fetcher;
}
