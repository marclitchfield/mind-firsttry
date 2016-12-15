import express from "express";
import ideasRepo from "../repos/ideas";

const router = express.Router();

router.get("/ideas", (req, res) => {
  res.json(ideasRepo.getIdeas())
});

router.get("/ideas/:id", (req, res) => {
  res.json(ideasRepo.getIdea(req.params.id));
});

router.post("/ideas/:id?/:predicate?", (req, res) => {
  res.json(ideasRepo.createIdea(req.body, req.params.id, req.params.predicate));
});

router.put("/ideas/:id", (req, res) => {
  res.json(ideasRepo.updateIdea(req.body));
});


module.exports = router;
