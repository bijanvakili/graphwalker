import { createStandardAction, createAsyncAction } from "typesafe-actions";
import { ThunkAction } from "redux-thunk";

import { IncidentEdgeDirection, VertexScrollDirection } from "./constants";
import { getVertexIdHash } from "./selectors";
import { GlobalState } from "./reducers";
import { Neighborhood, RenderSettings } from "./models/Graphwalker";
import { getVertexNeighborhood } from "../api";
import { onError as rootOnError } from "../errorview/actions";

export const onSettingsLoaded = createStandardAction("graphwalker/ON_SETTINGS_LOADED")<RenderSettings>();

export const queryNeighborhoodAsync = createAsyncAction(
  "graphwalker/QUERY_NEIGHBORHOOD_REQUEST",
  "graphwalker/QUERY_NEIGHBORHOOD_SUCCESS",
  "graphwalker/QUERY_NEIGHBORHOOD_FAILURE"
)<string, Neighborhood, Error>();

export const selectVertex = (vertexId: string): ThunkAction<void, GlobalState, void, any> => (
  dispatch,
  getState
) => {
  // start the switch to a new vertex by changing the URL hash
  window.location.hash = getVertexIdHash(vertexId);
};

export const queryNeighborhood = (vertexId: string): ThunkAction<void, GlobalState, void, any> => async (
  dispatch,
  getState
) => {
  dispatch(queryNeighborhoodAsync.request(vertexId));

  let neighborhood: Neighborhood;
  try {
    neighborhood = await getVertexNeighborhood(vertexId);
  } catch (error) {
    dispatch(queryNeighborhoodAsync.failure(error));
    dispatch(rootOnError(error, undefined));
    return;
  }

  dispatch(queryNeighborhoodAsync.success(neighborhood));
};

interface VertexScrollParameters {
  groupType: IncidentEdgeDirection;
  scrollDirection: VertexScrollDirection;
}

export const onScrollVertices = createStandardAction("graphwalker/ON_SCROLL_VERTICES")<
  VertexScrollParameters
>();
