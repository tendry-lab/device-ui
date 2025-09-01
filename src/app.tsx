import { Component } from "preact";

import { Telemetry } from "./telemetry";

import "./app.css";

export class App extends Component {
  render() {
    // Base URL.
    const API_BASE_URL: string = "api/v1";

    return (
      <div className="app-container">
        <h1>Bonsai Zero Analog 1 Kit Dashboard</h1>
        <Telemetry baseURL={API_BASE_URL} interval={10 * 1000} />
      </div>
    );
  }
}
