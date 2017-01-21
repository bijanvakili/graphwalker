'use strict';

var EventHandlers = require('app/EventHandlers');

var Navigator = Backbone.Router.extend({

    routes: {
        ':appName/:model': 'moveToQualifiedVertex',
        ':model':          'moveToUnqualifiedVertex',
        '':                'moveToStartVertex'
    },

    initialize: function (options) {
        this.settings = options.settings;
        this.graph = options.graph;
        this.view = options.mainView;

        this.listenTo(EventHandlers.navigatorChannel, 'vertex:selected', this.onVertexSelected);
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
    },

    onVertexSelected: function (vertexModel) {
        Backbone.history.navigate(
            vertexModel.get('appName') + '/' + vertexModel.get('modelName'),
            true
        );
    }
});

module.exports = Navigator;
