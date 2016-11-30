import React from "react";
import moment from "moment";
import { Link } from "react-router";

export default class Idea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childrenVisible: false
    };

    this.toggleChildren = this.toggleChildren.bind(this);
  }

  toggleChildren() {
    console.log('toggleChildren');
    this.setState({
      childrenVisible: !this.state.childrenVisible
    });
  }

  render() {
    const created = this.props.idea.created || Date.now();
    return (
      <div className="idea" onClick={this.toggleChildren}>
        <Link to={"/idea/"+this.props.idea.id}>{this.props.idea.body}</Link>
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
