import { createReducer } from "typesafe-actions";

import * as typeAheadActions from "./actions";
import * as graphWalkerActions from "../graphwalker/actions";
import { TypeAheadState } from "./models";
import { nextSelection } from "./selectors";

const typeAheadParamDefaults = {
  query: "",
  results: [],
  currentSelection: undefined,
};

export const typeAheadReducer = createReducer<TypeAheadState>(typeAheadParamDefaults)
  // reset everything when a new vertex neighborhood is loaded
  .handleAction(graphWalkerActions.queryNeighborhoodAsync.success, (state, action) => ({
    ...state,
    ...typeAheadParamDefaults,
  }))
  // update the current selection if the user moves up or down
  .handleAction(typeAheadActions.moveSelection, (state, action) => ({
    ...state,
    currentSelection: nextSelection(state.results, action.payload, state.currentSelection),
  }))
  // start a new query
  .handleAction(typeAheadActions.queryVertexMatchAsync.request, (state, action) => ({
    ...state,
    query: action.payload,
  }))
  // get new query results
  .handleAction(typeAheadActions.queryVertexMatchAsync.success, (state, action) => {
    return {
      ...state,
      results: action.payload,
    };
  })
  // reset everything except the graph when the typeahead is reset
  .handleAction(typeAheadActions.reset, (state, action) => ({
    ...state,
    ...typeAheadParamDefaults,
  }));
