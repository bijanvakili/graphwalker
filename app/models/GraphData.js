'use strict';

var Parsers = require('app/models/Parsers');

var Graph,
    Vertex,
    Vertices,
    Edge,
    Edges;


Vertex = Backbone.Model.extend({
    defaults: {
        modelName: '',
        appName: '',
        internalAppName: ''
    },

    isEqual: function (query) {
        return this.get('appName') === query['appName'] &&
            this.get('modelName') === query['modelName'];
    }
});

Vertices = Backbone.Collection.extend({
    model: Vertex,

    findOrCreateVertex: function (query) {
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
        type: 'ForeignKey',
        label: '',
        multiplicity: null
    },

    isInheritanceRelation: function () {
        return this.attributes['type'] === 'inheritance';
    }
});


Edges = Backbone.Collection.extend({
    model: Edge
});


Graph = Backbone.Model.extend({

    defaults: {
        graphDataFile: null,
        useParser: null,
        vertices: new Vertices(),
        edges: new Edges()
    },

    urlRoot: function () {
        return 'data/' + this.get('graphDataFile');
    },

    parse: function (response, options) {
        var parser,
            result;

        parser = new Parsers[this.get('useParser')]({
            vertices: this.get('vertices'),
            edges: this.get('edges')
        });
        if (_.isUndefined(parser)) {
            throw new Error('Invalid parser: ' + this.get('useParser'));
        }
        result = parser.parse(response);

        return {
            vertices: result.vertices,
            edges: result.edges,
            graphDataFile: this.graphDataFile
        };
    },

    findVertex: function (query) {
        return this.get('vertices').findWhere(query);
    },

    getOutgoingNeighbors: function (vertex) {
        return this.getNeighbors(vertex, false);
    },

    getIncomingNeighbors: function (vertex) {
        return this.getNeighbors(vertex, true);
    },

    getNeighbors: function (vertex, isIncoming) {
        var neighbors = [];

        _.each(this.get('edges').models, function (edge) {
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
                    'edge': edge
                });
            }
        });

        return neighbors;
    }
});

module.exports = {
    Vertex: Vertex,
    Vertices: Vertices,
    Edge: Edge,
    Edges: Edges,
    Graph: Graph
};
