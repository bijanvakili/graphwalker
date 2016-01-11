'use strict';

var DirectNeighborView = require('app/views/DirectNeighborView'),
    Navigator;

Navigator = Backbone.Router.extend({

    settings: null,
    graph: null,
    view: null,

    routes: {
      ":appName/:model": "moveToQualifiedVertex",
      ":model":          "moveToUnqualifiedVertex",
      "":                "moveToStartVertex",
    },

    initialize: function(options) {
        this.settings = options.settings;
        this.graph = options.graph;
    },

    moveToStartVertex: function() {
        var startNode = this.settings.get('start');

        this.onMove(startNode['app'], startNode['model']);
    },

    moveToQualifiedVertex: function(appName, modelName) {
        this.onMove(appName, modelName);
    },

    moveToUnqualifiedVertex: function(modelName) {
        var defaultApp;

        defaultApp = this.settings.get('start')['app'];
        this.onMove(defaultApp, modelName);
    },

    onMove: function(appName, modelName) {
        if (!_.isNull(this.view)) {
            this.view.remove();
        }
        this.view = null;
        this.view = new DirectNeighborView({
            settings: this.settings,
            model: this.graph,
            target: {
                appName: appName,
                modelName: modelName,
            },
        });
        this.view.render($('.walkerContainer')[0]);
    },
});

module.exports = Navigator;
