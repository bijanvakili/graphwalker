import * as _ from 'lodash';
import { UnrestrictedDictionary } from '../types';
import { Edge, Edges, GraphDescription, IGraphParser, Vertex, Vertices} from './GraphData';

function _makeKey(components: string[]): string {
    return components.reduce((key, component) => {
        return key + (key === '' ? component : '#' + component);
    }, '');
}

interface IMultiplicityMap {
    [key: string]: string;
}

// django-extensions graph parser
class DjangoExtensionsGraphParser implements IGraphParser {

    // maps Django type to multiplicity
    // contains both forward and reverse versions
    private MULTIPLICITY_MAP: IMultiplicityMap = {
        ForeignKey: '*..1',
        FlexibleForeignKey: '*..1', // NOTE: specific to Sentry
        ManyToManyField: '*..*',
        OneToOneField: '1..1'
    };

    /* tslint:disable:no-empty */
    constructor() {
        return this;
    }
    /* tslint:disable:no-empty */

    public parse(response: any): GraphDescription {
        const self = this;

        const vertices = new Vertices();
        const vertexMap: UnrestrictedDictionary = {};
        _.each(response.graphs, (graph) => {
            _.each(graph.models, (model) => {
                let newVertex = vertices.add(new Vertex({
                    internalAppName: model.app_name,
                    appName: graph.app_name,
                    modelName: model.name
                }));
                if (_.isArray(newVertex)) {
                    newVertex = newVertex[0];
                }

                // store composite key references for both the app name and internal app name
                vertexMap[_makeKey([graph.app_name, model.name])] = newVertex;
                vertexMap[_makeKey([model.app_name, model.name])] = newVertex;
            });
        });

        const edgeMap: UnrestrictedDictionary = {};
        const edges = new Edges();
        _.each(response.graphs, (graph) => {
            _.each(graph.models, (model) => {
                _.each(model.relations, (relation) => {
                    let sourceVertex = vertexMap[_makeKey([graph.app_name, model.name])];
                    let destVertex = vertexMap[_makeKey([relation.target_app, relation.target])];

                    if (sourceVertex && destVertex) {
                        let multiplicity: string | undefined = self.MULTIPLICITY_MAP[relation.type];

                        // invert direction for inheritance
                        if (relation.type === 'inheritance') {
                            const temp = sourceVertex;
                            sourceVertex = destVertex;
                            destVertex = temp;
                            multiplicity = undefined;
                        }

                        // avoid duplication and merge where possible
                        const criteria = {
                            source: sourceVertex,
                            dest: destVertex,
                            type: relation.type,
                            label: undefined,
                            multiplicity: (undefined as string | undefined),
                        };
                        const edgeKey = _makeKey([
                            criteria.source.get('appName'),
                            criteria.source.get('modelName'),
                            criteria.dest.get('appName'),
                            criteria.dest.get('modelName'),
                            criteria.type
                        ]);
                        const existingEdge = edgeMap[edgeKey];
                        if (!existingEdge) {
                            criteria.label = relation.name;
                            criteria.multiplicity = multiplicity;
                            edgeMap[edgeKey] = edges.add(new Edge(criteria));
                        }
                        else {
                            existingEdge.set({
                                label: existingEdge.get('label') + ', ' + relation.name
                            });
                        }
                    }
                });
            });
        });

        return {
            vertices,
            edges
        };
    }
}

// sequelize parser
class SequelizeGraphParser implements IGraphParser {

    // maps Sequelize relations to multiplicities
    private MULTIPLICITY_MAP: IMultiplicityMap = {
        BelongsTo: '*..1',
        BelongsToMany: '*..*',
        HasMany: '1..*',
        HasOne: '1..1'
    };

