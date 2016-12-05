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
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selected != nextProps.params.id) {
      nextProps.dispatch(fetchIdeas(nextProps.params.id));
    }
  }

  handleSubmit(idea) {
    // this.setState({
    //   ideas: this.state.ideas.concat(idea)
    // })
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
