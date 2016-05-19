'use strict';

var BaseGraphParser,
    DjangoExtensionsGraphParser,
    SequelizeGraphParser;

var _makeKey = function (components) {
    return _.reduce(components, function (key, component) {
        return key + (key === '' ? component : '#' + component);
    }, '');
};

BaseGraphParser = function (options) {
    this._vertices = options.vertices;
    this._edges = options.edges;
};

_.extend(BaseGraphParser.prototype, {
    /**
     * @returns {object}
     * @property vertices -- Vertices
     * @property edges    -- Edges
     */
    parse: function (response) {
        throw new Error('Must implement parse()');
    }
});

// django-extensions graph parser
DjangoExtensionsGraphParser = function (options) {
    BaseGraphParser.call(this, options);
};
DjangoExtensionsGraphParser.prototype = Object.create(BaseGraphParser.prototype);
DjangoExtensionsGraphParser.prototype.constructor = DjangoExtensionsGraphParser;

_.extend(DjangoExtensionsGraphParser.prototype, {

    // maps Django type to multiplicity
    // contains both forward and reverse versions
    _MULTIPLICITY_MAP: {
        'ForeignKey': '*..1',
        'FlexibleForeignKey': '*..1', // NOTE: specific to Sentry
        'ManyToManyField': '*..*',
        'OneToOneField': '1..1'
    },

    parse: function (response) {
        var self = this;
        var vertices = self._vertices;
        var edges = self._edges;

        // fast lookup maps
        var vertexMap = {};
        var edgeMap = {};

        _.each(response['graphs'], function (graph) {
            _.each(graph['models'], function (model) {
                var newVertex = vertices.add({
                    internalAppName: model['app_name'],
                    appName: graph['app_name'],
                    modelName: model['name']
                });
                // store composite key references for both the app name and internal app name
                vertexMap[_makeKey([graph['app_name'], model['name']])] = newVertex;
                vertexMap[_makeKey([model['app_name'], model['name']])] = newVertex;
            });
        });

        _.each(response['graphs'], function (graph) {
            _.each(graph['models'], function (model) {
                _.each(model['relations'], function (relation) {
                    var sourceVertex = vertexMap[_makeKey([graph['app_name'], model['name']])];
                    var destVertex = vertexMap[_makeKey([relation['target_app'], relation['target']])];

                    if (sourceVertex && destVertex) {
                        var criteria = null;
                        var edgeKey = null;
                        var existingEdge = null;
                        var multiplicity = null;

                        multiplicity = self._MULTIPLICITY_MAP[relation['type']] || null;

                        // invert direction for inheritance
                        if (relation['type'] === 'inheritance') {
                            var temp = sourceVertex;
                            sourceVertex = destVertex;
                            destVertex = temp;
                            multiplicity = null;
                        }

                        // avoid duplication and merge where possible
                        criteria = {
                            source: sourceVertex,
                            dest: destVertex,
                            type: relation['type']
                        };
                        edgeKey = _makeKey([
                            criteria.source.get('appName'),
                            criteria.source.get('modelName'),
                            criteria.dest.get('appName'),
                            criteria.dest.get('modelName'),
                            criteria.type
                        ]);
                        existingEdge = edgeMap[edgeKey];
                        if (!existingEdge) {
                            criteria.label = relation['name'];
                            criteria.multiplicity = multiplicity;
                            edgeMap[edgeKey] = edges.add(criteria);
                        }
                        else {
                            existingEdge.set({
                                label: existingEdge.get('label') + ', ' + relation['name']
                            });
                        }
                    }
                });
            });
        });

        return {
            vertices: vertices,
            edges: edges
        };
    }
});

SequelizeGraphParser = function (options) {
    BaseGraphParser.call(this, options);
};
SequelizeGraphParser.prototype = Object.create(BaseGraphParser.prototype);
SequelizeGraphParser.prototype.constructor = SequelizeGraphParser;

_.extend(SequelizeGraphParser.prototype, {

    // maps Sequelize relations to multiplicities
    _MULTIPLICITY_MAP: {
        'BelongsTo': '*..1',
        'BelongsToMany': '*..*',
        'HasMany': '1..*',
        'HasOne': '1..1'
    },

    parse: function (response) {
        var self = this;
        var vertices = self._vertices;
        var edges = self._edges;

        // fast lookup map
        var vertexMap = {};
        var edgeMap = {};

        // compute all known vertices
        _.each(response, function (model) {
            var newVertex = vertices.add({
                modelName: model['name']
            });
            vertexMap[model['name']] = newVertex;
        });

        // construct edges from all relations
        _.each(response, function (model) {
            _.each(model.relations, function (relation) {
                var sourceVertex = vertexMap[model['name']];
                var destVertex = vertexMap[relation['target']];
                var edgeKey;

                if (sourceVertex && destVertex) {
                    var multiplicity,
                        criteria,
                        existingEdge;

                    multiplicity = self._MULTIPLICITY_MAP[relation['type']];
                    if (_.isUndefined(multiplicity)) {
                        throw new Error('Unrecognized multiplicity: ' + multiplicity);
                    }

                    // avoid duplication and merge where possible
                    criteria = {
                        source: sourceVertex,
                        dest: destVertex,
                        type: relation['type']
                    };
                    edgeKey = _makeKey([sourceVertex.get('modelName'), destVertex.get('modelName'), relation['type']]);
                    existingEdge = edgeMap[edgeKey];
                    if (!existingEdge) {
                        criteria.label = relation['field'];
                        criteria.multiplicity = multiplicity;
                        edgeMap[edgeKey] = edges.add(criteria);
                    }
                    else {
                        existingEdge.set({
                            label: existingEdge.get('label') + ', ' + relation['field']
                        });
                    }
                }
            });
        });

        return {
            vertices: vertices,
            edges: edges
        };
    }
});


module.exports = {
    'django': DjangoExtensionsGraphParser,
    'sequelize': SequelizeGraphParser
};
