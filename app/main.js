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
    settings.fetch({
        error: function (model, response, options) {
            alert('Unable to load settings');
        },
        success: function (model, response, options) {
            graph = new Graph({
                graphDataFile: settings.get('graphDataFile'),
                useParser: settings.get('useParser')
            });
            graph.fetch({
                error: function (model, response, options) {
                    alert('Unable to load graph');
                },
                success: function (model, response, options) {
                    window.router = new Navigator({
                        settings: settings,
                        graph: graph
                    });

                    Backbone.history.start();
                }
            });
        }
    });
};

window.init = init;
