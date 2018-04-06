import {createActions} from 'redux-actions';

import {IncidentEdgeDirection, ScrollDirection} from '../root/models/Graph';

export const graphActions = createActions({
    GRAPH: {
        SCROLL_COLUMN: (
            direction: ScrollDirection,
            columnGroup: IncidentEdgeDirection,
            maxItems: number,
            maxVisibleItems: number,
        ) => ({direction, columnGroup, maxItems, maxVisibleItems}),
    }
});
