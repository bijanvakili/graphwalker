"use strict";

var Navigator = require('app/routers/Navigator'),
    init;

init = function(body) {
    window.router = new Navigator();
    window.router.startNavigation();
    Backbone.history.start();
};

window.init = init;
