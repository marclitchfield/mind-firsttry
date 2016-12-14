import React from "react";
import { connect } from "react-redux";
import Idea from "./Idea";
import _ from "lodash/core";

export default class IdeaList extends React.Component {
  render() {
    const { ideas, hideType } = this.props;
    const sortedIdeas = _.sortBy(ideas, 'created');
    return (
      <div className="idea-list">
        {sortedIdeas.map(idea => <Idea hideType={hideType} key={idea.id} idea={idea} />)}
      </div>
    );
  }
}
