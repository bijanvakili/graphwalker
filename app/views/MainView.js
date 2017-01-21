'use strict';

var Settings = require('app/models/Settings');
var Graph = require('app/models/GraphData').Graph;
var DirectNeighborView = require('app/views/DirectNeighborView');
var ErrorView = require('app/views/ErrorView');
var TextMeasureView = require('app/views/TextMeasureView');
var TypeAheadView = require('app/views/TypeAheadView');


var MainView = Backbone.View.extend({

    el: '.main-view',

    initialize: function (options) {
        this.errorView = new ErrorView();
        this.reportError = this.errorView.registerEmitter(this);

        this.model = null;
        this.textMeasureView = null;
        this.graphView = null;
        this.typeAheadView = null;
    },

    /**
     * Starts the application by fetching the server side data
     *
     * @returns {Promise}
     */
    startApplication: function () {
        var self,
            settings,
            graph;

        self = this;
        settings = new Settings();

        return P.resolve(settings.fetch())
            .catch(function (err) {
                self.rethrowFetchError(settings, err);
            })
            .then(function (model, response, options) {
                graph = new Graph({
                    graphDataFile: settings.get('graphDataFile'),
                    useParser: settings.get('useParser')
                });
                return P.resolve(graph.fetch())
                    .catch(function (err) {
                        self.rethrowFetchError(graph, err);
                    });
            })
            .then(function (model, response, options) {
                self.model = graph;
                return {
                    settings: settings,
                    graph: graph,
                    mainView: self
                };
            });
    },

    render: function (appName, modelName) {
        if (_.isNull(this.textMeasureView)) {
            this.textMeasureView = new TextMeasureView();
            this.textMeasureView.render();
        }

        if (_.isNull(this.typeAheadView)) {
            this.typeAheadView = new TypeAheadView({graph: this.model});
            this.typeAheadView.render();
        }

        if (!_.isNull(this.graphView)) {
            this.graphView.remove();
            this.graphView = null;
        }

        this.graphView = new DirectNeighborView({
            model: this.model,
            errorView: this.errorView,
            textMeasureView: this.textMeasureView
        });
        this.graphView.render({
            appName: appName,
            modelName: modelName
        });
    },

    /**
     * Rethrows a HTTP error from the Backbone.Model.fetch()
     * @param err -- error object return
     * @throws Error
     */
    rethrowFetchError: function (model, err) {
        var urlRoot = _.isFunction(model.urlRoot) ? model.urlRoot() : model.urlRoot;
        var message = err.statusText || err.message;

        throw new Error('Unable to fetch URL ' + urlRoot + ': ' + message);
    }
});

module.exports = MainView;
