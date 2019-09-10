import { Graph } from '../graphwalker/models/Graph';

export interface TypeAheadState {
  graph?: Graph;
  query: string;
  currentSelection?: number;
}
