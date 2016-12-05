import { handleActions } from "redux-actions";

export default handleActions({
  FETCH_IDEAS_PENDING: (state, action) => {
    return Object.assign({}, state, {
      selected: action.meta.selected,
      ideas: []
    });
  },
  FETCH_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      ideas: action.payload
    });
  }
}, {
  selected: undefined,
  ideas: []
});