import { Component } from "preact";

import { TelemetryDataComponent } from "./telemetry_data_component";

import "./app.css";

export class App extends Component {
  render() {
    // Base URL.
    const API_BASE_URL: string = "api/v1";

    return (
      <div className="app-container">
        <h1>Bonsai Zero Analog 1 Kit Dashboard</h1>
        <TelemetryDataComponent baseURL={API_BASE_URL} interval={10 * 1000} />
      </div>
    );
  }
}
