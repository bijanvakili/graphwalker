import { createAction, createStandardAction, getType } from 'typesafe-actions';
import { ThunkAction } from 'redux-thunk';

import { TypeAheadSelectDirection } from './constants';
import { GlobalState } from '../graphwalker/reducers';
import { selectVertex } from '../graphwalker/actions';

export const moveSelection = createStandardAction('typeahead/MOVE_SELECTION')<TypeAheadSelectDirection>();
export const query = createStandardAction('typeahead/QUERY')<string>();
export const reset = createAction('typeahead/RESET');

export const submit = (): ThunkAction<void, GlobalState, void, any> => (dispatch, getState) => {
  const state = getState();
  const { currentSelection, results } = state.typeahead;

  if (currentSelection === undefined) {
    return;
  }

  const vertexId = results[currentSelection].id;
  return dispatch(selectVertex(vertexId));
};
