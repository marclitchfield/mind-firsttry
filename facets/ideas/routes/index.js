import express from "express";
import { renderToString } from "react-dom/server";
import App from "../public/scripts/components/app";
import React from "react";
import IdeasRepo from "../data/ideas";

const router = express.Router();
const repo = new IdeasRepo();

/* GET home page. */
router.get("/", function(req, res) {
  repo.rootIdeas()
    .then((ideas) => {
      const markup = renderToString(<App rootIdeas={ideas} />);
      console.log('markup', markup);
      res.render("index", {
        title: "Mind: Ideas",
        markup: markup
      });
    })
    .catch((err) => res.err(err))
});

module.exports = router;
