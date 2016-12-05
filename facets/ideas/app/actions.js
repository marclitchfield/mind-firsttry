import axios from "axios";

export const fetchIdeas = (id) => {
  return {
    type: "FETCH_IDEAS",
    payload: axios.get("/api/ideas/" + (id || "")).then(response => response.data),
    meta: {
      selected: id
    }
  };
}
