import React from "react";
import moment from "moment";
import { Link } from "react-router";
import IdeaType from "./IdeaType";
import _ from "lodash/core";

export default class Idea extends React.Component {  
  render() {
    const { idea } = this.props;
    const created = idea.created || Date.now();
    const sortedChildren = _.sortBy(idea.children || [], 'created');
    
    return (
      <Link to={"/idea/" + idea.id}>
        <div className="idea">
          <div>
            <IdeaType value={idea.type} />
            <div className="body">{idea.body}</div>
            <div className="created">{moment(created).fromNow()}</div>
          </div>
          <div className="child-indicators">
            {sortedChildren.map(c => <IdeaType key={c.id} value={c.type} />)}
          </div>
        </div>
      </Link>
    );
  }
}
