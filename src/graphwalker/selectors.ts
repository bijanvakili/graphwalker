import { VertexScrollDirection } from './constants';
import { IncidentEdgeDirection, Graph, Vertex } from './models/Graph';
import { GraphViewState } from './models/GraphViewState';

// TODO optimize these function using memoization with 'reselect'

// counts the total number of edges in a direction for a vertex
export function getIncidentEdgeCount(
  graph: Graph,
  currentVertexId: string,
  edgeDirection: IncidentEdgeDirection
) {
  return graph.getIncidentEdges(currentVertexId, edgeDirection).length;
}

// scrolls to the next vertex index for incident edges with clamping
export function getNextScrollPositions(
  state: GraphViewState,
  groupType: IncidentEdgeDirection,
  scrollDirection: VertexScrollDirection
) {
  const { currentIncomingVertex, currentOutgoingVertex } = state;
  if (!state.settings || !state.graph || !state.currentVertexId) {
    throw new Error('getNextScrollPositions called before full initialization');
  }

  const delta: number = scrollDirection === VertexScrollDirection.Down ? +1 : -1;
  const totalIncidentVertices =
    groupType === IncidentEdgeDirection.Incoming ? state.totalIncomingVertices : state.totalOutgoingVertices;
  const fClamp = scrollDirection === VertexScrollDirection.Down ? Math.min : Math.max;
  const limit =
    scrollDirection === VertexScrollDirection.Down
      ? Math.max(totalIncidentVertices - state.settings.vertexColumnPageSize, 0)
      : 0;

  if (groupType === IncidentEdgeDirection.Incoming) {
    return {
      currentOutgoingVertex,
      currentIncomingVertex: fClamp(currentIncomingVertex + delta, limit)
    };
  }
  return {
    currentIncomingVertex,
    currentOutgoingVertex: fClamp(currentOutgoingVertex + delta, limit)
  };
}

// description of current pagination parameters
export function getVertexPageSummary(state: GraphViewState, edgeType: IncidentEdgeDirection) {
  if (!state.settings) {
    throw new Error('getVertexPageSummary called before full initialization');
  }

  const currentVertexIndex =
    edgeType === IncidentEdgeDirection.Incoming ? state.currentIncomingVertex : state.currentOutgoingVertex;
  const totalIncidentEdges =
    edgeType === IncidentEdgeDirection.Incoming ? state.totalIncomingVertices : state.totalOutgoingVertices;

  return `[${currentVertexIndex + 1} - ${Math.min(
    currentVertexIndex + state.settings.vertexColumnPageSize,
    totalIncidentEdges
  )}] / ${totalIncidentEdges}`;
}

export function canScrollDown(
  state: GraphViewState,
  edgeType: IncidentEdgeDirection,
  currentVertexIndex: number
) {
  if (!state.graph || !state.currentVertexId || !state.settings) {
    throw new Error('canScrollDown called before full initialization');
  }

  const totalIncidentEdges = getIncidentEdgeCount(state.graph, state.currentVertexId, edgeType);
  return currentVertexIndex + state.settings.vertexColumnPageSize < totalIncidentEdges;
}

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
