import {AnyAction} from 'redux';
import { handleActions, ReducerMap } from 'redux-actions';

import {ErrorState} from './models';

export default function makeErrorStateReducer() {
    const initialState = {};

    return handleActions({
        ROOT: {
            ERROR: (state: ErrorState, action: AnyAction) => ({
                ...state,
                message: action.payload.message
            })
        }
    } as ReducerMap<ErrorState>, initialState);
}
