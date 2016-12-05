import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import Idea from "./Idea";
import IdeaSubmit from "./IdeaSubmit";
import _ from "lodash/core";
import { fetchIdeas } from "../actions";

@connect(store => { 
  return { 
    ideas: store.ideas,
    selected: store.selected
  };
})
export default class IdeaList extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.selected != nextProps.params.id) {
      nextProps.dispatch(fetchIdeas(nextProps.params.id));
    }
  }

  render() {
    var sortedIdeas = _.sortBy(this.props.ideas, 'created');
    return (
      <div className="root">
        <div className="ideas">
          {sortedIdeas.map(idea => <Idea key={idea.id} idea={idea} />)}
        </div>
        <IdeaSubmit onSubmit={this.handleSubmit} />
      </div>
    );
  }
}
