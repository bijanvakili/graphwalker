import * as _ from 'lodash';
import {AnyAction} from 'redux';
import {handleActions, ReducerMap} from 'redux-actions';

import {TypeAheadSelectDirection} from './actions';
import {TypeAheadState} from './models';

export default function makeTypeAheadReducer() {
    const typeAheadParamDefaults = {
        query: '',
        results: [],
        currentSelection: undefined
    };

    return handleActions({
        ROOT: {
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
                return {
                    ...state,
                    query: action.payload.query,
                    results: action.payload.results,
                };
            },
            RESET: (state: TypeAheadState, action: AnyAction) => ({...state, ...typeAheadParamDefaults}),
        }
    } as ReducerMap<TypeAheadState>, typeAheadParamDefaults);
}
