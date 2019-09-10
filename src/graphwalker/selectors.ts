import { createSelector } from 'reselect';

import { VertexScrollDirection } from './constants';
import { IncidentEdgeDirection, Graph } from './models/Graph';
import { GraphViewState, IncidentEdgeMetrics, IncidentEdgeFlags } from './models/GraphViewState';

const getGraph = (state: GraphViewState): Graph | undefined => state.graph;
const getCurrentVertexId = (state: GraphViewState): string | undefined => state.currentVertexId;
const getCurrentScrollPositions = (state: GraphViewState) => state.currentScrollPositions;
const getVertexColumnPageSize = (state: GraphViewState): number => {
  if (!state.settings) {
    throw new Error('getVertexColumnPageSize() called before full initialization');
  }

  return state.settings.vertexColumnPageSize;
};

const allMetricKeys: IncidentEdgeDirection[] = [
  IncidentEdgeDirection.Incoming,
  IncidentEdgeDirection.Outgoing
];

interface IncidentEdgeDescriptions {
  [IncidentEdgeDirection.Incoming]: string;
  [IncidentEdgeDirection.Outgoing]: string;
}

// counts the total number of edges in a direction for a vertex
export const getIncidentEdgeCounts = createSelector(
  getGraph,
  getCurrentVertexId,
  (graph?: Graph, currentVertexId?: string): IncidentEdgeMetrics => {
    if (!graph || !currentVertexId) {
      throw new Error('getIncidentEdgeCounts called before full initialization');
    }
    return allMetricKeys.reduce(
      (accum, direction: IncidentEdgeDirection) => ({
        ...accum,
        [direction]: graph.getIncidentEdges(currentVertexId, direction).length
      }),
      {}
    ) as IncidentEdgeMetrics;
  }
);

// scrolls to the next vertex index for incident edges with clamping
export function getNextScrollPositions(
  state: GraphViewState,
  groupType: IncidentEdgeDirection,
  scrollDirection: VertexScrollDirection
): IncidentEdgeMetrics {
  if (!state.settings) {
    throw new Error('getNextScrollPositions called before full initialization');
  }

  const delta: number = scrollDirection === VertexScrollDirection.Down ? +1 : -1;
  const totalIncidentVertices = getIncidentEdgeCounts(state)[groupType];

  const fClamp = scrollDirection === VertexScrollDirection.Down ? Math.min : Math.max;
  const limit =
    scrollDirection === VertexScrollDirection.Down
      ? Math.max(totalIncidentVertices - state.settings.vertexColumnPageSize, 0)
      : 0;

  return {
    ...state.currentScrollPositions,
    [groupType]: fClamp(state.currentScrollPositions[groupType] + delta, limit)
  };
}

// description of current pagination parameters
export const getVertexPageSummary = createSelector(
  getCurrentScrollPositions,
  getIncidentEdgeCounts,
  getVertexColumnPageSize,
  (currentPositions: IncidentEdgeMetrics, edgeCounts: IncidentEdgeMetrics, pageSize: number) =>
    allMetricKeys.reduce(
      (accum, edgeType) => ({
        ...accum,
        [edgeType]: `[${currentPositions[edgeType] + 1} - ${Math.min(
          currentPositions[edgeType] + pageSize,
          edgeCounts[edgeType]
        )}] / ${edgeCounts[edgeType]}`
      }),
      {}
    ) as IncidentEdgeDescriptions
);

// returns boolean flags indicating if the user can still scroll down in neighbor vertices
export const canScrollDown = createSelector(
  getCurrentScrollPositions,
  getIncidentEdgeCounts,
  getVertexColumnPageSize,
  (currentPositions: IncidentEdgeMetrics, edgeCounts: IncidentEdgeMetrics, pageSize: number) =>
    allMetricKeys.reduce(
      (accum, edgeType) => ({
        ...accum,
        [edgeType]: currentPositions[edgeType] + pageSize < edgeCounts[edgeType]
      }),
      {}
    ) as IncidentEdgeFlags
);

export function extractVertexIdFromHash(s: string) {
  const matches = s.match(/#\/vertex\/([a-zA-Z0-9]{40})/);
  if (matches === null) {
    throw new Error(`Invalid vertex hash:  ${s}`);
  }
  return matches[1];
}

export function getVertexIdHash(vertexId: string) {
  return `#/vertex/${vertexId}`;
}
