import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./components/App";
import RootIdeas from "./components/RootIdeas";
import SelectedIdea from "./components/SelectedIdea";
import IdeaList from "./components/IdeaList";
import IdeaSubmit from "./components/IdeaSubmit";
import IdeaEdit from "./components/IdeaEdit";
import { fetchRootIdeas, fetchIdea, shouldFetch } from "./actions";

function loadData(store, action) {
  return (props, replace, callback) => {

    if (global.document === undefined) {
      // don't dispatch on server
      return callback(null);
    }

    if (!store.getState().shouldFetch) {
      // don't fetch on initial render, or after skipFetch action is triggered
      store.dispatch(shouldFetch());
      return callback(null);
    }

    store.dispatch(action(props.params))
      .then(() => callback(null))
      .catch((err) => callback(err));
  }
}

export default function routes(store) {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={RootIdeas} onEnter={loadData(store, () => fetchRootIdeas())} />
      <Route path="/idea/:id" component={SelectedIdea}>
        <IndexRoute component={SelectedIdea} onEnter={loadData(store, (params) => fetchIdea(params.id))} />
        <Route path="new" component={SelectedIdea} onEnter={loadData(store, (params) => fetchIdea(params.id))} />
        <Route path="edit" component={SelectedIdea} onEnter={loadData(store, (params) => fetchIdea(params.id))} />
      </Route>
    </Route>
  );
}