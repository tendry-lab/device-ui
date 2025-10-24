/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { BasicConfigComponent } from "@device-ui/ui/preact/basic_config_component";

import "@device-ui/ui/preact/form_config_component.css";

// Loading state component.
function ConfigLoading() {
  return <p className="config-loading">Loading configuration...</p>;
}

// Error state component.
function ConfigError() {
  return <p className="config-error">Failed to load configuration</p>;
}

// Configuration form props.
type configFormProps = {
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
  data: Record<string, any>;
  setData: (data: Record<string, any>) => void;
  ignoreKeys?: string[];
};

// Main configuration form component.
function ConfigForm(props: configFormProps) {
  return (
    <div>
      <div className="config-form">
        {Object.entries(props.data)
          .filter(([key]) => !props.ignoreKeys?.includes(key))
          .map(([key, value]) => (
            <div className="form-row">
              <div className="form-label">{key}</div>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  props.data[key] = e.currentTarget.value;
                  props.setData({ ...props.data });
                }}
                className="form-input"
              />
            </div>
          ))}
      </div>

      {/* Action buttons. */}
      <div className="config-buttons-container">
        <button
          onClick={props.onApply}
          className="config-buttons-item config-buttons-item-apply"
        >
          Save
        </button>

        <button
          onClick={props.onReset}
          className="config-buttons-item config-buttons-item-reset"
        >
          Reset
        </button>

        <button
          onClick={props.onClose}
          className="config-buttons-item config-buttons-item-close"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export class FormConfigComponent extends BasicConfigComponent {
  render() {
    return (
      <div className="config-container">
        {this.state.loading && <ConfigLoading />}

        {!this.state.loading && this.state.data && (
          <ConfigForm
            onApply={this.writeConfig}
            onReset={this.resetConfig}
            onClose={this.props.onClose}
            data={this.state.data}
            setData={this.setData}
            ignoreKeys={this.props.ignoreKeys ?? []}
          />
        )}

        {!this.state.loading && !this.state.data && <ConfigError />}
      </div>
    );
  }
}
