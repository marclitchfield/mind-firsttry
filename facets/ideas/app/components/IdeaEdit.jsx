import React from "react";
import { SUPPORTED_TYPES } from "../constants";

const DEFAULT_TYPE = "reason";

export default class IdeaSubmit extends React.Component {
  render() {
    return (
      <h2>Editing {this.props.idea.id}</h2>
    );
  }
}
