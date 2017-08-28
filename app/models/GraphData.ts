import * as Backbone from 'backbone';
import * as _ from 'lodash';

export class Vertex extends Backbone.Model {
    public defaults() {
        return {
            id: null,
            label: '',
            searchableComponents: [],
            properties: {},
        };
    }

    public displayName(): string {
        return this.get('label');
    }
}

export class Vertices extends Backbone.Collection<Vertex> {
    // TODO optimize this search using indexing or a more advanced algorithm
    public typeahead(query: string): Vertex[] {
        if (!query) {
            throw new Error('No query provided to typeahead query');
        }

        const pattern = new RegExp(`^${query.toUpperCase()}`);
        const partialMatch = (s: string) => (s || '').toUpperCase().match(pattern);

        return _(this.models)
            .filter((v: Vertex) => _.some(v.get('searchableComponents'), partialMatch))
            .sortBy((v: Vertex) => v.get('label'))
            .value();
    }
}

export class Edge extends Backbone.Model {
    public defaults() {
        return {
            id: null,
            label: '',
            source: null,
            dest: null,
            properties: {},
        };
    }
}

export class Edges extends Backbone.Collection<Edge> {}

export class NeighborDescription extends Backbone.Model {
    public defaults() {
        return {
            vertex: null,
            edge: null,
        };
    }

    public vertex(): Vertex {
        return this.get('vertex');
    }

    public edge(): Edge {
        return this.get('edge');
    }
}

export class NeighborDescriptions extends Backbone.Collection<NeighborDescription> {}

export interface GraphDescription {
    vertices: Vertices;
    edges: Edges;
}

export interface IGraphParser {
    parse(response: any): GraphDescription;
}

export interface GraphOptions {
    url: string;
}

export class Graph extends Backbone.Model {
    private graphDataFile: string;

    constructor(attributes: any, options: GraphOptions) {
        super(attributes, options);
        this.graphDataFile = options.url;
    }

    public defaults() {
        return {
            graphDataFile: this.graphDataFile,
            vertices: new Vertices(),
            edges: new Edges()
        };
    }

    public urlRoot = () => this.graphDataFile;

    public parse(response: any, options?: any): any {
        return {
            graphDataFile: this.get('graphDataFile'),
            vertices: new Vertices(response.vertices),
            edges: new Edges(response.edges),
        };
    }

    public findVertex(id: string) {
        return this.get('vertices').get(id);
    }

    public getOutgoingNeighbors(vertex: Vertex) {
        return this.getNeighbors(vertex, false);
    }

    public getIncomingNeighbors(vertex: Vertex) {
        return this.getNeighbors(vertex, true);
    }

    public queryTypeahead(query: string) {
        return this.get('vertices').typeahead(query);
    }

    /**
     * Returns neighbor information for a vertex
     *
     * @param {Vertex} targetVertex - vertex model instance to inspect
     * @param {boolean} isIncoming - true for incoming neighbors, false for outgoing neighbors
     */
    private getNeighbors(targetVertex: Vertex, isIncoming: boolean): NeighborDescriptions {
        let attrMatch: string;
        let attrCollect: string;

        if (isIncoming) {
            attrMatch = 'dest';
            attrCollect = 'source';
        }
        else {
            attrMatch = 'source';
            attrCollect = 'dest';
        }

        const vertices = this.get('vertices');
        const neighbors: NeighborDescription[] = this.get('edges').models
            .filter((edge: Edge) => edge.get(attrMatch) === targetVertex.id)
            .map((edge: Edge) => {
                const vertex = vertices.get(edge.get(attrCollect));

                return new NeighborDescription({vertex, edge});
            });

        return new NeighborDescriptions(neighbors);
    }
}
