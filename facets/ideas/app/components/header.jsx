import React from "react";
import { Link } from "react-router";
import IdeaList from "./IdeaList";

export default class Header extends React.Component {
  render() {
    return (
      <div className="title-bar">
        <Link to="/" className="title-bar-title">Ideas</Link>
      </div>
    );
  }
}
