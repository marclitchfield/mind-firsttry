import { applyMiddleware, createStore, compose } from "redux";
import promise from "redux-promise-middleware";
import logger from "redux-logger";
import reducer from "./reducer";

const composeEnhancers = global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = composeEnhancers(applyMiddleware(promise(), logger()));

export default (initialState) => createStore(reducer, initialState, middleware);