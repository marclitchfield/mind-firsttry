import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import Idea from "./Idea";
import IdeaSubmit from "./IdeaSubmit";
import _ from "lodash/core";
import { fetchIdea, fetchRootIdeas } from "../actions";

@connect(store => { return { selected: store.selected }; })
export default class IdeaList extends React.Component {
  componentWillReceiveProps(nextProps) {
    const nextId = nextProps.params.id;
    const selectedId = nextProps.selected.id;
    if (nextId !== selectedId) {
      return nextProps.dispatch(nextId ? fetchIdea(nextId) : fetchRootIdeas());
    }
  }

  render() {
    var sortedIdeas = _.sortBy(this.props.selected.related, 'created');
    return (
      <div className="idea-list">
        {this.props.selected.id ? <Idea idea={this.props.selected} /> : null}
        <div className="related-ideas">
          {sortedIdeas.map(idea => <Idea key={idea.id} idea={idea} />)}
        </div>
        <IdeaSubmit onSubmit={this.handleSubmit} />
      </div>
    );
  }
}
