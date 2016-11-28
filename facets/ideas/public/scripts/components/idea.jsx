import React from "react";
import moment from "moment";

export default class Idea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const created = this.props.idea.created || Date.now();
    return (
      <div className="idea">
        <div>{this.props.idea.body}</div>
        <div className="created">{moment(created).fromNow()}</div>
      </div>
    );
  }
}
