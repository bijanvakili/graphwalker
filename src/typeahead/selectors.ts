import * as _ from 'lodash';

import { TypeAheadSelectDirection } from './constants';
import { Vertex, Graph } from '../graphwalker/models/Graph';

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

export function querySubgraph(query: string, graph?: Graph) {
  if (!graph || !query || query.length < MIN_QUERY_LENGTH) {
    return [];
  }
  return graph.searchVertices(query).slice(0, MAX_ITEM_RESULTS) || [];
}
