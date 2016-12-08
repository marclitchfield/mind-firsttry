import React from "react";
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
    this.submit = this.submit.bind(this);
  }

  handleChangeBody(event) {
    this.setState({ body: event.target.value });
  }

  handleChangeType(event) {
    this.setState({ type: event.target.value });
  }

  submit(event) {
    this.props.onSubmit({
      body: this.state.body,
      type: this.props.shouldSubmitType ? this.state.type : undefined
    });
    this.setState({ body: '' });
    event.preventDefault();
  }

  render() {
    const disabled = this.state.body.length === 0;
    return (
      <form onSubmit={this.submit} className="submit-form" >
        {
          this.props.shouldSubmitType ?
            <label>
              <select value={this.state.type} onChange={this.handleChangeType}>
                {SUPPORTED_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </label> : null
        }
        <label>
          <input type="text" value={this.state.body} onChange={this.handleChangeBody} placeholder="New idea" />
        </label>
        <input disabled={disabled} type="submit" className="button" value="Submit" />
      </form>
    );
  }
}
