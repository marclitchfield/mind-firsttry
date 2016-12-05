import React from "react";
import { Provider } from "react-redux";
import { render } from "react-dom";
import { Router, browserHistory } from "react-router";
import routes from "./routes";
import createStore from "./store";

const initialState = JSON.parse(document.getElementById("initial-state").textContent);
const store = createStore(initialState);

render((
  <Provider store={store}>
    <Router history={browserHistory}>{routes}</Router>
  </Provider>
), document.getElementById("content"));
