import express from "express";
import ideasRepo from "../repos/ideas";

const router = express.Router();

router.get("/ideas", (req, res) => {
  ideasRepo.getIdeas()
    .then((ideas) => res.json(ideas))
    .catch((err) => res.err(err));
});

router.get("/ideas/:id", (req, res) => {
  ideasRepo.getIdea(req.params.id)
    .then((idea) => res.json(idea))
    .catch((err) => res.err(err));
});

router.post("/ideas/:id?/:predicate?", (req, res) => {
  ideasRepo.submitIdea(req.body, req.params.id, req.params.predicate)
    .then((idea) => res.json(idea))
    .catch((err) => res.err(err));
});

module.exports = router;
