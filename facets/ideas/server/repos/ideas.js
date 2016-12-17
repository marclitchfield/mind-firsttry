import axios from "axios";
import join from "url-join";
import config from "../../config";
import { SUPPORTED_TYPES } from "../../app/constants";

const STANDARD_PREDICATES = ["body", "created.at"];
const TYPE_PREDICATE = "is";
const DEFAULT_TYPE = "idea";
const ROOT_SUBJECT = "ideas.facet";
const PARENT_PREDICATE = "idea.parent";
const CHILD_PREDICATE = "idea.child";

class IdeasRepo {

  getIdeas() {
    return axios
      .post(join(config.api_url, "query", ROOT_SUBJECT), { 
        [CHILD_PREDICATE]: queryProperties({ children: false, parents: false }) 
      })
      .then(response => {
        return [].concat(response.data[CHILD_PREDICATE] || []).map((idea) => toIdea(idea));
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
    const subject = parent === undefined ? ROOT_SUBJECT : parent;
    const payload = {
      props: { body: idea.body },
      out: { [PARENT_PREDICATE]: subject, is: type || DEFAULT_TYPE },
      in: { [CHILD_PREDICATE]: subject }
    };

    return axios
      .post(join(config.api_url, "node"), payload)
      .then(response => {
        return Object.assign({}, payload.props, { id: response.data, type: type });
      });
  }

  updateIdea(idea) {
    const payload = {
      props: { body: idea.body },
      out: idea._previous_type === idea.type ? {} : { is: idea.type },
      del: idea._previous_type === idea.type ? {} : { is: idea._previous_type }
    };

    return axios
      .post(join(config.api_url, `node/${idea.id}`), payload)
      .then(response => { return idea })
      .catch(err => undefined);
  }

  init() {
    const payload = SUPPORTED_TYPES.reduce((map, type) =>
      Object.assign({}, map, {
        [type]: {
          props: { id: type }, 
          out: { is: "idea" }, 
          in: { type: "idea" }
        }
      }), { idea: { props: { id: "idea" } } });

    return axios
      .post(join(config.api_url, 'graph'), payload) 
      .then(() => "initialized")
      .catch(err => undefined);
  }
}

function queryProperties({ children, parents }) {
  const node = () => STANDARD_PREDICATES.reduce((props, p) => 
    Object.assign({}, props, { [p]: true, is: {} }), {});

  return Object.assign(node(), 
    parents ? { [PARENT_PREDICATE]: node() } : {},
    children ? { [CHILD_PREDICATE]: node() } : {});
}

function toIdea(ideaResponse) {
  return {
    id: ideaResponse.id,
    body: ideaResponse.body,
    type: ideaResponse.is[0].id,
    created: ideaResponse['created.at'],
    children: (ideaResponse[CHILD_PREDICATE] || []).map(i => toIdea(i)),
    parents: (ideaResponse[PARENT_PREDICATE] || []).map(i => toIdea(i))
  };
}

export default new IdeasRepo();
