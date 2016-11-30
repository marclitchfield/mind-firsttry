import React from "react";
import Root from "./root";
import { Link } from "react-router";

export default class Header extends React.Component {
  render() {
    return (
      <div className="title-bar">
        <Link to="/" className="title-bar-title">Ideas</Link>
      </div>
    );
  }
}
