import * as _ from "lodash";

import { TypeAheadSelectDirection } from "./constants";
import { Vertex } from "../graphwalker/models/Graphwalker";
import { ResultItemData } from "./models";

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

export function getResultItems(queryResults: Vertex[]): ResultItemData[] {
  return queryResults.map((v: Vertex) => ({ displayName: v.fullyQualifiedModelName, vertexId: v.id }));
}
