import axios from "axios";

export function fetchRootIdeas() {
  return {
    type: "FETCH_ROOT_IDEAS",
    payload: axios.get("/api/ideas").then(response => response.data)
  }
}

export function fetchIdea(id) {
  return {
    type: "FETCH_IDEA",
    payload: axios.get("/api/ideas/" + id).then(response => response.data)
  }
}
  
export function submitIdea(idea, parent, type) {
  const url = "/api/ideas/" + (parent ? parent + "/" + type : ""); 
  return {
    type: "SUBMIT_IDEA",
    payload: axios.post(url, { body: idea.body }).then(response => response.data)
  }
}
