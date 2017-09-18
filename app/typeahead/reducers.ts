import * as _ from 'lodash';
import {AnyAction} from 'redux';
import {handleActions, ReducerMap} from 'redux-actions';

import {findVertexById} from '../root/selectors';
import {TypeAheadSelectDirection} from './actions';
import {TypeAheadState} from './models';
import {typeaheadSearch} from './selectors';

const MIN_QUERY_LENGTH = 2;
const MAX_ITEM_RESULTS = 6;

export default function makeTypeAheadReducer() {
    const typeAheadParamDefaults = {
        query: '',
        results: [],
        currentSelection: undefined
    };

    return handleActions({
        ROOT: {
            ALL_DATA_LOADED: (state: TypeAheadState, action: AnyAction) => ({
                ...state,
                utils: {
                    findVertex: (vertexId: string) => findVertexById(action.payload.graph, vertexId),
                    queryTypeahead: (query: string) => typeaheadSearch(action.payload.graph, query),
                }
            }),
            ON_VERTEX_SELECTED: (state: TypeAheadState, action: AnyAction) => {
                // reset the state
                return {...state, ...typeAheadParamDefaults};
            }
        },
        TYPEAHEAD: {
            RESULTS: {
                ITEM: {
                    MOVE: (state: TypeAheadState, action: AnyAction) => {
                        const direction = action.payload.direction as TypeAheadSelectDirection;
                        let newSelection = state.currentSelection;

                        if (newSelection === undefined) {
                            newSelection = 0;
                        }
                        else if (direction === TypeAheadSelectDirection.Up) {
                            newSelection -= 1;
                        }
                        else if (direction === TypeAheadSelectDirection.Down) {
                            newSelection += 1;
                        }
                        return {
                            ...state,
                            currentSelection: _.clamp(newSelection, 0, state.results.length - 1)
                        };
                    },
                }
            },
            QUERY: (state: TypeAheadState, action: AnyAction) => {
                const query = action.payload.query;
                if (!query || query.length < MIN_QUERY_LENGTH) {
                    return state;
                }
                if (!state.utils) {
                    throw new Error('TYPEAHEAD.QUERY called before ROOT.ALL_DATA_LOADED');
                }

                const results = state.utils.queryTypeahead(query).slice(0, MAX_ITEM_RESULTS) || [];
                return {...state, query, results};
            },
            RESET: (state: TypeAheadState, action: AnyAction) => ({...state, ...typeAheadParamDefaults}),
        }
    } as ReducerMap<TypeAheadState>, typeAheadParamDefaults);
}
