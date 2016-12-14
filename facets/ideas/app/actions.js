import axios from "axios";

export function recordInitialDataLoaded() {
  return {
    type: "RECORD_INITIAL_DATA_LOADED"
  }
}

export function fetchRootIdeas() {
  return {
    type: "FETCH_ROOT_IDEAS",
    payload: axios.get("/api/ideas").then(response => response.data)
  }
}

export function submitRootIdea(idea) {
  return {
    type: "SUBMIT_ROOT_IDEA",
    payload: axios.post("/api/ideas", { body: idea.body }).then(response => response.data)
  }  
}


export function fetchIdea(id) {
  return {
    type: "FETCH_IDEA",
    payload: axios.get("/api/ideas/" + id).then(response => response.data)
  }
}
  
export function submitIdea(idea, parent, type) {
  return {
    type: "SUBMIT_IDEA",
    payload: axios.post(`/api/ideas/${parent}/${type}`, { body: idea.body }).then(response => response.data)
  }
}
