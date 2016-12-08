import { handleActions } from "redux-actions";

export default handleActions({

  FETCH_ROOT_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selected: { children: action.payload }
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
        children: state.selected.children.concat(action.payload)
      })
    });
  }

}, {
  selected: { children: [] }
});
