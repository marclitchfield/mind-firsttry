import axios from "axios";

export function shouldFetch() {
  return {
    type: "SHOULD_FETCH"
  }
}

export function skipFetch() {
  return {
    type: "SKIP_FETCH"
  }
}

export function fetchRootIdeas() {
  return {
    type: "FETCH_ROOT_IDEAS",
    payload: axios.get("/api/ideas").then(response => response.data)
  }
}

export function fetchIdea(id) {
  return {
    type: "FETCH_IDEA",
    payload: axios.get(`/api/ideas/${id}`).then(response => response.data)
  }
}

export function createRootIdea(idea) {
  return {
    type: "CREATE_ROOT_IDEA",
    payload: axios.post("/api/ideas", { body: idea.body }).then(response => response.data)
  }  
}

export function createIdea(idea, parent, type) {
  return {
    type: "CREATE_IDEA",
    payload: axios.post(`/api/ideas/${parent}/${type}`, { body: idea.body }).then(response => response.data)
  }
}

export function updateIdea(idea) {
  return {
    type: "UPDATE_IDEA",
    payload: axios.put(`/api/ideas/${idea.id}`, idea).then(response => response.data)
  }
}

export function deleteIdea(idea) {
  return {
    type: "DELETE_IDEA",
    payload: axios.post("/api/idea/delete", idea).then(response => response.data)
  }
}
