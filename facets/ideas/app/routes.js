import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./containers/app";
import Root from "./containers/root";
import Details from "./containers/details";

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Root} />
    <Route path="idea/:id" component={Details} />
  </Route>
);