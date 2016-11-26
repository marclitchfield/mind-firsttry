import React from "react";
import Idea from "./idea";
import request from "superagent";

export default class Root extends React.Component {
  constructor(props) {
    super();
    this.state = {
      ideas: [].concat(props.rootIdeas)
    };
  }

  componentDidMount() {
    if (this.state.ideas.length === 0) {
      request.get("/api/ideas").end((err, res) => 
        this.setState({
          ideas: this.state.ideas.concat(JSON.parse(res.text))
        })
      );
    }
  }

  render() {
    return (
      <div className="ideas">
        {this.state.ideas.map((idea) => <Idea key={idea.id} idea={idea} />)}
      </div>
    );
  }
}
