import * as _ from 'lodash';

import {UnrestrictedDictionary} from '../../common/ObjectTypes';

export interface Vertex {
    readonly id: string;
    readonly label: string;
    readonly searchableComponents: string[];
    readonly properties: UnrestrictedDictionary;
}

export interface Edge {
    readonly id: string;
    readonly label: string;
    readonly source: string;
    readonly dest: string;
    readonly properties: UnrestrictedDictionary;
}

export interface GraphData {
    readonly vertices: Vertex[];
    readonly edges: Edge[];
}

export enum IncidentEdgeDirection {
    Incoming = 'incoming',
    Outgoing = 'outgoing',
}

export enum ScrollDirection {
    Up = 'up',
    Down = 'down',
}

export class Graph {
    private vertices: Vertex[];
    private edges: Edge[];

    constructor(data: GraphData) {
        this.vertices = data.vertices;
        this.edges = data.edges;
    }

    public findVertexById(vertexId: string): Vertex {
        const vertex = this.vertices.find((v) => v.id === vertexId);
        if (!vertex) {
            throw new Error(`Vertex id not found ${vertexId}`);
        }

        return vertex;
    }

    public getIncidentEdges(vertexId: string, direction: IncidentEdgeDirection): Edge[] {
        let edgeFilter: (e: Edge) => boolean;
        if (direction === IncidentEdgeDirection.Incoming) {
            edgeFilter = (e: Edge) => e.dest === vertexId;
        } else {
            edgeFilter = (e: Edge) => e.source === vertexId;
        }

        return this.edges.filter(edgeFilter);
    }

    public searchVertices(query: string): Vertex[] {
        if (!query) {
            throw new Error('No query provided to searchVertices');
        }

        const pattern = new RegExp(`^${query.toUpperCase()}`);
        const partialMatch = (s: string) => (s || '').toUpperCase().match(pattern);

        // TODO replace with a faster string algorithm or data structure
        return _(this.vertices)
            .filter((v: Vertex) => _.some(v.searchableComponents || [], partialMatch))
            .sortBy((v: Vertex) => v.label)
            .value();
    }
}
