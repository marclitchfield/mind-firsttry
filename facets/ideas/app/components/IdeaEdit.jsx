import React from "react";
import { SUPPORTED_TYPES } from "../constants";

export default class IdeaEdit extends React.Component {
  render() {
    return (
      <h2>Editing {this.props.idea.id}</h2>
    );
  }
}
