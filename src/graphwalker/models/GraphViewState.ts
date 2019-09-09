import { Graph } from './Graph';
import { Settings } from './Settings';

export interface GraphViewState {
  settings?: Settings;
  graph?: Graph;
  currentVertexId?: string;
  currentIncomingVertex: number;
  currentOutgoingVertex: number;

  // computed properties
  totalIncomingVertices: number;
  totalOutgoingVertices: number;
}
