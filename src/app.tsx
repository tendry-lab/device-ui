import { Component } from "preact";

import { Notificator } from "./system/notificator";
import { DefaultNotificator } from "./system/default_notificator";
import { TelemetryDataComponent } from "./telemetry_data_component";

import "./app.css";

type appProps = {};

export class App extends Component<appProps, {}> {
  constructor(props: appProps) {
    super(props);

    this.notificator = new DefaultNotificator();
  }

  render() {
    // Base URL.
    const API_BASE_URL: string = "api/v1";

    return (
      <div className="app-container">
        <h1>Bonsai Zero Analog 1 Kit Dashboard</h1>
        <TelemetryDataComponent
          baseURL={API_BASE_URL}
          interval={10 * 1000}
          notificator={this.notificator}
        />
      </div>
    );
  }

  private notificator: Notificator;
}
