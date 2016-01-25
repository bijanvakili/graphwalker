'use strict';

var Graph,
    Vertex,
    Vertices,
    Edge,
    Edges,
    MULTIPLICITY_MAP;

// maps Django type to multiplicity
// contains both forward and reverse versions
MULTIPLICITY_MAP = {
    'ForeignKey': '*..1',
    'ManyToManyField': '*..*',
    'OneToOneField': '1..1'
};

Vertex = Backbone.Model.extend({
    defaults: {
        modelName: "",
        appName: "",
        internalAppName: "",
    },

    isEqual: function(query) {
        return this.get('appName') == query['appName'] &&
            this.get('modelName') == query['modelName'];
    },
});


Vertices = Backbone.Collection.extend({
    model: Vertex,

    findOrCreateVertex: function(query) {
        var vertex;

        vertex = _.find(this.models, function (vertex) {
            return vertex.isEqual(query);
        });
        if (_.isUndefined(vertex)) {
            vertex = this.add(new Vertex(query));
        }

        return vertex;
    }
});


Edge = Backbone.Model.extend({
    defaults: {
        source: null,
        dest: null,
        type: "ForeignKey",
        label: "",
        multiplicity: null,
    },

    isInheritanceRelation: function() {
        return this.attributes['type'] == 'inheritance';
    }
});


Edges = Backbone.Collection.extend({
    model: Edge,
});


Graph = Backbone.Model.extend({

    defaults: {
        graphDataFile: null,
        vertices: new Vertices(),
        edges: new Edges(),
    },

    urlRoot: function () {
        return 'data/' + this.get("graphDataFile");
    },

    parse: function(response, options) {
        var vertices,
            edges;

        // parse known vertices
        vertices = new Vertices();
        _.each(response['graphs'], function (graph) {
            _.each(graph['models'], function (model) {
                vertices.add({
                    internalAppName: model['app_name'],
                    appName: graph['app_name'],
                    modelName: model['name']
                });
            });
        });

        // parse edges
        edges = new Edges();
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

                        multiplicity = MULTIPLICITY_MAP[relation['type']] || null;

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
            edges: edges,
            graphDataFile: this.graphDataFile,
        };
    },

    findVertex: function(query) {
        return this.get('vertices').findWhere(query);
    },

    getOutgoingNeighbors: function (vertex) {
        return this.getNeighbors(vertex, false);
    },

    getIncomingNeighbors: function (vertex) {
        return this.getNeighbors(vertex, true);
    },

    getNeighbors: function(vertex, isIncoming) {
        var neighbors = [];

        _.each(this.get('edges').models, function(edge) {
            var attrMatch,
                attrCollect;

            if (isIncoming) {
                attrMatch = 'dest';
                attrCollect = 'source';
            }
            else {
                attrMatch = 'source';
                attrCollect = 'dest';
            }

            if (edge.get(attrMatch).isEqual(vertex.attributes)) {
                neighbors.push({
                    'vertex': edge.get(attrCollect),
                    'edge': edge,
                });
            }
        });

        return neighbors;
    },
});

module.exports = {
    Vertex: Vertex,
    Vertices: Vertices,
    Edge: Edge,
    Edges: Edges,
    Graph: Graph,
};
