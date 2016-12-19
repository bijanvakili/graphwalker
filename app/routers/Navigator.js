'use strict';

var DirectNeighborView = require('app/views/DirectNeighborView');
var TextMeasureView = require('app/views/TextMeasureView');

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
        this.textMeasureView = null;
        this.graphView = null;
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
        if (_.isNull(this.textMeasureView)) {
            this.textMeasureView = new TextMeasureView();
            this.textMeasureView.render();
        }

        if (!_.isNull(this.graphView)) {
            this.graphView.remove();
            this.graphView = null;
        }

        this.graphView = new DirectNeighborView({
            model: this.graph,
            target: {
                appName: appName,
                modelName: modelName
            },
            textMeasureView: this.textMeasureView
        });
        this.graphView.render($('.walkerContainer')[0]);
    }
});

module.exports = Navigator;
