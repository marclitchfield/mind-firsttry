import React from "react";
import Idea from "./idea";
import Relationships from "./relationships";
import Submit from "./submit";
import _ from "lodash/core";
import { ideasRepo } from "../../repos/ideas";

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      ideas: []
    }, props.initialData || {});
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    if (!this.props.initialData) {
      Root.requestInitialData().then(data => {
        this.setState(data);
      });
    }
  }

  handleSubmit(idea) {
    this.setState({
      ideas: [...this.state.ideas, idea]
    })
  }

  render() {
    var sortedIdeas = _.sortBy(this.state.ideas, 'created');
    return (
      <div className="root">
        <div className="ideas">
          {sortedIdeas.map((idea) => 
            <Idea key={idea.id} idea={idea}>
              <Relationships relationships={idea.relationships} />
            </Idea>
          )}
        </div>
        <Submit onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

Root.requestInitialData = () => ideasRepo.rootIdeas().then(ideas => { return { ideas: ideas } });

export default Root;