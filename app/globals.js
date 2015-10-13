'use strict';

var _,
    $,
    Backbone,
    fabric,
    FabricStyles;

$ = require('jquery');
_ = require('underscore');
Backbone = require('backbone');
Backbone.$ = $;
fabric = require('fabric').fabric;
FabricStyles = require('./lib/fabric.styles');

window.$ = $;
window._ = _;
window.Backbone = Backbone;
window.fabric = fabric;
window.FabricStyles = FabricStyles;
