import React from "react";
import ReactDOM from "react-dom";
import App from "components/app";

let initialData = document.getElementById("initial-data").textContent;
if (initialData) { initialData = JSON.parse(initialData); }

ReactDOM.render(<App initialData={initialData} />, document.getElementById("content"));
