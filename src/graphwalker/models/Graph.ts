import _ from 'lodash';

import { UnrestrictedDictionary } from '../../types/ObjectTypes';

export interface Vertex {
  readonly id: string;
  readonly label: string;
  readonly searchableComponents: string[];
  readonly properties: UnrestrictedDictionary;
}

export interface EdgeData {
  readonly id: string;
  readonly label: string;
  readonly source: string;
  readonly dest: string;
  readonly properties: UnrestrictedDictionary;
}

export interface GraphData {
  vertices: Vertex[];
  edges: EdgeData[];
}

export enum IncidentEdgeDirection {
  Incoming = 'incoming',
  Outgoing = 'outgoing'
}

export enum ScrollDirection {
  Up = 'up',
  Down = 'down'
}

export class Edge implements EdgeData {
  readonly id: string;
  readonly label: string;
  readonly source: string;
  readonly dest: string;
  readonly properties: UnrestrictedDictionary;

  constructor(data: EdgeData) {
    this.id = data.id;
    this.label = data.label;
    this.source = data.source;
    this.dest = data.dest;
    this.properties = data.properties;
  }

  getAdjacentVertexId(direction: IncidentEdgeDirection): string {
    return direction === IncidentEdgeDirection.Incoming ? this.source : this.dest;
  }
}

export class Graph {
  private vertices: Vertex[];
  private edges: Edge[];

  constructor(data: GraphData) {
    this.vertices = data.vertices;
    this.edges = data.edges.map(datum => new Edge(datum));
  }

  findVertexById(vertexId: string): Vertex {
    const vertex = this.vertices.find(v => v.id === vertexId);
    if (!vertex) {
      throw new Error(`Vertex id not found ${vertexId}`);
    }

    return vertex;
  }

  findEdgeById(edgeId: string): Edge {
    const edge = this.edges.find(v => v.id === edgeId);
    if (!edge) {
      throw new Error(`Edge id not found: ${edgeId}`);
    }

    return edge;
  }

  getIncidentEdges(vertexId: string, direction: IncidentEdgeDirection): Edge[] {
    let edgeFilter: (e: Edge) => boolean;
    if (direction === IncidentEdgeDirection.Incoming) {
      edgeFilter = (e: Edge) => e.dest === vertexId;
    } else {
      edgeFilter = (e: Edge) => e.source === vertexId;
    }

    return this.edges.filter(edgeFilter);
  }

  searchVertices(query: string): Vertex[] {
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
