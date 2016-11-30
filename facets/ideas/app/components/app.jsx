import React from "react";
import Header from "./header";
import Root from "./root";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.initialData || {
      root: { ideas: [] }
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(idea) {
    this.setState({
      root: {
        ideas: [...this.state.root.ideas, idea]
      }
    })
  }

  render() {
    return (
      <div className="app">
        <Header />
        <Root ideas={this.state.root.ideas} onSubmit={this.handleSubmit} />
      </div>
    );
  }
}
