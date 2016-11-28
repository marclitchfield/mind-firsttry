import React from "react";
import moment from "moment";

export default class Idea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childrenVisible: false
    };

    this.toggleChildren = this.toggleChildren.bind(this);
  }

  toggleChildren() {
    this.setState({
      childrenVisible: !this.state.childrenVisible
    });
  }

  render() {
    const created = this.props.idea.created || Date.now();
    return (
      <div className="idea" onClick={this.toggleChildren}>
        <div>{this.props.idea.body}</div>
        <div className="created">{moment(created).fromNow()}</div>
        { 
          this.state.childrenVisible ?
            <div className="children">
              {this.props.children}
            </div> : null 
        }
      </div>
    );
  }
}
