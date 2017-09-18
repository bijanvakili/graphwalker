import {push} from 'react-router-redux';
import {Dispatch} from 'redux';
import {createActions} from 'redux-actions';

import {GlobalState} from './models/GlobalState';
import {Graph} from './models/Graph';
import {Settings} from './models/Settings';
import {TextDimensionsFunction} from './models/UI';

const actionMap = createActions({
    ROOT: {
        ERROR: (err: Error) => ({error: true, payload: err}),
        OFFSCREEN_UTILS_LOADED: (getTextDimensions: TextDimensionsFunction) => ({getTextDimensions}),
        ALL_DATA_LOADED: (settings: Settings, graph: Graph) => ({settings, graph}),
        ON_VERTEX_SELECTED: (vertexId: string) => ({vertexId}),
   }
});

const rootActions = (actionMap.root as any);
rootActions.selectVertex = (vertexId: string) => {
    return (dispatch: Dispatch<GlobalState>, getState: () => GlobalState) => {
        // if we're already at the vertex, don't call the router and instead just broadcast
        // that the vertex already changed
        const graphState = getState().graphState;
        if (graphState && vertexId === graphState.currVertexId) {
            // required to allow reducers to clear their state
            dispatch(rootActions.onVertexSelected(vertexId));
        }

        dispatch(push(`/vertex/${vertexId}`));
    };
};

export default actionMap;
