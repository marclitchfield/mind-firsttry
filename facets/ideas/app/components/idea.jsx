import React from "react";
import moment from "moment";
import { Link } from "react-router";
import _ from "lodash/core";

export default class Idea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childrenVisible: false
    };

    this.toggleChildren = this.toggleChildren.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
  }

  toggleChildren() {
    this.setState({
      childrenVisible: !this.state.childrenVisible
    });
  }

  renderChildren() {
    return 
      this.state.childrenVisible ?
      (<div className="relationships">
        {sortedChildren.map(rel => 
          <div className="relationship" key={rel.idea.id}>
            <span className="predicate">{rel.predicate}</span>
            <span className="body">{rel.idea.body}</span>
          </div>
          )}
      </div>) : null;
  }

  render() {
    const created = this.props.idea.created || Date.now();
    const sortedChildren = _.sortBy(this.props.relationships, (rel) => rel.idea.created);
    return (
      <div className="idea" onClick={this.toggleChildren}>
        <Link to={"/idea/" + this.props.idea.id}>{this.props.idea.body}</Link>
        <div className="created">{moment(created).fromNow()}</div>
        {this.renderChildren()}
      </div>
    );
  }
}
