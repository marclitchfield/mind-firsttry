import React from "react";
import Idea from "./idea";
import Submit from "./submit";
import _ from "lodash/core";

export default class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var sortedIdeas = _.sortBy(this.props.ideas, 'created');
    return (
      <div className="root">
        <div className="ideas">
          {sortedIdeas.map((idea) => <Idea key={idea.id} idea={idea} />)}
        </div>
        <Submit onSubmit={this.props.onSubmit} />
      </div>
    );
  }
}
