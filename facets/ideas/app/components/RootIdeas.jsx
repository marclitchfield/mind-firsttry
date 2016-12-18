import React from "react";
import IdeaSubmit from "./IdeaSubmit";
import IdeaList from "./IdeaList";

export default class RootIdeas extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(idea) {
    this.props.actions.createRootIdea(idea);
  }

  render() {
    return (
      <div className="root-ideas">
        <IdeaList ideas={this.props.rootIdeas} />
        <IdeaSubmit onSubmit={this.handleSubmit} hideCancel={true} noFocus={true} />
      </div>
    );
  }
}
