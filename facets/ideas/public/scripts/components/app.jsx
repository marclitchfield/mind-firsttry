import React from "react";
import Header from "./header";
import Root from "./root";

export default function App (props) {
  return (
    <div className="content">
      <Header />
      <Root ideas={props.rootIdeas} />
    </div>
  );
}
