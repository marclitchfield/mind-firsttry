import React from "react";
import moment from "moment";
import { Link } from "react-router";
import IdeaType from "./IdeaType";

export default class Idea extends React.Component {  
  render() {
    const { idea } = this.props;
    const created = idea.created || Date.now();
    return (
      <Link to={"/idea/" + idea.id}>
        <div className="idea">
          <div>
            <IdeaType value={idea.type} />
            <div className="body">{idea.body}</div>
            <div className="created">{moment(created).fromNow()}</div>
          </div>
        </div>
      </Link>
    );
  }
}
