import {ErrorState} from '../../error_view/models';
import {GraphViewState} from '../../graph_view/models';
import {TypeAheadState} from '../../typeahead/models';

export interface GlobalState {
    errorState: ErrorState;
    typeaheadState?: TypeAheadState;
    graphState?: GraphViewState;
}
