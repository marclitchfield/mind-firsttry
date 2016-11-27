import React from "react";
import Idea from "./idea";
import Submit from "./submit";

export default class Root extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="root">
        <div className="ideas">
          {this.props.ideas.map((idea) => <Idea key={idea.id} idea={idea} />)}
        </div>
        <Submit onSubmit={this.props.onSubmit} />
      </div>
    );
  }
}
