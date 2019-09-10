import { combineReducers } from 'redux';
import { createReducer, StateType } from 'typesafe-actions';
import * as actions from './actions';

import { errorViewReducer } from '../errorview/reducers';
import { typeAheadReducer } from '../typeahead/reducers';
import { IncidentEdgeDirection } from './models/Graph';
import { GraphViewState } from './models/GraphViewState';
import { getNextScrollPositions } from './selectors';

const graphViewReducer = createReducer<GraphViewState>({
  currentScrollPositions: {
    [IncidentEdgeDirection.Incoming]: 0,
    [IncidentEdgeDirection.Outgoing]: 0
  }
})
  .handleAction(actions.onSettingsLoaded, (state, action) => ({
    ...state,
    settings: action.payload
  }))
  .handleAction(actions.onGraphLoaded, (state, action) => ({
    ...state,
    graph: action.payload
  }))
  .handleAction(actions.onVertexSelected, (state, action) => {
    if (!state.graph) {
      throw new Error('actions.selectVertexId called before actions.onGraphLoaded');
    }

    return {
      ...state,
      currentVertexId: action.payload,
      currentScrollPositions: {
        [IncidentEdgeDirection.Incoming]: 0,
        [IncidentEdgeDirection.Outgoing]: 0
      }
    };
  })
  .handleAction(actions.onScrollVertices, (state, action) => ({
    ...state,
    currentScrollPositions: getNextScrollPositions(
      state,
      action.payload.groupType,
      action.payload.scrollDirection
    )
  }));

export const mainReducer = combineReducers({
  graphView: graphViewReducer,
  errorSummary: errorViewReducer,
  typeahead: typeAheadReducer
});

export type GlobalState = StateType<typeof mainReducer>;
