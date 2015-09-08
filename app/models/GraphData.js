'use strict';

var GraphData = Backbone.Model.extend({

    urlRoot: function () {
        return 'data/' + this.get("graphDataFile");
    },

    isInheritanceRelation: function(relation) {
        return relation['type'] == 'inheritance';
    },

    transformRelations: function(relations) {
        return _.map(relations, function (relation) {
            return {
                app: relation['target_app'],
                model: relation['target'],
                type: relation['type'],
            }
        });
    },

    isExistingNode: function(appName, modelName) {
        return _.isObject(this.getNode(appName, modelName));
    },

    getNode: function(appName, modelName) {
        var graphs,
            appGraph,
            modelNode;

        graphs = this.get('graphs');

        // locate the model node
        appGraph = _.find(graphs, function (graph) {
            return graph['app_name'] == appName;
        });
        if (!_.isObject(appGraph)) {
            return undefined;
        }

        modelNode = _.find(appGraph['models'], function (modelNode) {
            return modelNode['name'] == modelName;
        });
        if (!_.isObject(modelNode)) {
            return undefined;
        }

        return modelNode;
    },

    extractOutgoingRelations: function (appName, modelName) {
        var modelNode = this.getNode(appName, modelName);

        // extract and transform the relations
        return this.transformRelations(modelNode['relations']);
    },

    getOutgoingNeigbours: function (appName, modelName) {
        var outgoingNeighbours;

        outgoingNeighbours = this.extractOutgoingRelations(appName, modelName);

        // inherited modules must be excluded
        outgoingNeighbours = _.reject(outgoingNeighbours, this.isInheritanceRelation);
        return outgoingNeighbours;
    },

    getIncomingNeighbours: function (appName, modelName) {
        var graphs,
            inheritedNeighbours,
            incomingNeighbours = [],
            mangledAppName;

        incomingNeighbours = this.extractOutgoingRelations(appName, modelName);
        incomingNeighbours = _.filter(incomingNeighbours, this.isInheritanceRelation);

        // traverse the graph to determine all incoming nodes
        graphs = this.get('graphs');

        // TODO find out why this suffix is required
        mangledAppName = appName + '_models_models';

        _.each(graphs, function (graph) {
            _.each(graph['models'], function (model) {
                _.each(model['relations'], function (relation) {
                    if (relation['target_app'] == mangledAppName && relation['target'] == modelName) {
                        incomingNeighbours.push({
                            app: graph['app_name'],
                            model: model['name'],
                            type: relation['type'],
                        });
                    }
                });
            });
        });

        return incomingNeighbours;
    }
});

module.exports = GraphData;
