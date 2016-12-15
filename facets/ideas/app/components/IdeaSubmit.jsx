import React from "react";
import ReactDOM from "react-dom";
import IdeaType from "./IdeaType";
import { SUPPORTED_TYPES } from "../constants";

const DEFAULT_TYPE = "reason";

export default class IdeaSubmit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      body: '', 
      type: DEFAULT_TYPE
    };
    this.handleChangeBody = this.handleChangeBody.bind(this);
    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.submit = this.submit.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  handleChangeBody(event) {
    this.setState({ body: event.target.value });
  }

  handleChangeType(event) {
    this.setState({ type: event.target.value });
  }

  componentDidMount() {
    if (!this.props.noFocus) {
      ReactDOM.findDOMNode(this.refs.bodyInput).focus();
    }
  }

  submit(event) {
    event.preventDefault();
    this.props.onSubmit({ 
      body: this.state.body, 
      type: this.props.shouldSubmitType ? this.state.type : undefined
    });
    this.setState({ body: '' });
  }

  cancel(event) {
    event.preventDefault();
    this.setState({ body: '' });
    this.props.onCancel();
  }

  handleKeyDown(event) {
    if (event.keyCode === 27) {
      this.cancel(event);
    }
  }

  render() {
    const disabled = this.state.body.length === 0;
    return (
      <form onSubmit={this.submit} className="submit-form" onKeyDown={this.handleKeyDown}>
        {
          this.props.shouldSubmitType ?
            <label>
              <select className="idea-type-select" value={this.state.type} onChange={this.handleChangeType}>
                {SUPPORTED_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <IdeaType value={this.state.type} />
            </label> : null
        }
        <label>
          <input type="text" ref="bodyInput" value={this.state.body} onChange={this.handleChangeBody} placeholder="New idea" />
        </label>
        <input disabled={disabled} type="submit" className="button" value="Submit" />
        {this.props.hideCancel ? null : <button className="button secondary" value="Cancel" onClick={this.cancel}>Cancel</button>}
      </form>
    );
  }
}
