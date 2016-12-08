import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import Idea from "./Idea";
import SelectedIdea from "./SelectedIdea";
import IdeaSubmit from "./IdeaSubmit";
import IdeaType from "./IdeaType";
import _ from "lodash/core";
import { fetchIdea, fetchRootIdeas, submitIdea } from "../actions";

@connect(store => { return { selected: store.selected }; })
export default class IdeaList extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderSelectedIdea = this.renderSelectedIdea.bind(this);
    this.renderRootIdeas = this.renderRootIdeas.bind(this);
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
    this.props.dispatch(submitIdea(idea, selectedId, idea.type));
  }

  render() {
    const sortedIdeas = _.sortBy(this.props.selected.children, 'created');
    const shouldSubmitType = this.props.selected.id !== undefined;
    const hideType = this.props.selected.id === undefined;

    return (
      <div className="idea-list">
        {this.props.selected.id ? this.renderSelectedIdea(sortedIdeas) : this.renderRootIdeas(sortedIdeas) }
        <IdeaSubmit shouldSubmitType={shouldSubmitType} onSubmit={this.handleSubmit} />
      </div>
    );
  }

  renderSelectedIdea(ideas) {
    return (
      <SelectedIdea idea={this.props.selected}>
        <div className="child-ideas">
          {ideas.map(idea => <Idea key={idea.id} idea={idea} />)}
        </div>
      </SelectedIdea>
    );
  }

  renderRootIdeas(ideas) {
    return (
      <div className="root-ideas">
        {ideas.map(idea => <Idea hideType={true} key={idea.id} idea={idea} />)}
      </div>
    );
  }
}
