'use strict';

var Navigator = Backbone.Router.extend({

    settings: null,
    graph: null,
    view: null,

    routes: {
        ':appName/:model': 'moveToQualifiedVertex',
        ':model':          'moveToUnqualifiedVertex',
        '':                'moveToStartVertex'
    },

    initialize: function (options) {
        this.settings = options.settings;
        this.graph = options.graph;
        this.view = options.mainView;
    },

    moveToStartVertex: function () {
        var startNode = this.settings.get('start');

        this.onMove(startNode['app'], startNode['model']);
    },

    moveToQualifiedVertex: function (appName, modelName) {
        this.onMove(appName, modelName);
    },

    moveToUnqualifiedVertex: function (modelName) {
        var defaultApp;

        defaultApp = this.settings.get('start')['app'];
        this.onMove(defaultApp, modelName);
    },

    onMove: function (appName, modelName) {
        this.view.render(appName, modelName);
    }
});

module.exports = Navigator;
