import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import promise from "redux-promise-middleware";
import logger from "redux-logger";
import reducer from "./reducer";

const middleware = applyMiddleware(thunk, promise(), logger());

export default (initialState) => createStore(reducer, initialState, middleware);