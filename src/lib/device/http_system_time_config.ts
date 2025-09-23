import { HTTPConfig } from "@device-ui/lib/device/http_config";
import { Formatter } from "@device-ui/lib/fmt/formatter";

// UNIX time configuration over HTTP.
export class HTTPSystemTimeConfig extends HTTPConfig {
  // Initialize.
  constructor(formatter: Formatter, url: string) {
    super(formatter, url);
  }

  // Non-operational reset.
  override async reset(): Promise<Error | null> {
    return null;
  }
}
