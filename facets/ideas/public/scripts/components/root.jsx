import React from "react";
import Idea from "./idea";
import request from "superagent";

export default class Root extends React.Component {
  constructor(props) {
    super();
    this.state = {
      ideas: [].concat(props.ideas)
    };
  }

  render() {
    return (
      <div className="ideas">
        {this.state.ideas.map((idea) => <Idea key={idea.id} idea={idea} />)}
      </div>
    );
  }
}