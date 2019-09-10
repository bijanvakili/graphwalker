import { Graph, IncidentEdgeDirection } from './Graph';
import { Settings } from './Settings';

export interface IncidentEdgeMetrics {
  [IncidentEdgeDirection.Incoming]: number;
  [IncidentEdgeDirection.Outgoing]: number;
}

export interface IncidentEdgeFlags {
  [IncidentEdgeDirection.Incoming]: boolean;
  [IncidentEdgeDirection.Outgoing]: boolean;
}

export interface GraphViewState {
  settings?: Settings;
  graph?: Graph;
  currentVertexId?: string;
  currentScrollPositions: IncidentEdgeMetrics;
}
