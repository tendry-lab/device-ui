/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component } from "preact";

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { StateMonitor } from "@device-ui/lib/core/state_monitor";

import {
  UpdaterId,
  UpdaterSelector,
  UpdaterSelectorResult,
} from "@device-ui/lib/device/updater_selector";

import "@device-ui/ui/preact/update_component.css";

export type UpdateComponentProps = {
  stateMonitor: StateMonitor<boolean>;
  updaterSelector: UpdaterSelector;
};

type updateComponentState = {
  isOpen: boolean;
  isDragging: boolean;
  isUpdating: boolean;
  updateError: string | null;
  updateFinished: boolean;
  updaterId: UpdaterId;
  selectedFile: File | null;
};

export class UpdateComponent
  extends Component<UpdateComponentProps, updateComponentState>
  implements ObjectMonitor
{
  constructor(props: UpdateComponentProps) {
    super(props);

    this.state = {
      isOpen: false,
      isDragging: false,
      isUpdating: false,
      updateError: null,
      updateFinished: false,
      updaterId: UpdaterId.None,
      selectedFile: null,
    };

    this.isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  override async componentDidMount() {
    this.props.stateMonitor.setMonitor(this);
  }

  override componentWillUnmount() {
    this.props.stateMonitor.setMonitor(null);
    this.close();

    this.setState({
      isOpen: false,
      isDragging: false,
      isUpdating: false,
      updateError: null,
      updateFinished: false,
      updaterId: UpdaterId.None,
      selectedFile: null,
    });
  }

  notifyChanged() {
    this.setState({
      isOpen: this.props.stateMonitor.get(),
      isDragging: false,
      isUpdating: false,
      updateError: null,
      updateFinished: false,
      updaterId: UpdaterId.None,
      selectedFile: null,
    });
  }

  render() {
    if (!this.state.isOpen) {
      return null;
    }

    return (
      <div className="modal-backdrop" onClick={this.close}>
        <div className="update-modal" onClick={(e) => e.stopPropagation()}>
          <div className="update-content">
            <div className="update-header">
              <h2 className="update-title">Firmware Update</h2>
              {!this.state.isUpdating && this.renderCloseButton()}
            </div>

            {this.state.isUpdating && this.renderUpdateInProgress()}

            {this.state.updateFinished && this.renderUpdateFinished()}

            {!this.state.isUpdating &&
              !this.state.updateFinished &&
              this.renderDefault()}
          </div>
        </div>
      </div>
    );
  }

  private renderCloseButton() {
    return (
      <button className="close-button" onClick={this.close}>
        ×
      </button>
    );
  }

  private renderDefault() {
    return (
      <>
        <div
          className={`update-dropzone ${this.state.isDragging ? "dragging" : ""} ${this.state.selectedFile ? "has-file" : ""}`}
          onDragOver={this.handleDragOver}
          onDragLeave={this.handleDragLeave}
          onDrop={this.handleDrop}
          onClick={this.handleDropzoneClick}
        >
          {!this.state.selectedFile && this.isTouch && (
            <>
              <div className="update-dropzone-icon">📁</div>
              <p className="update-dropzone-text">
                Tap to choose firmware file
              </p>
            </>
          )}
          {!this.state.selectedFile && !this.isTouch && (
            <>
              <div className="update-dropzone-icon">📁</div>
              <p className="update-dropzone-text">
                Drag and drop firmware file
              </p>
              <p className="update-dropzone-subtext">or click to browse</p>
            </>
          )}

          {this.state.selectedFile && (
            <>
              <div className="update-dropzone-icon">✓</div>
              <p className="update-dropzone-text">
                {this.state.selectedFile.name}
              </p>
              <p className="update-dropzone-subtext">
                {UpdateComponent.formatFileSize(this.state.selectedFile.size)}
              </p>
            </>
          )}

          <input
            ref={(el) => (this.fileInput = el)}
            type="file"
            onChange={this.handleFileSelect}
            className="update-file-input"
          />
        </div>

        {this.state.updateError && (
          <div className="update-error">
            <p className="update-error-text">{this.state.updateError}</p>
          </div>
        )}

        {this.state.selectedFile && (
          <div className="update-actions">
            <button
              onClick={this.handleUpload}
              className="update-button update-button-primary"
            >
              Upload
            </button>
            <button
              onClick={this.handleClear}
              className="update-button update-button-secondary"
            >
              Clear
            </button>
          </div>
        )}
      </>
    );
  }

  private renderUpdateInProgress() {
    return (
      <div className="update-updating">
        <div className="update-spinner"></div>

        {this.state.updaterId === UpdaterId.Firmware && (
          <p className="update-updating-title">Updating Firmware...</p>
        )}
        {this.state.updaterId === UpdaterId.UI && (
          <p className="update-updating-title">Updating UI...</p>
        )}

        <p className="update-updating-warning">
          Please do not power off or reboot the device
        </p>
        <div className="update-file-info">
          <p className="update-file-name">{this.state.selectedFile?.name}</p>
          <p className="update-file-size">
            {UpdateComponent.formatFileSize(this.state.selectedFile?.size || 0)}
          </p>
        </div>
      </div>
    );
  }

  private renderUpdateFinished() {
    return (
      <div className="update-finished">
        <div
          className="update-dropzone has-file"
          style={{ cursor: "default", pointerEvents: "none" }}
        >
          <div className="update-dropzone-icon">✓</div>
          <p className="update-dropzone-text">
            {this.state.selectedFile?.name}
          </p>
          <p className="update-dropzone-subtext">
            {UpdateComponent.formatFileSize(this.state.selectedFile?.size || 0)}
          </p>
        </div>
        <div className="update-success-message">
          <p className="update-success-text">Update successfully finished.</p>
        </div>
      </div>
    );
  }

  private close = () => {
    if (!this.state.isUpdating) {
      this.props.stateMonitor.set(false);
    }
  };

  private handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ ...this.state, isDragging: true });
  };

  private handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ ...this.state, isDragging: false });
  };

  private handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ ...this.state, isDragging: false });

    const files = e.dataTransfer?.files;
    const file = files?.[0];
    if (file) {
      this.processFile(file);
    }
  };

  private handleDropzoneClick = () => {
    this.fileInput?.click();
  };

  private handleFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
  };

  private processFile = (file: File) => {
    this.setState({
      ...this.state,
      selectedFile: file,
      updateError: null,
      updateFinished: false,
      updaterId: UpdaterId.None,
    });
  };

  private handleClear = () => {
    this.setState({
      ...this.state,
      selectedFile: null,
      updateError: null,
      updateFinished: false,
      updaterId: UpdaterId.None,
    });
    if (this.fileInput) {
      this.fileInput.value = "";
    }
  };

  private handleUpload = async () => {
    if (!this.state.selectedFile) {
      return;
    }

    const buffer = await this.state.selectedFile.arrayBuffer();
    const data = new Uint8Array(buffer);

    let error: Error | null = null;

    const selectResult: UpdaterSelectorResult =
      this.props.updaterSelector.select(this.state.selectedFile.name);

    this.setState({
      ...this.state,
      isUpdating: true,
      updateError: null,
      updaterId: selectResult.id,
    });

    if (!selectResult.error) {
      error = await selectResult.updater!.update(data);
    } else {
      error = selectResult.error;
    }
    if (error) {
      const errorMessage = `Update failed: ${error}`;
      console.error(`update_component: update failed: ${error}`);

      this.setState({
        ...this.state,
        isUpdating: false,
        updateError: errorMessage,
      });

      return;
    }

    this.setState({ ...this.state, isUpdating: false, updateFinished: true });
  };

  private static formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  private fileInput: HTMLInputElement | null = null;
  private isTouch: boolean = false;
}
