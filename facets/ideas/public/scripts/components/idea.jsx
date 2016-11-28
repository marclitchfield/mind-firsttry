import React from "react";

export default class Idea extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="idea">
        <div>{this.props.idea.body}</div>
        <div>{this.props.idea.created}</div>
      </div>
    );
  }
}
