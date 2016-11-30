import express from "express";
import { renderToString } from "react-dom/server";
import App from "../app/components/app";
import React from "react";
import IdeasRepo from "../data/ideas";

const router = express.Router();
const repo = new IdeasRepo();

router.get("/", function(req, res, next) {
  repo.rootIdeas().then((ideas) => {
    const state = { root: { ideas: ideas } };
    const markup = renderToString(<App state={state} />);
    res.render("index", {
      title: "Mind: Ideas",
      state: JSON.stringify(state),
      markup: markup
    });
  })
  .catch((err) => { next(err); });
});

module.exports = router;
