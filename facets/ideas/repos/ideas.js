import request from "axios";
import config from "../config";

const standardProperties = ["body", "created.at"];
const supportedPredicates = ["therefore", "because"]

class IdeasRepo {

  rootIdeas() {
    const node = () => standardProperties.reduce((props, p) => Object.assign({}, props, { [p]: true }), {});
    const properties = supportedPredicates.reduce((props, p) => Object.assign({}, props, { [p]: node() }), node());
    return request
      .post(config.api_url + "/query/ideas.facet", { "root.idea": properties })
      .then((response) => {
        return [].concat(response.data.me["root.idea"] || []).map((idea) => this.to_idea(idea));
      });
  }

  to_idea(idea) {
    return {
      id: idea._xid_,
      body: idea.body,
      created: idea['created.at'],
      relationships: this.relationships_for(idea)
    };
  }

  relationships_for(idea) {
    return supportedPredicates.reduce((relationships, p) => {
      const related = [].concat(idea[p] || []);
      return relationships.concat(related.map(i => {
        return {
          predicate: p,
          idea: this.to_idea(i)
        };
      }));
    }, []);
  }

  submitRootIdea(idea) {
    const properties = { is: 'idea', body: idea.body };
    return request
      .post(config.api_url + "/graph/ideas.facet/root.idea", properties)
      .then((response) => {
        return Object.assign(properties, { id: response.data });
      });
  }
  
}

export let ideasRepo = new IdeasRepo();