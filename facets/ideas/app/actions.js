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

export function submitIdea(idea) {
  return {
    type: "SUBMIT_IDEA",
    payload: axios.post("/api/ideas", { body: idea.body }).then(response => response.data)
  }
}
