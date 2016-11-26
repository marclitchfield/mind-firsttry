const express = require("express");
const router = express.Router();
const request = require("superagent");

router.get("/ideas", function(req, res) {
  request.post("http://localhost:5000/query/facets.idea", { "root.idea": { body: true } })
    .end((err, response) => {
      res.json(ideas.me["root.idea"].map((idea) => {
        return {
          id: idea._xid_,
          body: idea.body
        }
      }));
    });
});

module.exports = router;
