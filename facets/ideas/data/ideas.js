import request from "axios";
import config from "../config";

export default class IdeasRepo {
  rootIdeas() {
    return request
      .post(config.api_url + "/query/ideas.facet", { 
        "root.idea": { 
          body: true, 
          "created.at": true,
          "therefore": { body: true, "created.at": true },
          "because": { body: true, "created.at": true }
        } 
      })
      .then((response) => {
        return [].concat(response.data.me["root.idea"] || []).map((idea) => this.to_idea(idea));
      });
  }

  to_idea(idea) {
    const i = {
      id: idea._xid_,
      body: idea.body,
      created: idea['created.at'],
      relationships: this.relationships_for(idea)
    }
    return i;
  }

  // TODO: clean this up!
  relationships_for(idea) {
    const therefore = [].concat(idea.therefore || []).map((i) => { return { predicate: 'therefore', idea: this.to_idea(i) }; });
    const because = [].concat(idea.because || []).map((i) => { return { predicate: 'because', idea: this.to_idea(i) }; });
    return therefore.concat(because);
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

