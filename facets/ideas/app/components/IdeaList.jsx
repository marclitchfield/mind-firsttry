import React from "react";
import Idea from "./Idea";
import _ from "lodash/core";

export default class IdeaList extends React.Component {
  render() {
    const sortedIdeas = _.sortBy(this.props.ideas, 'created');
    return (
      <div className="idea-list">
        {sortedIdeas.map(idea => <Idea key={idea.id} idea={idea} />)}
      </div>
    );
  }
}
