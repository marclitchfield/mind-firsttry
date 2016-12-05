import { handleActions } from "redux-actions";

export default handleActions({

  FETCH_ROOT_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selected: { related: action.payload }
    });
  },

  FETCH_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selected: action.payload
    });
  },

  SUBMIT_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selected: Object.assign({}, state.selected, {
        related: state.selected.related.concat(action.payload)
      })
    });
  }

}, {
  selected: {},
  ideas: []
});
