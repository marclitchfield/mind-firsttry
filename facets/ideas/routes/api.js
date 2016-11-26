import express from "express";
import IdeasRepo from "../data/ideas";

const router = express.Router();
const repo = new IdeasRepo();

router.get("/ideas", function(req, res) {
  repo.rootIdeas()
    .then((ideas) => res.json(ideas))
    .catch((err) => res.err(err));
});

module.exports = router;
