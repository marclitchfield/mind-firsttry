import React from "react";
import IdeasRepo from "../../../data/ideas";
import request from "axios";

export default class Submit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: ''
    };

    this.repo = new IdeasRepo();
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(event) {
    this.setState({ body: event.target.value });
  }

  submit(event) {
    request.post("/api/ideas", { body: this.state.body })
      .then((idea) => this.props.onSubmit(idea));
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.submit} >
        <label>
          <textarea value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
