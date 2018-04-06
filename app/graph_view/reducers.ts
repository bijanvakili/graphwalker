import {AnyAction} from 'redux';
import {handleActions, ReducerMap} from 'redux-actions';

import {Edge, IncidentEdgeDirection, ScrollDirection, Vertex} from '../root/models/Graph';
import {GraphViewState} from './models';

export default function makeGraphViewReducer() {
    const initialState = {
        graphData: {vertices: [] as Vertex[], edges: [] as Edge[]},
        currVertexId: '',
        currItemIncoming: 0,
        currItemOutgoing: 0,
    };

    return handleActions({
        ROOT: {
            ON_VERTEX_SELECTED: (state: GraphViewState, action: AnyAction) => {
                return {
                    ...state,
                    currVertexId: action.payload.vertexId,
                    currItemIncoming: 0,
                    currItemOutgoing: 0,
                };
            },
            ON_GRAPH_DATA_LOADED: (state: GraphViewState, action: AnyAction) => {
                return {
                    ...state,
                    graphData: action.payload.graphData,
                };
            },
        },
        GRAPH: {
            SCROLL_COLUMN: (state: GraphViewState, action: AnyAction) => {
                const {direction, columnGroup, maxItems, maxVisibleItems} = action.payload;
                const delta = (direction === ScrollDirection.Down) ? 1 : -1;
                const fClamp = (direction === ScrollDirection.Down) ? Math.min : Math.max;
                const boundary = (direction === ScrollDirection.Down) ?
                    Math.max(maxItems - maxVisibleItems, 0) : 0;

                if (columnGroup === IncidentEdgeDirection.Incoming) {
                    return {
                        ...state,
                        currItemIncoming: fClamp(
                            state.currItemIncoming + delta,
                            boundary
                        )
                    };
                } else {
                    return {
                        ...state,
                        currItemOutgoing: fClamp(
                            state.currItemOutgoing + delta,
                            boundary
                        )
                    };
                }
            },
        }
    } as ReducerMap<GraphViewState>, initialState);
}
