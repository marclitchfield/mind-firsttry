import { handleActions } from "redux-actions";

export default handleActions({

  FETCH_IDEAS_PENDING: (state, action) => {
    return Object.assign({}, state, {
      selected: action.meta.selected
    });
  },

  FETCH_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      ideas: action.payload
    });
  },

  SUBMIT_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      ideas: state.ideas.concat(action.payload)
    });
  }

}, {
  selected: undefined,
  ideas: []
});