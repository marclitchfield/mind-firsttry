import express from "express";
import ideasRepo from "../repos/ideas";

const router = express.Router();

router.get("/ideas/:id?", function(req, res) {
  ideasRepo.ideas(req.params.id)
    .then((ideas) => res.json(ideas))
    .catch((err) => res.err(err));
});

router.post("/ideas", function(req, res) {
  ideasRepo.submitRootIdea(req.body)
    .then((idea) => res.json(idea))
    .catch((err) => res.err(err));
});

module.exports = router;
