import {Edge, Graph, IncidentEdgeDirection} from '../root/models/Graph';

export function getAdjacentVertexIdFromEdge(edge: Edge, direction: IncidentEdgeDirection): string {
    return (direction === IncidentEdgeDirection.Incoming) ? edge.source : edge.dest;
}

export function getIncidentEdges(graph: Graph, vertexId: string, direction: IncidentEdgeDirection, ): Edge[] {
    let edgeFilter: (e: Edge) => boolean;
    if (direction === IncidentEdgeDirection.Incoming) {
        edgeFilter = (e: Edge) => e.dest === vertexId;
    } else {
        edgeFilter = (e: Edge) => e.source === vertexId;
    }

    return graph.edges.filter(edgeFilter);
}
