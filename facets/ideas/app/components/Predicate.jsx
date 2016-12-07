import React from "react";
import { supportedPredicates, predicateColors } from "../constants";

export default function Predicate(props) {
  const color = Math.floor(supportedPredicates.indexOf(props.value) / supportedPredicates.length * 360);

  return props.value ? <div className="predicate" 
    style={{backgroundColor: `hsl(${color},80%,70%)`}}>{props.value}</div> : null;
}