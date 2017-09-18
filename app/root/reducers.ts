import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import makeErrorStateReducer from '../error_view/reducers';
import makeGraphViewReducer from '../graph_view/reducers';
import makeTypeAheadReducer from '../typeahead/reducers';

export default function makeRootReducer() {
    return combineReducers({
        errorState: makeErrorStateReducer(),
        typeaheadState: makeTypeAheadReducer(),
        graphState: makeGraphViewReducer(),
        router: routerReducer,
    });
}
