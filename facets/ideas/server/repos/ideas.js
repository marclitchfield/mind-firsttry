import axios from "axios";
import join from "url-join";
import config from "../../config";
import { SUPPORTED_TYPES, ROOT_TYPE } from "../../app/constants";

const P = {
  PARENT: "idea_parent",
  CHILD: "idea_child",
  ROOT: "idea_root"
};

const ROOT_SUBJECT = "ideas_facet";

class IdeasRepo {

  getIdeas() {
    return axios
      .post(join(config.api_url, "query", ROOT_SUBJECT), { 
        [P.ROOT]: queryProperties() 
      })
      .then(response => {
        console.log('response', response);
        return [].concat(response.data[P.ROOT] || []).map((idea) => toIdea(idea));
      });
  }

  getIdea(id) {
    return axios
      .post(join(config.api_url, "query", id), queryProperties())
      .then(response => {
        return toIdea(response.data);
      });
  }

  createIdea(idea, parent) {
    const ideaType = parent === undefined ? ROOT_TYPE : idea.type;
    const payload = {
      props: { body: idea.body },
      out: Object.assign({}, { is: ideaType }, parent === undefined ? {} : { [P.PARENT]: parent }),
      in: Object.assign({}, parent === undefined ? { [P.ROOT]: ROOT_SUBJECT } : { [P.CHILD]: parent }),
      document: { 
        [ROOT_SUBJECT]: {
          type: ideaType,
          children: []
        } 
      }
    };
    return axios
      .post(join(config.api_url, "node"), payload)
      .then(response => Object.assign({}, payload.props, { id: response.data, type: ideaType, body: idea.body }))
      .catch(err => err)
  }

  updateIdea(idea) {
    const payload = {
      props: { body: idea.body },
      out: idea._original === undefined || idea._original.type === idea.type ? {} : { is: idea.type },
      del: idea._original === undefined || idea._original.type === idea.type ? {} : { out: { is: idea._original.type } },
      document: {
        [ROOT_SUBJECT]: {
          type: idea.type,
          children: idea.children.map(c => {
            return {
              id: c.id,
              type: c.type,
              created: c.created
            }
          })
        }
      }
    };
    return axios
      .post(join(config.api_url, `node/${idea.id}`), payload)
      .then(response => { return idea })
      .catch(err => err)
  }

  deleteIdea(id) {
    return axios
      .delete(join(config.api_url, `node/${id}`), payload)
      .then(response => { return 'ok'; })
      .catch(err => err);
  }

  search(query) {
    return axios
      .post(join(config.api_url, "/search", ROOT_SUBJECT), { body: { query } })
      .then(response => response.data)
      .catch(err => err);
  }

  init() {
    const payload = SUPPORTED_TYPES.reduce((map, type) =>
      Object.assign({}, map, {
        [type]: {
          props: { id: type }, 
          out: { is: ROOT_TYPE }, 
          in: { type: ROOT_TYPE }
        }
      }), { idea: { props: { id: ROOT_TYPE } } });

    return axios
      .post(join(config.api_url, 'graph'), payload) 
      .then(() => "initialized")
      .catch(err => err);
  }
}

function queryProperties() {
  const node = { 
    is: {},
    created: true
  };
  const body = {
    body: true
  };
  const children = { 
    [P.CHILD]: Object.assign({}, node, body, { [P.CHILD]: node })
  };
  const parents = {
    [P.PARENT]: Object.assign({}, node, body, { [P.CHILD]: node })
  };

  return Object.assign({}, node, body, children, parents);
}

function toIdea(ideaResponse) {
  console.log('toIdea', ideaResponse)
  return {
    id: ideaResponse.id,
    body: ideaResponse.body,
    type: ideaResponse.is !== undefined ? ideaResponse.is[0].id : ROOT_TYPE,
    created: ideaResponse.created,
    children: (ideaResponse[P.CHILD] || []).map(c => toIdea(c)),
    parents: (ideaResponse[P.PARENT] || []).filter(p => p.id !== undefined).map(p => toIdea(p))
  };
}

export default new IdeasRepo();
