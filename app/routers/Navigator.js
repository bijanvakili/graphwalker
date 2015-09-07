'use strict';

var Settings = require('app/models/Settings'),
    GraphData = require('app/models/GraphData'),
    DirectNeighborView = require('app/views/DirectNeighborView'),
    Navigator;

Navigator = Backbone.Router.extend({

    routes: {
      ":appName/:model": "moveToQualifiedModel",
      ":model": "moveToUnqualifiedModel",
    },

    initialize: function() {
        this.settings = new Settings();
        this.listenTo(this.settings, "change", this.onSettingsLoaded);
    },

    startNavigation: function() {
        this.settings.fetch({
            error: function (model, response, options) {
                alert('Unable to load settings');
            }
        });
    },

    onSettingsLoaded: function() {
        var startNode;

        startNode = this.settings.get('start');
        this.moveToQualifiedModel(startNode['app'], startNode['model']);
    },

    moveToUnqualifiedModel: function(modelName) {
        var defaultApp;

        defaultApp = this.settings.get('start')['app'];
        this.moveToQualifiedModel(defaultApp, modelName);
    },

    moveToQualifiedModel: function(appName, modelName) {
        var graph;

        graph = new GraphData({
            graphDataFile: this.settings.get("graphDataFile"),
        });

        this.view = new DirectNeighborView({
            settings: this.settings,
            model: graph,
            target: {
                app: appName,
                model: modelName,
            },
        });
        graph.fetch();
    },
});

module.exports = Navigator;
