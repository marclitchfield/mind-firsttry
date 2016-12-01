import React from "react";
import Idea from "../components/idea";

export default class Details extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>Will show idea {this.props.params.id}</div>
    );
  }
}
