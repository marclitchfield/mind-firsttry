import { handleActions } from "redux-actions";

export default handleActions({

  SHOULD_FETCH: (state, action) => {
    return Object.assign({}, state, {
      shouldFetch: true
    })
  },

  SKIP_FETCH: (state, action) => {
    return Object.assign({}, state, {
      shouldFetch: false
    })
  },

  FETCH_ROOT_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      rootIdeas: action.payload
    });
  },

  FETCH_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selectedIdea: action.payload
    });
  },

  CREATE_ROOT_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      rootIdeas: (state.rootIdeas || []).concat(action.payload)
    });
  },

  CREATE_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selectedIdea: Object.assign({}, state.selectedIdea, {
        children: state.selectedIdea.children.concat(action.payload)
      })
    });
  },

  UPDATE_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selectedIdea: state.selectedIdea ? Object.assign({}, state.selectedIdea, action.payload) : undefined,
      rootIdeas: (state.rootIdeas || []).map(idea => 
        idea.id === action.payload.id ? Object.assign({}, idea, action.payload) : idea)
    });
  },
  
  DELETE_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      rootIdeas: (state.rootIdeas || []).filter(idea => idea.id !== action.payload.id)
    });
  }

}, {});
