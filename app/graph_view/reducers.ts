import {AnyAction} from 'redux';
import {handleActions, ReducerMap} from 'redux-actions';

import {Graph, IncidentEdgeDirection, ScrollDirection} from '../root/models/Graph';
import {Settings} from '../root/models/Settings';
import {findVertexById} from '../root/selectors';
import SvgStyles from '../SvgStyles';
import {GraphViewState} from './models';
import {getAdjacentVertexIdFromEdge, getIncidentEdges} from './selectors';

export default function makeGraphViewReducer() {
    const initialState = {
        currItemIncoming: 0,
        currItemOutgoing: 0,
    };

    return handleActions({
        ROOT: {
            OFFSCREEN_UTILS_LOADED: (state: GraphViewState, action: AnyAction) => {
                return {
                    ...state,
                    getTextDimensions: action.payload.getTextDimensions
                };
            },
            ALL_DATA_LOADED: (state: GraphViewState, action: AnyAction) => {
                const settings: Settings = action.payload.settings;
                const graph: Graph = action.payload.graph;
                const iconDimensions = settings.images['basic_node.svg'];
                const vertexIconStyle = SvgStyles.getStyles('vertexIcon');
                const vertexTextStyle = SvgStyles.getStyles('vertexText');

                return {
                    ...state,
                    images: settings.images,
                    vertexColumnPageSize: settings.vertexColumnPageSize,
                    connectionYOffset: ((vertexIconStyle.y + iconDimensions.height) / 2.0) + 1,
                    connectionXOffsetLeft: vertexIconStyle.x,
                    connectionXOffsetRight: iconDimensions.width,
                    vertexLabelAnchor: {
                        x: vertexTextStyle.x + iconDimensions.width / 2.0,
                        y: vertexTextStyle.y + iconDimensions.height
                    },

                    findVertexById: (vertexId: string) => findVertexById(graph, vertexId),
                    getIncidentEdges: (v: string, d: IncidentEdgeDirection) => getIncidentEdges(graph, v, d),
                    getAdjacentVertexIdFromEdge,
                };
            },
            ON_VERTEX_SELECTED: (state: GraphViewState, action: AnyAction) => {
                return {
                    ...state,
                    currVertexId: action.payload.vertexId,
                    currItemIncoming: 0,
                    currItemOutgoing: 0,
                };
            },
        },
        GRAPH: {
            SCROLL_COLUMN: (state: GraphViewState, action: AnyAction) => {
                const {direction, columnGroup, maxItems} = action.payload;
                const delta = (direction === ScrollDirection.Down) ? 1 : -1;
                const fClamp = (direction === ScrollDirection.Down) ? Math.min : Math.max;
                const boundary = (direction === ScrollDirection.Down) ?
                    Math.max(maxItems - state.vertexColumnPageSize, 0) : 0;

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
