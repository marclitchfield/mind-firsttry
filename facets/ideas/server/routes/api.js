import express from "express";
import ideasRepo from "../repos/ideas";

const router = express.Router();

router.get("/ideas", (req, res) => {
  console.log('get from /ideas endpoint')
  res.json(ideasRepo.getIdeas())
});

router.get("/ideas/:id", (req, res) => {
  console.log('get from /ideas:id endpoint')
  res.json(ideasRepo.getIdea(req.params.id));
});

router.post("/ideas/:id?/:predicate?", (req, res) => {
  console.log('posted to idea create endpoint');
  res.json(ideasRepo.createIdea(req.body, req.params.id, req.params.predicate));
});

router.post("/idea/delete", (req, res) => {
  console.log('post to delete endpoint!')
  res.json(ideasRepo.deleteIdea(req.body));
});

router.put("/ideas/:id", (req, res) => {
  console.log('put to idea update endpoint');
  res.json(ideasRepo.updateIdea(req.body));
});

router.post("/init", (req, res) => {
  res.json(ideasRepo.init());
})


module.exports = router;
