
import { Graph, Vertex } from '../graphwalker/models/Graph';

export interface TypeAheadState {
  graph?: Graph;
  query: string;
  results: Vertex[];
  currentSelection?: number;
}
