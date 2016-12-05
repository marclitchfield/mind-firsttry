import { handleActions } from "redux-actions";

export default handleActions({

  FETCH_ROOT_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selected: undefined,
      ideas: action.payload
    });
  },

  FETCH_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selected: action.payload,
      ideas: action.payload.related
    });
  },

  SUBMIT_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      ideas: state.ideas.concat(action.payload)
    });
  },

}, {
  selected: undefined,
  ideas: []
});
