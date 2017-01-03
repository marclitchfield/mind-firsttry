import React from "react";
import { Link } from "react-router";
import IdeaList from "./IdeaList";

export default class Header extends React.Component {
  render() {
    return (
      <div className="title-bar">
        <Link to="/" className="title-bar-title">Ideas</Link>
        <Link to="/search" className="title-bar-search"><div className="fa fa-search"></div></Link>
      </div>
    );
  }
}
