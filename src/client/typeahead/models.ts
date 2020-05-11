import { Vertex } from "../graphwalker/models/Graphwalker";

export interface TypeAheadState {
  query: string;
  currentSelection?: number;
  results: Vertex[];
}

export interface ResultItemData {
  displayName: string;
  vertexId: string;
}
