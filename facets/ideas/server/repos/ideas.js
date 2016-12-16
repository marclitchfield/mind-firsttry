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

 // Investigate: if catch statements are removed, "Max promises reached" error is triggered by caller

  getIdeas() {
    return axios
      .post(join(config.api_url, "query", ROOT_SUBJECT), { [ROOT_PREDICATE]: queryProperties() })
      .then(response => {
        console.log(response);
        return [].concat(response.data[ROOT_PREDICATE] || []).map((idea) => toIdea(idea));
      })
      .catch(err => console.log('err', err));
  }

  getIdea(id) {
    return axios
      .post(join(config.api_url, "query", id), queryProperties())
      .then(response => {
        return toIdea(response.data)
      })
      .catch(err => undefined); 
  }

  createIdea(idea, parent, type) {
    const payload = {
      props: { body: idea.body },
      links: Object.assign({
        [TYPE_PREDICATE]: type || DEFAULT_TYPE
      }, parent !== undefined ? { [PARENT_PREDICATE]: parent } : {})
    }
    const resource = parent === undefined ? join(ROOT_SUBJECT, ROOT_PREDICATE) : join(parent, type);
    return axios
      .post(join(config.api_url, "graph", resource), payload)
      .then(response => {
        return Object.assign({}, payload.props, { id: response.data, type: type });
      })
      .catch(err => undefined); 
  }

  updateIdea(idea) {
    const payload = {
      props: { body: idea.body },
      links: idea.type === undefined ? {} : { [TYPE_PREDICATE]: idea.type },
      removals: idea._previous_type === idea.type ? {} : { [TYPE_PREDICATE]: idea._previous_type }
    }
    return axios
      .post(join(config.api_url, `graph/${idea.id}`), payload)
      .then(response => { return idea })
      .catch(err => undefined);
  }

  init() {
    const payload = [{ 
      props: { id: "idea" }, { links: { "is": "concept" } } 
    }].concat(SUPPORTED_TYPES.map(type => { 
      return { 
        props: { id: type }, links: { "is": "idea" }
      }
    }));

    return axios
      .post(join(config.api_url, 'graph'), payload) 
      .then(() => "initialized")
      .catch(err => undefined);
  }

}

function queryProperties() {
  const node = () => STANDARD_PREDICATES.reduce((props, p) => Object.assign({}, props, { [p]: true }), { [TYPE_PREDICATE]: {} });
  const predicates = SUPPORTED_TYPES.concat(PARENT_PREDICATE);
  return predicates.reduce((props, p) => Object.assign({}, props, { [p]: node() }), node());
}

function toIdea(ideaResponse) {
  return {
    id: ideaResponse.id,
    type: (ideaResponse.is || {}).id,
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
