import { Component, JSX } from "preact";

import { ObjectMonitor } from "../../lib/core/object_monitor";
import { StateMonitor } from "../../lib/core/state_monitor";

import "./markdown_component.css";

export type MarkdownComponentProps = {
  // Monitor to handle the state changes.
  stateMonitor: StateMonitor<boolean>;

  // Markdown content in HTML format.
  data: JSX.Element;
};

type markdownComponentState = {
  isOpen: boolean;
};

export class MarkdownComponent
  extends Component<MarkdownComponentProps, markdownComponentState>
  implements ObjectMonitor
{
  constructor(props: MarkdownComponentProps) {
    super(props);
    this.state = { isOpen: false };
  }

  async componentDidMount() {
    this.props.stateMonitor.setMonitor(this);
  }

  componentWillUnmount() {
    this.props.stateMonitor.setMonitor(null);
    this.close();
  }

  notifyChanged() {
    this.setState({ isOpen: this.props.stateMonitor.get() });
  }

  render() {
    if (!this.state.isOpen) {
      return null;
    }

    return (
      <div className="modal-backdrop" onClick={this.close}>
        <div className="markdown-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={this.close}>
            ×
          </button>
          <div className="markdown-content">{this.props.data}</div>
        </div>
      </div>
    );
  }

  private close = () => {
    this.props.stateMonitor.set(false);
  };
}
