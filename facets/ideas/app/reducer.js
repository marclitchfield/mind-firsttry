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
      selectedIdea: mergeIdea(state.selectedIdea, action.payload),
      rootIdeas: (state.rootIdeas || []).map(idea => mergeIdea(idea, action.payload))
    });
  },
  
  DELETE_IDEA_FULFILLED: (state, action) => {
    return Object.assign({}, state, {
      rootIdeas: removeIdea(state.rootIdeas, action.meta.id),
      selectedIdea: Object.assign({}, state.selectedIdea, {
        parents: removeIdea(state.selectedIdea.parents, action.meta.id),
        children: removeIdea(state.selectedIdea.children, action.meta.id)
      })
    });
  }

}, {});

function mergeIdea(originalIdea, updatedIdea) {
  const mergedIdea = originalIdea.id === updatedIdea.id ? Object.assign({}, originalIdea, updatedIdea) : originalIdea;
  return Object.assign({}, mergedIdea, {
    children: (mergedIdea.children || []).map(c => c.id === updatedIdea.id ? Object.assign({}, c, updatedIdea) : c),
    parents: (mergedIdea.parents || []).map(p => mergeIdea(p, updatedIdea))
  });
}

function removeIdea(ideas, id) {
  return (ideas || [])
    .filter(idea => idea.id !== id)
    .map(idea => Object.assign({}, idea, {
      children: removeIdea(idea.children, id),
      parents: removeIdea(idea.parents, id)
    }));
}