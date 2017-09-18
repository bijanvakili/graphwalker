import {Graph, Vertex} from './models/Graph';

export function findVertexById(graph: Graph, vertexId: string): Vertex {
    const vertex = graph.vertices.find((v) => v.id === vertexId);
    if (!vertex) {
        throw new Error(`Vertex id not found ${vertexId}`);
    }

    return vertex;
}
