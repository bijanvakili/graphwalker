import {createActions} from 'redux-actions';

import {IncidentEdgeDirection, ScrollDirection} from '../root/models/Graph';

export const graphActions = createActions({
    GRAPH: {
        SCROLL_COLUMN: (
            direction: ScrollDirection,
            columnGroup: IncidentEdgeDirection,
            maxItems: number
        ) => ({direction, columnGroup, maxItems}),
    }
});
