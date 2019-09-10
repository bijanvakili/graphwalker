import { createReducer } from 'typesafe-actions';

import * as typeAheadActions from './actions';
import * as graphWalkerActions from '../graphwalker/actions';
import { TypeAheadState } from './models';
import { nextSelection, getQueryResults } from './selectors';

const typeAheadParamDefaults = {
  query: '',
  results: [],
  currentSelection: undefined
};

export const typeAheadReducer = createReducer<TypeAheadState>(typeAheadParamDefaults)
  // store the graph when it is loaded
  .handleAction(graphWalkerActions.onGraphLoaded, (state, action) => ({ ...state, graph: action.payload }))
  // reset everything when a new vertex is selected
  .handleAction(graphWalkerActions.onVertexSelected, (state, action) => ({
    ...state,
    ...typeAheadParamDefaults
  }))
  // update the current selection if the user moves up or down
  .handleAction(typeAheadActions.moveSelection, (state, action) => ({
    ...state,
    currentSelection: nextSelection(getQueryResults(state), action.payload, state.currentSelection)
  }))
  // get new query results
  .handleAction(typeAheadActions.query, (state, action) => {
    return {
      ...state,
      query: action.payload
    };
  })
  // reset everything except the graph when the typeahead is reset
  .handleAction(typeAheadActions.reset, (state, action) => ({
    ...state,
    ...typeAheadParamDefaults
  }));
