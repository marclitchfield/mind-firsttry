import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./components/App";
import IdeaList from "./components/IdeaList";

export default (
  <Route path="/" component={App}>
    <IndexRoute component={IdeaList} />
    <Route path="/idea/:id" component={IdeaList} />
  </Route>
);