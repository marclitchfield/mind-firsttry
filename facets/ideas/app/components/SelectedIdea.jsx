import React from "react";
import moment from "moment";
import { Link } from "react-router";
import IdeaType from "./IdeaType";
import _ from "lodash/core";

export default class SelectedIdea extends React.Component {  
  render() {
    const created = this.props.idea.created || Date.now();
    const sortedChildren = _.sortBy(this.props.relationships, (rel) => rel.idea.created);
    const showType = this.props.idea.parents.length > 0;
    return (
      <div className="idea selected">
        { this.renderParents() }
        <div className="selection">
          {showType ? <IdeaType value={this.props.idea.type} /> : null}
          <div className="body">{this.props.idea.body}</div>
          <div className="created">{moment(created).fromNow()}</div>
        </div>
        <div className="children">
          { this.props.children }
        </div>
      </div>
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
