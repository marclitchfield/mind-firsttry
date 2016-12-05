import express from "express";
import React from "react";
import { Provider } from "react-redux";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import routes from "../../app/routes";
import createStore from "../../app/store";
import ideasRepo from "../repos/ideas";

const router = express.Router();

router.get("/", (request, response, next) => {
  renderIndex(request, response, next, () => ideasRepo.getIdeas().then(ideas => {
    return {
      ideas
    };
  }));
});

router.get("/idea/:id", (request, response, next) => {
  renderIndex(request, response, next, () => ideasRepo.getIdea(request.params.id).then(idea => {
    return {
      selected: idea,
      ideas: idea.related
    };
  }));
});

function renderIndex(request, response, next, load) {
  match({ routes, location: request.url }, (error, redirectLocation, renderProps) => {
    load().then((initialState) => {
      if (error) { return response.status(500).send(error.message); }
      const store = createStore(initialState);
      response.render("index", renderParams(store, renderProps));
    })
    .catch(err => next(err));
  });
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
