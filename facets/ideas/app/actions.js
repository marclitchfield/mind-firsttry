import axios from "axios";

export function fetchIdeas(id) {
  return {
    type: "FETCH_IDEAS",
    payload: axios.get("/api/ideas/" + (id || "")).then(response => response.data),
    meta: {
      selected: id
    }
  };
}

export function submitIdea(idea, parent, predicate) {
  const url = "/api/ideas/" + (parent ? parent + "/" + predicate : ""); 
  return {
    type: "SUBMIT_IDEA",
    payload: axios.post(url, { body: idea.body }).then(response => response.data)
  }
}
