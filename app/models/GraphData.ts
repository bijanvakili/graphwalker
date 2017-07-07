import * as Backbone from 'backbone';
import * as _ from 'lodash';

export interface VertexTarget {
    appName: string;
    modelName: string;
}

export class Vertex extends Backbone.Model {
    public defaults() {
        return {
            modelName: '',
            appName: '',
            internalAppName: ''
        };
    }

    public isEqual(query: VertexTarget): boolean {
        return this.get('appName') === query.appName &&
            this.get('modelName') === query.modelName;
    }

    public displayName(): string {
        return this.get('appName') + '.' + this.get('modelName');
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
            .filter((v) => partialMatch(v.get('modelName')) || partialMatch(v.get('appName')))
            .sortBy((v) => v.displayName())
            .value();
    }
}

export class Edge extends Backbone.Model {
    public defaults() {
        return {
            source: null,
            dest: null,
            type: 'ForeignKey',
            label: '',
            multiplicity: null
        };
    }

    public isInheritanceRelation(): boolean {
        return this.get('type') === 'inheritance';
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
    graphDataFile: string;
    parser: IGraphParser;
}

export class Graph extends Backbone.Model {
    private graphDataFile: string;
    private parser: IGraphParser;

    constructor(attributes: any, options: GraphOptions) {
        super(attributes, options);
        this.graphDataFile = options.graphDataFile;
        this.parser = options.parser;
    }

    public defaults() {
        return {
            vertices: new Vertices(),
            edges: new Edges()
        };
    }

    public urlRoot = () => 'data/' + this.graphDataFile;

    public parse(response: any, options?: any): any {
        const result = this.parser.parse(response);
        return {
            graphDataFile: this.get('graphDataFile'),
            ...result
        };
    }

    public findVertex(query: VertexTarget) {
        return this.get('vertices').findWhere(query);
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
        const neighbors: NeighborDescription[] = [];

        this.get('edges').models.forEach((edge: Edge) => {
            let attrMatch;
            let attrCollect;

            if (isIncoming) {
                attrMatch = 'dest';
                attrCollect = 'source';
            }
            else {
                attrMatch = 'source';
                attrCollect = 'dest';
            }

            if (edge.get(attrMatch).isEqual(targetVertex.attributes)) {
                neighbors.push(new NeighborDescription({
                    vertex: edge.get(attrCollect),
                    edge
                }));
            }
        });

        return new NeighborDescriptions(neighbors);
    }
}
