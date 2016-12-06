import React from "react";
import { supportedPredicates } from "../constants";

export default class IdeaSubmit extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      body: '', 
      predicate: this.props.providePredicate ? supportedPredicates[0] : undefined 
    };
    this.handleChangeBody = this.handleChangeBody.bind(this);
    this.handleChangePredicate = this.handleChangePredicate.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChangeBody(event) {
    this.setState({ body: event.target.value });
  }

  handleChangePredicate(event) {
    this.setState({ predicate: event.target.value });
  }

  submit(event) {
    this.props.onSubmit(this.state);
    this.setState({ body: '' });
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.submit} className="submit-form" >
        {
          this.props.providePredicate ?
            <label>
              <select value={this.state.predicate} onChange={this.handleChangePredicate}>
                {supportedPredicates.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label> : null
        }
        <label>
          <textarea value={this.state.body} onChange={this.handleChangeBody} placeholder="New idea" />
        </label>
        <input type="submit" className="button" value="Submit" />
      </form>
    );
  }
}
