import React from "react";
import Header from "./header";
import Root from "./root";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({
      root: { ideas: [] }
    }, props.state || global.__APPSTATE__ || {});
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
