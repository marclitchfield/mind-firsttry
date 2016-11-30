import React from "react";
import Header from "./header";

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="app">
        <Header />
        <div className="context">
          {this.props.children}
        </div>
      </div>
    );
  }
}
