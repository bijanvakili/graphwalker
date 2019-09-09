import { createStandardAction } from 'typesafe-actions';
import { ThunkAction } from 'redux-thunk';

import { VertexScrollDirection } from './constants';
import { getVertexIdHash } from './selectors';
import { GlobalState } from './reducers';
import { Settings } from './models/Settings';
import { Graph, IncidentEdgeDirection } from './models/Graph';

export const onSettingsLoaded = createStandardAction('graphwalker/ON_SETTINGS_LOADED')<Settings>();

export const onGraphLoaded = createStandardAction('graphwalker/ON_GRAPH_LOADED')<Graph>();

export const selectVertex = (vertexId: string): ThunkAction<void, GlobalState, void, any> => (
  dispatch,
  getState
) => {
  // start the switch to a new vertex by changing the URL hash
  window.location.hash = getVertexIdHash(vertexId);
};

export const onVertexSelected = createStandardAction('graphwalker/ON_VERTEX_SELECTED')<string>();

interface VertexScrollParameters {
  groupType: IncidentEdgeDirection;
  scrollDirection: VertexScrollDirection;
}

export const onScrollVertices = createStandardAction('graphwalker/ON_SCROLL_VERTICES')<
  VertexScrollParameters
>();
