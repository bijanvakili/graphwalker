'use strict';

var BaseGraphParser,
    DjangoExtensionsGraphParser,
    SequelizeGraphParser;

BaseGraphParser = function(options) {
    this._vertices = options.vertices;
    this._edges = options.edges;
};

_.extend(BaseGraphParser.prototype, {
    /**
     * @returns {object}
     * @property vertices -- Vertices
     * @property edges    -- Edges
     */
    parse: function(response) {
        throw new Error('Must implement parse()');
    }
});

// django-extensions graph parser
DjangoExtensionsGraphParser = function(options) {
    BaseGraphParser.call(this, options);
};
DjangoExtensionsGraphParser.prototype = Object.create(BaseGraphParser.prototype);
DjangoExtensionsGraphParser.prototype.constructor = DjangoExtensionsGraphParser;

_.extend(DjangoExtensionsGraphParser.prototype, {

    // maps Django type to multiplicity
    // contains both forward and reverse versions
    _MULTIPLICITY_MAP: {
        'ForeignKey': '*..1',
        'ManyToManyField': '*..*',
        'OneToOneField': '1..1'
    },

    parse: function(response) {
        var self = this,
            vertices = self._vertices,
            edges = self._edges;

        _.each(response['graphs'], function (graph) {
            _.each(graph['models'], function (model) {
                vertices.add({
                    internalAppName: model['app_name'],
                    appName: graph['app_name'],
                    modelName: model['name']
                });
            });
        });

        _.each(response['graphs'], function (graph) {
            _.each(graph['models'], function (model) {
                _.each(model['relations'], function (relation) {
                    var sourceVertex,
                        destVertex;

                    sourceVertex = vertices.findWhere({
                        appName: graph['app_name'],
                        modelName: model['name']
                    });
                    destVertex = vertices.findWhere({
                        internalAppName: relation['target_app'],
                        modelName: relation['target'],
                    });

                    if (!_.isUndefined(sourceVertex) && !_.isUndefined(destVertex)) {
                        var criteria = null,
                            existingEdge = null,
                            multiplicity = null;

                        multiplicity = self._MULTIPLICITY_MAP[relation['type']] || null;

                        // invert direction for inheritance
                        if (relation['type'] == 'inheritance') {
                            var temp = sourceVertex;
                            sourceVertex = destVertex;
                            destVertex = temp;
                            multiplicity = null;
                        }

                        // avoid duplication and merge where possible
                        criteria = {
                            source: sourceVertex,
                            dest: destVertex,
                            type: relation['type'],
                        };
                        existingEdge = edges.findWhere(criteria);
                        if (_.isUndefined(existingEdge)) {
                            criteria.label = relation['name'];
                            criteria.multiplicity = multiplicity;
                            edges.add(criteria);
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

SequelizeGraphParser = function(options) {
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

    parse: function(response) {
        var self = this,
            vertices = self._vertices,
            edges = self._edges;

        // compute all known vertices
        _.each(response, function (model) {
            vertices.add({
                modelName: model['name']
            });
        });

        // construct edges from all relations
        _.each(response, function (model) {
            _.each(model.relations, function (relation) {
                var sourceVertex,
                    destVertex;

                sourceVertex = vertices.findWhere({
                    modelName: model['name']
                });
                destVertex = vertices.findWhere({
                    modelName: relation['target'],
                });

                if (!_.isUndefined(sourceVertex) && !_.isUndefined(destVertex)) {
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
                        type: relation['type'],
                    };
                    existingEdge = edges.findWhere(criteria);
                    if (_.isUndefined(existingEdge)) {
                        criteria.label = relation['field'];
                        criteria.multiplicity = multiplicity;
                        edges.add(criteria);
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
