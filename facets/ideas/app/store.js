import { applyMiddleware, createStore } from "redux";
import promise from "redux-promise-middleware";
import logger from "redux-logger";
import reducer from "./reducer";

const middleware = applyMiddleware(promise(), logger());

export default (initialState) => createStore(reducer, initialState, middleware);