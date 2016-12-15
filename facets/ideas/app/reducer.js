import { handleActions } from "redux-actions";

export default handleActions({

  RECORD_INITIAL_DATA_LOADED: (state, action) => {
    return Object.assign({}, state, {
      isInitialDataLoaded: true
    })
  },

  FETCH_ROOT_IDEAS_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      rootIdeas: action.payload
    });
  },

  SUBMIT_ROOT_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      rootIdeas: (state.rootIdeas || []).concat(action.payload)
    });
  },

  UPDATE_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selectedIdea: state.selectedIdea ? Object.assign({}, state.selectedIdea, action.payload) : undefined,
      rootIdeas: (state.rootIdeas || []).map(idea => 
        idea.id === action.payload.id ? Object.assign({}, idea, action.payload) : idea)
    });
  },
  
  FETCH_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selectedIdea: action.payload
    });
  },

  SUBMIT_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      selectedIdea: Object.assign({}, state.selectedIdea, {
        children: state.selectedIdea.children.concat(action.payload)
      })
    });
  }

}, {});
