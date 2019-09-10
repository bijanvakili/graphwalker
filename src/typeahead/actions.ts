import { createAction, createStandardAction } from 'typesafe-actions';

import { TypeAheadSelectDirection } from './constants';

export const moveSelection = createStandardAction('typeahead/MOVE_SELECTION')<TypeAheadSelectDirection>();
export const query = createStandardAction('typeahead/QUERY')<string>();
export const reset = createAction('typeahead/RESET');
