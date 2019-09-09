import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import reduxThunk from 'redux-thunk';
import { Provider } from 'react-redux';

import GraphWalkerApp from './graphwalker/GraphWalkerApp';
import { UnrestrictedDictionary } from './types/ObjectTypes';
import { GlobalState, mainReducer } from './graphwalker/reducers';

import './index.less';

type Window = UnrestrictedDictionary;

const middleware = [reduxThunk];
const enhanceStoreDevTools = (w: Window) =>
  w.__REDUX_DEVTOOLS_EXTENSION__ && w.__REDUX_DEVTOOLS_EXTENSION__();
const store: Store<GlobalState> = createStore(
  mainReducer,
  compose(
    applyMiddleware(...middleware),
    enhanceStoreDevTools(window)
  )
);

ReactDOM.render(
  <Provider store={store}>
    <GraphWalkerApp />
  </Provider>,
  document.getElementById('rootContainer')
);
