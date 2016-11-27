import request from "axios";
import config from "../config";

export default class IdeasRepo {
  rootIdeas() {
    return request
      .post(config.api_url + "/query/ideas.facet", { "root.idea": { body: true } })
      .then((response) => {
        return [].concat(response.data.me["root.idea"] || []).map((idea) => {
          return {
            id: idea._xid_,
            body: idea.body
          }
        });
      });
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
