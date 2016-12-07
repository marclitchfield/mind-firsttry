import axios from "axios";
import join from "url-join";
import config from "../../config";
import { supportedPredicates } from "../../app/constants";

const standardProperties = ["body", "created.at"];
const rootSubject = "ideas.facet";
const rootPredicate = "root.idea";
const inversePredicateSuffix = ".for";

class IdeasRepo {

  getIdeas() {
    return axios
      .post(join(config.api_url, "query", rootSubject), { [rootPredicate]: queryProperties() })
      .then(response => {
        return [].concat(response.data.me[rootPredicate] || []).map((idea) => toIdea(idea));
      });
  }

  getIdea(id) {
    return axios
      .post(join(config.api_url, "query", id), queryProperties())
      .then(response => {
        return toIdea(response.data.me)
      });
  }

  submitIdea(idea, parent, predicate) {
    const inversePredicate = predicate + inversePredicateSuffix;
    const properties = { 
      is: 'idea', 
      body: idea.body,
      links: {
        [inversePredicate]: parent
      }
    };
    const resource = parent === undefined ? join(rootSubject, rootPredicate) : join(parent, predicate);
    return axios
      .post(join(config.api_url, "graph", resource), properties)
      .then(response => {
        return Object.assign(properties, { id: response.data, predicate: predicate });
      })
      .catch(err => undefined);  // Investigate: if this line is removed, "Max promises reached" error is triggered by caller
  }

}

function queryProperties() {
  const node = () => standardProperties.reduce((props, p) => Object.assign({}, props, { [p]: true }), {});
  const predicates = supportedPredicates.concat(supportedPredicates.map(p => p + inversePredicateSuffix));
  return predicates.reduce((props, p) => Object.assign({}, props, { [p]: node() }), node());
}

function toIdea(idea, predicate) {
  return {
    id: idea._xid_,
    body: idea.body,
    created: idea['created.at'],
    predicate,
    related: relatedIdeas(idea),
    parents: parentIdeas(idea)
  };
}

function relatedIdeas(idea) {
  return supportedPredicates.reduce((relationships, p) => {
    const related = [].concat(idea[p] || []);
    return relationships.concat(related.map(i => toIdea(i, p)));
  }, []);
}

function parentIdeas(idea) {
  return supportedPredicates.reduce((parents, p) => {
    const related = [].concat(idea[p + inversePredicateSuffix] || []);
    return parents.concat(related.map(i => toIdea(i, p)))
  }, []);
}

export default new IdeasRepo();
