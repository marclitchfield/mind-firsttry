import React from "react";
import { connect } from "react-redux";
import { submitIdea } from "../actions";

@connect()
export default class IdeaSubmit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { body: '' };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(event) {
    this.setState({ body: event.target.value });
  }

  submit(event) {
    this.props.dispatch(submitIdea({ body: this.state.body }));
    this.setState({ body: '' });
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.submit} className="submit-form" >
        <label>
          <textarea value={this.state.body} onChange={this.handleChange} placeholder="New idea" />
        </label>
        <input type="submit" className="button" value="Submit" />
      </form>
    );
  }
}
