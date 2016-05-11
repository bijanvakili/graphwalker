'use strict';

var Settings = require('app/models/Settings');
var Graph = require('app/models/GraphData').Graph;
var Navigator = require('app/routers/Navigator');
var styles = require('app/styles');
var init;

init = function (body) {
    var settings,
        graph;

    SvgStyles.addStyles(styles);

    settings = new Settings();
    return P.resolve(settings.fetch())
        .catch(function () {
            alert('Unable to load settings');
        })
        .then(function (model, response, options) {
            graph = new Graph({
                graphDataFile: settings.get('graphDataFile'),
                useParser: settings.get('useParser')
            });
            return P.resolve(graph.fetch())
                .catch(function () {
                    alert('Unable to load graph');
                });
        })
        .then(function (model, response, options) {
            window.router = new Navigator({
                settings: settings,
                graph: graph
            });

            return Backbone.history.start();
        });
};

window.init = init;
