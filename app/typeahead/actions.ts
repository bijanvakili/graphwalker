import {createActions} from 'redux-actions';

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
        QUERY: (query: string) => ({query}),
        RESET: undefined,
        SUBMIT: undefined,
    }
});
