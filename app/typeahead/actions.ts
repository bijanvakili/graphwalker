import {createActions} from 'redux-actions';
import {Vertex} from '../root/models/Graph';

export enum TypeAheadSelectDirection {
    Up = 'up',
    Down = 'down',
}

export const typeaheadActions = createActions({
    TYPEAHEAD: {
        RESULTS: {
            ITEM: {
                MOVE: (direction: TypeAheadSelectDirection) => ({direction}),
            }
        },
        QUERY: (query: string, results: Vertex[]) => ({query, results}),
        RESET: undefined,
        SUBMIT: undefined,
    }
});
