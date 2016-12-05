import React from "react";
import { Router, browserHistory } from "react-router";
import Header from "./Header";

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="app">
        <Header />
        {this.props.children}
      </div>
    );
  }
}