    public parse(response: any): GraphDescription {
        const self = this;
        const vertices = new Vertices();
        const vertexMap: UnrestrictedDictionary = {};

        // compute all known vertices
        _.each(response, (model) => {
            let newVertex = vertices.add(new Vertex({
                appName: '',
                modelName: model.name
            }));
            if (_.isArray(newVertex)) {
                newVertex = newVertex[0];
            }

            vertexMap[model.name] = newVertex;
        });

        // construct edges from all relations
        const edgeMap: UnrestrictedDictionary = {};
        const edges = new Edges();
        _.each(response, (model) => {
            _.each(model.relations, (relation) => {
                const sourceVertex = vertexMap[model.name];
                const destVertex = vertexMap[relation.target];

                if (sourceVertex && destVertex) {
                    const multiplicity = self.MULTIPLICITY_MAP[relation.type];
                    if (_.isUndefined(multiplicity)) {
                        throw new Error('Unrecognized multiplicity: ' + multiplicity);
                    }

                    // avoid duplication and merge where possible
                    const criteria = {
                        source: sourceVertex,
                        dest: destVertex,
                        type: relation.type,
                        label: undefined,
                        multiplicity: (undefined as string | undefined)
                    };
                    const edgeKey = _makeKey([
                        sourceVertex.get('modelName'),
                        destVertex.get('modelName'),
                        relation.type
                    ]);
                    const existingEdge = edgeMap[edgeKey];
                    if (!existingEdge) {
                        criteria.label = relation.field;
                        criteria.multiplicity = multiplicity;
                        edgeMap[edgeKey] = edges.add(new Edge(criteria));
                    }
                    else {
                        existingEdge.set({
                            label: existingEdge.get('label') + ', ' + relation.field
                        });
                    }
                }
            });
        });

        return {
            vertices,
            edges
        };
    }
}

// SQLAlchemy parser
class SqlAlchemyGraphParser implements IGraphParser {

    // maps SQLAlchemy relations to multiplicities
    private RELATION_TYPE_MAP: IMultiplicityMap = {
        MANYTOMANY: '*..*',
        MANYTOONE: '*..1',
        ONETOMANY: '1..*',
        ONETOONE: '1..1',
        inheritance: '1..1'
    };

    public parse(response: any): GraphDescription {
        const self = this;

        const vertices = new Vertices();
        const vertexMap: UnrestrictedDictionary = {};

        // compute all known vertices
        _.each(response, (model) => {
            let newVertex = vertices.add(new Vertex({
                appName: '',
                modelName: model.name
            }));
            if (_.isArray(newVertex)) {
                newVertex = newVertex[0];
            }

            vertexMap[model.key] = newVertex;
        });

        const edgeMap: UnrestrictedDictionary = {};
        const edges = new Edges();
        _.each(response, (model) => {
            _.each(model.relations, (relation) => {
                const sourceVertex = vertexMap[model.key];
                const destVertex = vertexMap[relation.target];

                if (sourceVertex && destVertex) {
                    const multiplicity = self.RELATION_TYPE_MAP[relation.type];
                    if (_.isUndefined(multiplicity)) {
                        throw new Error('Unrecognized multiplicity: ' + multiplicity);
                    }

                    // avoid duplication and merge where possible
                    const criteria = {
                        source: sourceVertex,
                        dest: destVertex,
                        type: relation.type,
                        label: (undefined as string | undefined),
                        multiplicity: (undefined as string | undefined)
                    };
                    const edgeKey = _makeKey([
                        sourceVertex.get('modelName'),
                        destVertex.get('modelName'),
                        relation.type
                    ]);
                    const existingEdge = edgeMap[edgeKey];
                    if (!existingEdge) {
                        if (relation.type === 'inheritance') {
                            criteria.label = 'inherits';
                        }
                        else {
                            criteria.label = relation.source_name;
                        }
                        criteria.multiplicity = multiplicity;
                        edgeMap[edgeKey] = edges.add(new Edge(criteria));
                    }
                    else {
                        existingEdge.set({
                            label: existingEdge.get('label') + ', ' + relation.source_name
                        });
                    }
                }
            });
        });

        return {
            vertices,
            edges
        };
    }
}

interface ParserConstructor {
    new (): IGraphParser;
}

interface ParserConstructorMap {
    [key: string]: ParserConstructor;
}

const PARSER_CLASS_MAP: ParserConstructorMap = {
    django: DjangoExtensionsGraphParser,
    sequelize: SequelizeGraphParser,
    sqlalchemy: SqlAlchemyGraphParser,
};

export function makeParser(parserName: string): IGraphParser {
    if (!PARSER_CLASS_MAP[parserName]) {
        throw new Error(`Invalid parser name: ${parserName}`);
    }

    const parserClass = PARSER_CLASS_MAP[parserName];
    return new parserClass();
}
