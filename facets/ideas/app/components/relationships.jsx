import React from "react";
import _ from "lodash/core";

export default class Relationships extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    console.log('got props', this.props);
    var sortedRelationships = _.sortBy(this.props.relationships, (rel) => rel.idea.created);
    return (
      <div className="relationships">
        {sortedRelationships.map((rel) => 
          <div className="relationship" key={rel.idea.id}>
            <span className="predicate">{rel.predicate}</span>
            <span className="body">{rel.idea.body}</span>
          </div>
          )}
      </div>
    );
  }
}
