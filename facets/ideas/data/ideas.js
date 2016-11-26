import request from "superagent";
import config from "../config";

export default class IdeasRepo {
  rootIdeas() {
    return new Promise((resolve, reject) => {
      
      request.post(config.api_url + "/query/facets.idea", { "root.idea": { body: true } })
        .end((err, response) => {
          if (err) { return reject(err); }
          const res = JSON.parse(response.text);
          const ideas = [].concat(res.me["root.idea"]).map((idea) => {
            return {
              id: idea._xid_,
              body: idea.body
            }
          });
          resolve(ideas);
        });

    });
  }
}
