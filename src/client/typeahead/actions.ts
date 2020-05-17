import { ThunkAction } from "redux-thunk";
import { createAction, createStandardAction, createAsyncAction } from "typesafe-actions";

import { GlobalState } from "../graphwalker/reducers";
import { Vertex } from "../graphwalker/models/Graphwalker";
import { TypeAheadSelectDirection } from "./constants";
import { findMatchingVertices } from "../api";
import { onError as rootOnError } from "../errorview/actions";

export const moveSelection = createStandardAction("typeahead/MOVE_SELECTION")<TypeAheadSelectDirection>();
export const reset = createAction("typeahead/RESET");

export const queryVertexMatchAsync = createAsyncAction(
  "typeahead/QUERY_VERTEX_MATCH_STARTED",
  "typeahead/QUERY_VERTEX_MATCH_SUCCESS",
  "typeahead/QUERY_VERTEX_MATCH_FAILURE"
)<string, Vertex[], Error>();

export const queryVertexMatch = (textQuery: string): ThunkAction<void, GlobalState, void, any> => async (
  dispatch,
  getState
) => {
  await dispatch(queryVertexMatchAsync.request(textQuery));
  let results: Vertex[];
  try {
    results = await findMatchingVertices(textQuery);
  } catch (error) {
    dispatch(queryVertexMatchAsync.failure(error));
    dispatch(rootOnError(error, undefined));
    return;
  }
  dispatch(queryVertexMatchAsync.success(results));
};
