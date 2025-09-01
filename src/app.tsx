import { Component } from "preact";

import { Telemetry } from "./telemetry";
import { Registration } from "./registration";
import { usePeriodicFetcher } from "./http/periodic_fetcher";

import "./app.css";

export class App extends Component {
  render() {
    // Base URL.
    const API_BASE_URL: string = "api/v1";

    const telemetry: Record<string, any> | null = usePeriodicFetcher({
      interval: 10 * 1000,
      url: `${API_BASE_URL}/telemetry`,
    });

    const registration: Record<string, any> | null = usePeriodicFetcher({
      interval: 60 * 1000,
      url: `${API_BASE_URL}/registration`,
    });

    return (
      <div className="app-container">
        <h1>Bonsai Zero Analog 1 Kit Dashboard</h1>
        <Telemetry baseURL={API_BASE_URL} data={telemetry} />
        <Registration data={registration} />
      </div>
    );
  }
}
