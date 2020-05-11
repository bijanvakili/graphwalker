import { IncidentEdgeDirection } from "../constants";
import { RenderSettings, Neighborhood } from "./Graphwalker";

export interface IncidentEdgeMetrics {
  [IncidentEdgeDirection.Incoming]: number;
  [IncidentEdgeDirection.Outgoing]: number;
}

export interface IncidentEdgeFlags {
  [IncidentEdgeDirection.Incoming]: boolean;
  [IncidentEdgeDirection.Outgoing]: boolean;
}

export interface GraphViewState {
  settings?: RenderSettings;
  neighborhood?: Neighborhood;
  currentVertexId?: string;
  currentScrollPositions: IncidentEdgeMetrics;
}
