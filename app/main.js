'use strict';

var MainView = require('app/views/MainView');
var Navigator = require('app/routers/Navigator');
var styles = require('app/styles');
var init;

init = function (body) {
    var view;

    SvgStyles.addStyles(styles);

    view = new MainView();
    return view.startApplication()
        .then(function (results) {
            window.router = new Navigator(results);

            return Backbone.history.start();
        })
        .catch(function (err) {
            view.reportError(err.message);
        });
};

window.init = init;
