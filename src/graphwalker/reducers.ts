import { combineReducers } from 'redux';
import { createReducer, StateType } from 'typesafe-actions';
import * as actions from './actions';

import { errorViewReducer } from '../errorview/reducers';
import { typeAheadReducer } from '../typeahead/reducers';
import { GraphViewState } from './models/GraphViewState';
import { getNextScrollPositions, getIncidentEdgeCount } from './selectors';
import { IncidentEdgeDirection } from './models/Graph';

const graphViewReducer = createReducer<GraphViewState>({
  currentIncomingVertex: 0,
  currentOutgoingVertex: 0,
  totalIncomingVertices: 0,
  totalOutgoingVertices: 0
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
      currentIncomingVertex: 0,
      currentOutgoingVertex: 0,
      totalIncomingVertices: getIncidentEdgeCount(
        state.graph,
        action.payload,
        IncidentEdgeDirection.Incoming
      ),
      totalOutgoingVertices: getIncidentEdgeCount(state.graph, action.payload, IncidentEdgeDirection.Outgoing)
    };
  })
  .handleAction(actions.onScrollVertices, (state, action) => ({
    ...state,
    ...getNextScrollPositions(state, action.payload.groupType, action.payload.scrollDirection)
  }));

export const mainReducer = combineReducers({
  graphView: graphViewReducer,
  errorSummary: errorViewReducer,
  typeahead: typeAheadReducer
});

export type GlobalState = StateType<typeof mainReducer>;
