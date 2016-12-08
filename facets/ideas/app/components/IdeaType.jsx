import React from "react";
import { SUPPORTED_TYPES } from "../constants";

export default function IdeaType(props) {
  const color = Math.floor(SUPPORTED_TYPES.indexOf(props.value) / SUPPORTED_TYPES.length * 360);

  return props.value ? <div className="idea-type" 
    style={{backgroundColor: `hsl(${color},80%,70%)`}}>{props.value}</div> : null;
}