import * as _ from 'lodash';
import { createSelector } from 'reselect';

import { TypeAheadSelectDirection } from './constants';
import { Vertex, Graph } from '../graphwalker/models/Graph';
import { TypeAheadState } from './models';

const MIN_QUERY_LENGTH = 2;
const MAX_ITEM_RESULTS = 6;

export function nextSelection(
  currentResults: Vertex[],
  direction: TypeAheadSelectDirection,
  currentSelection?: number
) {
  let newSelection = currentSelection;

  if (newSelection === undefined) {
    newSelection = 0;
  } else if (direction === TypeAheadSelectDirection.Up) {
    newSelection -= 1;
  } else if (direction === TypeAheadSelectDirection.Down) {
    newSelection += 1;
  }

  return _.clamp(newSelection, 0, currentResults.length - 1);
}

// memoized selectors
const getQuery = (state: TypeAheadState) => state.query;
const getGraph = (state: TypeAheadState) => state.graph;
export const getQueryResults = createSelector(
  getQuery,
  getGraph,
  (query: string, graph?: Graph) => {
    if (!graph || !query || query.length < MIN_QUERY_LENGTH) {
      return [];
    }
    return graph.searchVertices(query).slice(0, MAX_ITEM_RESULTS) || [];
  }
);
