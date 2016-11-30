import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./components/app";
import Root from "./components/root";
import Details from "./components/details";

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Root} />
    <Route path="idea/:id" component={Details} />
  </Route>
);