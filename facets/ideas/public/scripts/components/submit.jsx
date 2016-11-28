import React from "react";
import request from "axios";

export default class Submit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(event) {
    this.setState({ body: event.target.value });
  }

  submit(event) {
    request.post("/api/ideas", { body: this.state.body })
      .then((response) => {
        this.props.onSubmit(response.data);
        this.setState({ body: '' });
      });
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.submit} >
        <label>
          <textarea value={this.state.body} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
