import axios from "axios";
import join from "url-join";
import config from "../../config";
import { SUPPORTED_TYPES, ROOT_TYPE } from "../../app/constants";

const P = {
  BODY: "body",
  CREATED: "created.at",
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
      in: { [P.CHILD]: subject }
    };

    return axios
      .post(join(config.api_url, "node"), payload)
      .then(response => {
        return Object.assign({}, payload.props, { id: response.data, type: ideaType });
      });
  }

  updateIdea(idea) {
    const payload = {
      props: { [P.BODY]: idea.body },
      out: idea._previous_type === idea.type ? {} : { [P.IS]: idea.type },
      del: idea._previous_type === idea.type ? {} : { out: { [P.IS]: idea._previous_type } }
    };

    return axios
      .post(join(config.api_url, `node/${idea.id}`), payload)
      .then(response => { return idea });
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
      }
    };

    return axios
      .post(join(config.api_url, `node/${idea.id}`), payload)
      .then(response => { return 'ok'; });
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
      .catch(err => undefined);
  }
}

function queryProperties({ children, parents }) {
  const node = { 
    [P.BODY]: true,
    [P.CREATED]: true,
    [P.IS]: {}
  };

  return Object.assign({}, node, 
    parents ? { [P.PARENT]: node } : {},
    children ? { [P.CHILD]: node } : {});
}

function toIdea(ideaResponse) {
  return {
    id: ideaResponse.id,
    body: ideaResponse[P.BODY],
    type: ideaResponse[P.IS][0].id,
    created: ideaResponse[P.CREATED],
    children: (ideaResponse[P.CHILD] || []).map(i => toIdea(i)),
    parents: (ideaResponse[P.PARENT] || []).map(i => toIdea(i))
  };
}

export default new IdeasRepo();
