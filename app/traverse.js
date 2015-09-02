"use strict";

var init,

init = function(body) {
    window.router = new Navigator();
    window.router.startNavigation();
    Backbone.history.start();
};

