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

export function createRootIdea({ body }) {
  return {
    type: "CREATE_ROOT_IDEA",
    payload: axios.post("/api/ideas", { body }).then(response => response.data)
  }  
}

export function createIdea({body, type}, parent) {
  return {
    type: "CREATE_IDEA",
    payload: axios.post(`/api/ideas/${parent}`, { body, type }).then(response => response.data)
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
    payload: axios.delete(`/api/idea/${idea.id}`).then(response => response.data),
    meta: {
      id: idea.id
    }
  }
}

export function clearSearch() {
  return {
    type: "CLEAR_SEARCH"
  }
}

export function searchIdeas(query) {
  return {
    type: "SEARCH_IDEAS",
    payload: axios.get(`/api/idea/search?q=${query}`),
    meta: {
      query: query
    }
  }
}
