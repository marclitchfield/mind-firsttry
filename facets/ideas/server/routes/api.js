import express from "express";
import ideasRepo from "../repos/ideas";

const router = express.Router();

router.get("/ideas", (req, res, next) => {
  res.json(ideasRepo.getIdeas())
});

router.get("/ideas/:id", (req, res, next) => {
  res.json(ideasRepo.getIdea(req.params.id));
});

router.post("/ideas/:id?/:predicate?", (req, res, next) => {
  res.json(ideasRepo.submitIdea(req.body, req.params.id, req.params.predicate));
});

module.exports = router;
