import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "../app/components/app";
import IdeasRepo from "../data/ideas";

const router = express.Router();
const repo = new IdeasRepo();

const AppFactory = React.createFactory(App);

router.get("/", function(req, res, next) {
  repo.rootIdeas().then((ideas) => {
    const initialData = { root: { ideas: ideas } };
    let component = AppFactory({ initialData: initialData });
    const markup = renderToString(component);
    res.render("index", {
      title: "Mind: Ideas",
      initialData: JSON.stringify(initialData),
      markup: markup
    });
  })
  .catch((err) => { next(err); });
});

module.exports = router;
