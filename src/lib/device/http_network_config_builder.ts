import { NetworkConfigBuilder } from "@device-ui/lib/device/network_config_builder";
import { NetworkType } from "@device-ui/lib/device/types";
import { Config } from "@device-ui/lib/device/config";
import { HTTPConfig } from "@device-ui/lib/device/http_config";
import { JSONFormatter } from "@device-ui/lib/fmt/json_formatter";

export class HTTPNetworkConfigBuilder implements NetworkConfigBuilder {
  // Initialize.
  constructor(private readonly baseURL: string) {}

  // Build HTTP network config.
  build(nt: NetworkType): Config | null {
    switch (nt) {
      case NetworkType.WiFiAP:
        return new HTTPConfig(
          new JSONFormatter(),
          `${this.baseURL}/config/wifi/ap`,
        );

      case NetworkType.WiFiSTA:
        return new HTTPConfig(
          new JSONFormatter(),
          `${this.baseURL}/config/wifi/sta`,
        );

      default:
        return null;
    }
  }
}
