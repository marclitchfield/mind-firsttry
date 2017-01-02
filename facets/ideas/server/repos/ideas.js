import axios from "axios";
import join from "url-join";
import config from "../../config";
import { SUPPORTED_TYPES, ROOT_TYPE } from "../../app/constants";

const P = {
  BODY: "body",
  CREATED: "created",
  IS: "is",
  TYPE: "type",
  PARENT: "idea.parent",
  CHILD: "idea.child"
};

const ROOT_SUBJECT = "ideas.facet";

class IdeasRepo {

  getIdeas() {
    return axios
      .post(join(config.api_url, "query", ROOT_SUBJECT), { 
        [P.CHILD]: queryProperties({ children: false, parents: false }) 
      })
      .then(response => {
        return [].concat(response.data[P.CHILD] || []).map((idea) => toIdea(idea));
      });
  }

  getIdea(id) {
    return axios
      .post(join(config.api_url, "query", id), queryProperties({ children: true, parents: true }))
      .then(response => {
        return toIdea(response.data);
      });
  }

  createIdea(idea, parent, type) {
    const ideaType = type || ROOT_TYPE;
    const subject = parent === undefined ? ROOT_SUBJECT : parent;
    const payload = {
      props: { [P.BODY]: idea.body },
      out: { [P.PARENT]: subject, [P.IS]: ideaType },
      in: { [P.CHILD]: subject },
      document: { 
        [ROOT_SUBJECT]: {
          type: ideaType,
          children: []
        } 
      }
    };
    return axios
      .post(join(config.api_url, "node"), payload)
      .then(response => Object.assign({}, payload.props, { id: response.data, type: ideaType }))
      .catch(err => err)
  }

  updateIdea(idea) {
    const payload = {
      props: { [P.BODY]: idea.body },
      out: idea._previous_type === idea.type ? {} : { [P.IS]: idea.type },
      del: idea._previous_type === idea.type ? {} : { out: { [P.IS]: idea._previous_type } },
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

  deleteIdea(idea) {
    const props = {
      id: idea.id,
      [P.BODY]: idea.body,
      [P.CREATED]: idea.created
    };

    const inbound = Object.assign({ [P.TYPE]: idea.type },
      idea.children.reduce((acc, c) => Object.assign({}, acc, { [P.PARENT]: c.id }), {}),
      idea.parents.reduce((acc, p) => Object.assign({}, acc, { [P.CHILD]: p.id }), {}));

    const outbound = Object.assign({ [P.IS]: idea.type }, 
      idea.children.reduce((acc, c) => Object.assign({}, acc, { [P.CHILD]: c.id }), {}),
      idea.parents.reduce((acc, p) => Object.assign({}, acc, { [P.PARENT]: p.id }), {}));

    const payload = {
      del: {
        props: props,
        out: outbound,
        in: inbound
      },
      document: {
        [ROOT_SUBJECT]: {}
      }
    };

    return axios
      .post(join(config.api_url, `node/${idea.id}`), payload)
      .then(response => { return 'ok'; })
      .catch(err => err)
  }

  init() {
    const payload = SUPPORTED_TYPES.reduce((map, type) =>
      Object.assign({}, map, {
        [type]: {
          props: { id: type }, 
          out: { [P.IS]: ROOT_TYPE }, 
          in: { [P.TYPE]: ROOT_TYPE }
        }
      }), { idea: { props: { id: ROOT_TYPE } } });

    return axios
      .post(join(config.api_url, 'graph'), payload) 
      .then(() => "initialized")
      .catch(err => err);
  }
}

function queryProperties({ children, parents }) {
  const node = { 
    [P.IS]: {},
    [P.CREATED]: true
  };
  const body = {
    [P.BODY]: true
  };
  const nodeChildren = { 
    [P.CHILD]: children ? Object.assign({}, node, body, { [P.CHILD]: node }) : node
  };
  const nodeParents = parents ? {
    [P.PARENT]: Object.assign({}, node, body, { [P.CHILD]: node })
  } : {};

  return Object.assign({}, node, body, nodeChildren, nodeParents);
}

function buildProjection(idea) {
  
}

function toIdea(ideaResponse) {
  return {
    id: ideaResponse.id,
    body: ideaResponse[P.BODY],
    type: ideaResponse[P.IS] !== undefined ? ideaResponse[P.IS][0].id : ROOT_TYPE,
    created: ideaResponse[P.CREATED],
    children: (ideaResponse[P.CHILD] || []).map(c => toIdea(c)),
    parents: (ideaResponse[P.PARENT] || []).filter(p => p.id !== undefined).map(p => toIdea(p))
  };
}

export default new IdeasRepo();
