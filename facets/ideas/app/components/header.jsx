import React from "react";
import { Link } from "react-router";
import Root from "../containers/root";

export default class Header extends React.Component {
  render() {
    return (
      <div className="title-bar">
        <Link to="/" className="title-bar-title">Ideas</Link>
      </div>
    );
  }
}
