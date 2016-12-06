import React from "react";
import moment from "moment";
import { Link } from "react-router";
import Predicate from "./predicate";
import _ from "lodash/core";

export default class Idea extends React.Component {
  render() {
    const created = this.props.idea.created || Date.now();
    const sortedChildren = _.sortBy(this.props.relationships, (rel) => rel.idea.created);
    return (
      <Link to={"/idea/" + this.props.idea.id}>
        <div className="idea">
          <Predicate value={this.props.idea.predicate} />
          <div className="body">{this.props.idea.body}</div>
          <div className="created">{moment(created).fromNow()}</div>
        </div>
      </Link>
    );
  }
}
