'use strict';

var _,
    $,
    Backbone,
    fabric,
    FabricStyles,
    FabricPatches;

$ = require('jquery');
_ = require('underscore');
Backbone = require('backbone');
Backbone.$ = $;
fabric = require('fabric').fabric;
FabricStyles = require('./lib/fabric.styles');
FabricPatches = require('./lib/fabric.patches');

window.$ = $;
window._ = _;
window.Backbone = Backbone;
window.fabric = fabric;
window.FabricStyles = FabricStyles;
window.FabricPatches = FabricPatches;
