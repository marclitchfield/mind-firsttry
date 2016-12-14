import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Router, browserHistory } from "react-router";
import * as actionCreators from "../actions";
import Header from "./Header";

@connect(
  store => { 
    return {
      rootIdeas: store.rootIdeas, 
      selectedIdea: store.selectedIdea 
    } 
  }, 
  dispatch => { return { actions: bindActionCreators(actionCreators, dispatch) } }
)
export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <Header />
        {React.cloneElement(this.props.children, this.props)}
      </div>
    );
  }
}
