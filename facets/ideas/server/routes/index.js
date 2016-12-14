import express from "express";
import React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import routes from "../../app/routes";
import createStore from "../../app/store";
import ideasRepo from "../repos/ideas";
import { fetchRootIdeas, fetchIdea } from "../../app/actions"

const router = express.Router();

router.get("/", (request, response, next) => {
  renderIndex(request, response, next, () => ideasRepo.getIdeas().then(ideas => {
    return {
      rootIdeas: ideas
    };
  }));
});

router.get("/idea/:id/:op?", (request, response, next) => {
  renderIndex(request, response, next, () => ideasRepo.getIdea(request.params.id).then(idea => {
    return {
      selectedIdea: idea
    };
  }));
});

function renderIndex(request, response, next, load) {
  load().then(initialState => {
    const store = createStore(initialState);
    match({ routes: routes(store), location: request.url }, (error, redirectLocation, renderProps) => {
      if (error) { return response.status(500).send(error.message); }
      response.render("index", renderParams(store, renderProps));
    })
  })
  .catch(err => next(err));  
}

function renderParams(store, renderProps) {
  return {
    title: "Mind: Ideas",
    initialState: JSON.stringify(store.getState()),
    markup: renderToString(
      <Provider store={store}>
        <RouterContext {...renderProps} />
      </Provider>)
  };
}

module.exports = router;
