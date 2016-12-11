import React from "react";
import moment from "moment";
import { Link } from "react-router";
import IdeaType from "./IdeaType";

export default class Idea extends React.Component {  
  render() {
    const created = this.props.idea.created || Date.now();
    const showType = !this.props.hideType;
    return (
      <Link to={"/idea/" + this.props.idea.id}>
        <div className="idea">
          {this.props.showParents ? this.renderParents() : null}
          <div>
            {showType ? <IdeaType value={this.props.idea.type} /> : null}
            <div className="body">{this.props.idea.body}</div>
            <div className="created">{moment(created).fromNow()}</div>
          </div>
        </div>
      </Link>
    );
  }

  renderParents() {
    return this.props.idea.parents.map(p => 
      <div className="parents" key={p.id}>
        <Link to={"/idea/" + p.id}>
          <div className="body">{p.body}</div>
        </Link>
      </div>);
  }
}
