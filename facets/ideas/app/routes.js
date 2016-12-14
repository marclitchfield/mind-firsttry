import React from "react";
import { Route, IndexRoute } from "react-router";
import App from "./components/App";
import RootIdeas from "./components/RootIdeas";
import SelectedIdea from "./components/SelectedIdea";
import IdeaList from "./components/IdeaList";
import IdeaSubmit from "./components/IdeaSubmit";
import IdeaEdit from "./components/IdeaEdit";
import { fetchRootIdeas, fetchIdea, recordInitialDataLoaded } from "./actions";

function loadData(store, action) {
  return (props, replace, callback) => {

    // step           action  isInitialDataLoaded  action
    // -------------  ------  -------------------  -------------
    // Server         POP     false                no
    // Client (init)  POP     false                no
    // Client (to)    PUSH    false -> true        yes
    // Client (back)  POP     true                 yes
    
    if (props.location.action === "PUSH" && !store.getState().isInitialDataLoaded) {
      store.dispatch(recordInitialDataLoaded());
    }
    if (props.location.action !== "REPLACE" && store.getState().isInitialDataLoaded) {
      store.dispatch(action(props.params))
        .then(() => callback(null))
        .catch((err) => callback(err));
    } else {
      callback(null);
    }
  }
}

export default function routes(store) {
  return (<Route path="/" component={App}>
    <IndexRoute component={RootIdeas} onEnter={loadData(store, () => fetchRootIdeas())} />
    <Route path="/idea/:id" component={SelectedIdea}>
      <IndexRoute component={SelectedIdea} onEnter={loadData(store, (params) => fetchIdea(params.id))} />
      <Route path="new" component={SelectedIdea} onEnter={loadData(store, (params) => fetchIdea(params.id))} />
      <Route path="edit" component={SelectedIdea} onEnter={loadData(store, (params) => fetchIdea(params.id))} />
    </Route>
  </Route>);
}