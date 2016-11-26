const express = require("express");
const router = express.Router();

import { renderToString } from "react-dom/server";
import App from "../public/scripts/components/app";
import React from "react";

/* GET home page. */
router.get("/", function(req, res) {
  const markup = renderToString(<App />);

  console.log('markup', markup);

  res.render("index", {
    title: "Mind: Ideas",
    markup: markup
  });
});

module.exports = router;
