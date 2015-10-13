"use strict";

var Navigator = require('app/routers/Navigator'),
    styles = require('app/styles'),
    init;

init = function(body) {
    FabricStyles.addStyles(styles);

    window.router = new Navigator();
    window.router.startNavigation();
    Backbone.history.start();
};

window.init = init;
