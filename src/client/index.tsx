import * as React from "react";
import * as ReactDOM from "react-dom";
import { applyMiddleware, compose, createStore, Store } from "redux";
import reduxThunk from "redux-thunk";
import { Provider } from "react-redux";

import GraphWalkerApp from "./graphwalker/GraphWalkerApp";
import { UnrestrictedDictionary } from "./types/ObjectTypes";
import { GlobalState, mainReducer } from "./graphwalker/reducers";

import "./index.less";
import "images/favicon.ico";

type Window = UnrestrictedDictionary;

const middleware = [reduxThunk];
const enhancers = [applyMiddleware(...middleware)];
const w: Window = window;
if (w.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancers.push(w.__REDUX_DEVTOOLS_EXTENSION__());
}

const store: Store<GlobalState> = createStore(mainReducer, compose(...enhancers));

ReactDOM.render(
  <Provider store={store}>
    <GraphWalkerApp />
  </Provider>,
  document.getElementById("rootContainer")
);
