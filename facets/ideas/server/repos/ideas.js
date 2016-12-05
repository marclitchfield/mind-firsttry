import request from "axios";
import config from "../../config";
import join from "url-join";

const standardProperties = ["body", "created.at"];
const supportedPredicates = ["therefore", "because"]
const rootSubject = "ideas.facet";
const rootPredicate = "root.idea";

class IdeasRepo {

  getIdeas() {
    return request
      .post(join(config.api_url, "query", rootSubject), { [rootPredicate]: queryProperties() })
      .then((response) => {
        return [].concat(response.data.me[rootPredicate] || []).map((idea) => toIdea(idea));
      });
  }

  getIdea(id) {
    return request
      .post(join(config.api_url, "query", id), queryProperties())
      .then((response) => {
        return toIdea(response.data.me)
      });
  }

  submitIdea(idea, parent, predicate) {
    const properties = { is: 'idea', body: idea.body };
    const resource = parent === undefined ? join(rootSubject, rootPredicate) : join(parent, predicate);
    return request
      .post(join(config.api_url, "graph", resource), properties)
      .then((response) => {
        return Object.assign(properties, { id: response.data });
      });
  }

}

function queryProperties() {
  const node = () => standardProperties.reduce((props, p) => Object.assign({}, props, { [p]: true }), {});
  return supportedPredicates.reduce((props, p) => Object.assign({}, props, { [p]: node() }), node());
}

function toIdea(idea, predicate) {
  return {
    id: idea._xid_,
    body: idea.body,
    created: idea['created.at'],
    predicate,
    related: relatedIdeas(idea)
  };
}

function relatedIdeas(idea) {
  return supportedPredicates.reduce((relationships, p) => {
    const related = [].concat(idea[p] || []);
    return relationships.concat(related.map(i => toIdea(i, p)));
  }, []);
}

export default new IdeasRepo();
