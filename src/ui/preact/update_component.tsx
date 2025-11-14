import { Component } from "preact";

import { ObjectMonitor } from "@device-ui/lib/core/object_monitor";
import { StateMonitor } from "@device-ui/lib/core/state_monitor";
import { Updater } from "@device-ui/lib/device/updater";

import "@device-ui/ui/preact/update_component.css";

export type UpdateComponentProps = {
  // Monitor to handle the state changes.
  stateMonitor: StateMonitor<boolean>;

  // Updater to perform the OTA process.
  updater: Updater;
};

type otaComponentState = {
  isOpen: boolean;
  selectedFile: File | null;
  isDragging: boolean;
};

export class UpdateComponent
  extends Component<UpdateComponentProps, otaComponentState>
  implements ObjectMonitor
{
  constructor(props: UpdateComponentProps) {
    super(props);
    this.state = {
      isOpen: false,
      selectedFile: null,
      isDragging: false,
    };
  }

  override async componentDidMount() {
    this.props.stateMonitor.setMonitor(this);
  }

  override componentWillUnmount() {
    this.props.stateMonitor.setMonitor(null);
    this.close();
  }

  notifyChanged() {
    this.setState({
      isOpen: this.props.stateMonitor.get(),
      selectedFile: null,
      isDragging: false,
    });
  }

  render() {
    if (!this.state.isOpen) {
      return null;
    }

    return (
      <div className="modal-backdrop" onClick={this.close}>
        <div className="ota-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={this.close}>
            ×
          </button>

          <div className="ota-content">
            <h2 className="ota-title">Firmware Update</h2>

            <div
              className={`ota-dropzone ${this.state.isDragging ? "dragging" : ""} ${this.state.selectedFile ? "has-file" : ""}`}
              onDragOver={this.handleDragOver}
              onDragLeave={this.handleDragLeave}
              onDrop={this.handleDrop}
              onClick={this.handleDropzoneClick}
            >
              {!this.state.selectedFile && (
                <>
                  <div className="ota-dropzone-icon">📁</div>
                  <p className="ota-dropzone-text">
                    Drag and drop firmware file here
                  </p>
                  <p className="ota-dropzone-subtext">or click to browse</p>
                </>
              )}

              {this.state.selectedFile && (
                <>
                  <div className="ota-dropzone-icon">✓</div>
                  <p className="ota-dropzone-text">
                    {this.state.selectedFile.name}
                  </p>
                  <p className="ota-dropzone-subtext">
                    {UpdateComponent.formatFileSize(
                      this.state.selectedFile.size,
                    )}
                  </p>
                </>
              )}

              <input
                ref={(el) => (this.fileInput = el)}
                type="file"
                onChange={this.handleFileSelect}
                className="ota-file-input"
              />
            </div>

            {this.state.selectedFile && (
              <div className="ota-actions">
                <button
                  onClick={this.handleUpload}
                  className="ota-button ota-button-primary"
                >
                  Upload
                </button>
                <button
                  onClick={this.handleClear}
                  className="ota-button ota-button-secondary"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  private close = () => {
    this.props.stateMonitor.set(false);
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
    this.setState({ ...this.state, selectedFile: file });
  };

  private handleClear = () => {
    this.setState({ ...this.state, selectedFile: null });
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

    error = this.props.updater.verify(data);
    if (error) {
      console.error(`update_component: failed to verify firmware: ${error}`);

      return;
    }

    error = await this.props.updater.begin();
    if (error) {
      console.error(`update_component: failed to begin OTA: ${error}`);

      return;
    }

    error = await this.props.updater.write(data);
    if (error) {
      console.error(`update_component: failed to write OTA data: ${error}`);

      error = await this.props.updater.cancel();
      if (error) {
        console.error(`update_component: failed to cancel OTA: ${error}`);
      }

      return;
    }

    error = await this.props.updater.end();
    if (error) {
      console.error(`update_component: failed to end OTA: ${error}`);
    }
  };

  private static formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  private fileInput: HTMLInputElement | null = null;
}
