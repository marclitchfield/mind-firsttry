import axios from "axios";
import join from "url-join";
import config from "../../config";
import { SUPPORTED_TYPES } from "../../app/constants";

const STANDARD_PREDICATES = ["body", "created.at"];
const TYPE_PREDICATE = "is";
const DEFAULT_TYPE = "idea";
const ROOT_SUBJECT = "ideas.facet";
const ROOT_PREDICATE = "root.idea";
const PARENT_PREDICATE = "idea.parent";

class IdeasRepo {

  getIdeas() {
    return axios
      .post(join(config.api_url, "query", ROOT_SUBJECT), { [ROOT_PREDICATE]: queryProperties() })
      .then(response => {
        return [].concat(response.data.me[ROOT_PREDICATE] || []).map((idea) => toIdea(idea));
      });
  }

  getIdea(id) {
    return axios
      .post(join(config.api_url, "query", id), queryProperties())
      .then(response => {
        return toIdea(response.data.me)
      });
  }

  submitIdea(idea, parent, type) {
    const properties = { 
      [TYPE_PREDICATE]: type || DEFAULT_TYPE, 
      body: idea.body,
      links: parent !== undefined ? { [PARENT_PREDICATE]: parent } : {}
    }
    const resource = parent === undefined ? join(ROOT_SUBJECT, ROOT_PREDICATE) : join(parent, type);
    return axios
      .post(join(config.api_url, "graph", resource), properties)
      .then(response => {
        console.log('response.data', response.data);
        return Object.assign(properties, { id: response.data, type: type });
      })
      .catch(err => undefined);  // Investigate: if this line is removed, "Max promises reached" error is triggered by caller
  }

}

function queryProperties() {
  const node = () => STANDARD_PREDICATES.reduce((props, p) => Object.assign({}, props, { [p]: true }), { [TYPE_PREDICATE]: {} });
  const predicates = SUPPORTED_TYPES.concat(PARENT_PREDICATE);
  return predicates.reduce((props, p) => Object.assign({}, props, { [p]: node() }), node());
}

function toIdea(ideaResponse) {
  return {
    id: ideaResponse._xid_,
    type: (ideaResponse.is || {})._xid_,
    body: ideaResponse.body,
    created: ideaResponse['created.at'],
    children: childIdeas(ideaResponse),
    parents: parentIdeas(ideaResponse)
  };
}

function childIdeas(ideaResponse) {
  return SUPPORTED_TYPES.reduce((children, t) => {
    return children.concat([].concat(ideaResponse[t] || []).map(i => toIdea(i)));
  }, []);
}

function parentIdeas(ideaResponse) {
  return [].concat(ideaResponse[PARENT_PREDICATE] || []).map(i => toIdea(i));
}

export default new IdeasRepo();
