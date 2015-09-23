'use strict';

var Settings = require('app/models/Settings'),
    Graph = require('app/models/GraphData').Graph,
    DirectNeighborView = require('app/views/DirectNeighborView'),
    Navigator;

Navigator = Backbone.Router.extend({

    routes: {
      ":appName/:model": "moveToQualifiedModel",
      ":model": "moveToUnqualifiedModel",
    },

    initialize: function() {
        this.settings = new Settings();
    },

    runWithSettings: function(func) {
        // ensure the settings are loaded
        if (!this.settings.has('graphDataFile')) {
            this.listenToOnce(this.settings, "change", func);
            this.settings.fetch({
                error: function (model, response, options) {
                    alert('Unable to load settings');
                },
            });
        }
        else {
            _.bind(func, this, {})();
        }
    },

    startNavigation: function() {
        this.runWithSettings(function() {
            var startNode = this.settings.get('start');

            this.onMove(startNode['app'], startNode['model']);
        });
    },

    moveToQualifiedModel: function(appName, modelName) {
        this.runWithSettings(function() {
            this.onMove(appName, modelName);
        });
    },

    moveToUnqualifiedModel: function(modelName) {
        this.runWithSettings(function() {
            var defaultApp;

            defaultApp = this.settings.get('start')['app'];
            this.onMove(defaultApp, modelName);
        });
    },

    onMove: function(appName, modelName) {
        var graph;

        graph = new Graph({
            graphDataFile: this.settings.get("graphDataFile"),
        });

        this.view = new DirectNeighborView({
            settings: this.settings,
            model: graph,
            target: {
                appName: appName,
                modelName: modelName,
            },
        });
        graph.fetch();
    },
});

module.exports = Navigator;
