import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import Idea from "./Idea";
import IdeaSubmit from "./IdeaSubmit";
import _ from "lodash/core";
import { fetchIdea, fetchRootIdeas, submitIdea } from "../actions";

@connect(store => { return { selected: store.selected }; })
export default class IdeaList extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const nextId = nextProps.params.id;
    const selectedId = nextProps.selected.id;
    if (nextId !== selectedId) {
      return nextProps.dispatch(nextId ? fetchIdea(nextId) : fetchRootIdeas());
    }
  }

  handleSubmit(idea) {
    const selectedId = (this.props.selected || {}).id;
    this.props.dispatch(submitIdea(idea, selectedId, "because"));
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
