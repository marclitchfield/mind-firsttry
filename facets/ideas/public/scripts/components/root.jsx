import React from "react";
import Idea from "./idea";
import Submit from "./submit";
import _ from "lodash/core";

export default class Root extends React.Component {
  constructor(props) {
    super(props);
    this.props = {
      ideas: _(props).sortBy('created')
    }
  }

  render() {
    return (
      <div className="root">
        <div className="ideas">
          {this.props.ideas.map((idea) => <Idea key={idea.id} idea={idea} />)}
        </div>
        <Submit onSubmit={this.props.onSubmit} />
      </div>
    );
  }
}
