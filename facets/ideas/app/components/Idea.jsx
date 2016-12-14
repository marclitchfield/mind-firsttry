import React from "react";
import moment from "moment";
import { Link } from "react-router";
import IdeaType from "./IdeaType";

export default class Idea extends React.Component {  
  render() {
    const { idea, hideType } = this.props;
    const created = idea.created || Date.now();
    const showType = !hideType;
    return (
      <Link to={"/idea/" + idea.id}>
        <div className="idea">
          <div>
            {showType ? <IdeaType value={idea.type} /> : null}
            <div className="body">{idea.body}</div>
            <div className="created">{moment(created).fromNow()}</div>
          </div>
        </div>
      </Link>
    );
  }
}
